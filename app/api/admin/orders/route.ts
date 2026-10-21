
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { noStoreJson } from "@/lib/security/request";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

const PAGE_SIZE = 20;

const PAYMENT_STATUSES = [
  "pending",
  "settlement",
  "capture",
  "expire",
  "cancel",
  "deny",
] as const;

const ORDER_STATUSES = [
  "pending",
  "pending_payment",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function nextDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  // Batasi percobaan sebelum verifikasi token agar token palsu tidak
  // memicu request tak terbatas ke Supabase Auth.
  const ipLimit = rateLimit(`admin:auth:${getClientIp(request)}`, 120, 60_000);

  if (!ipLimit.allowed) {
    return noStoreJson(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      },
    );
  }

  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return noStoreJson(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const limit = rateLimit(`admin:orders:${auth.user.id}`, 120, 60_000);

  if (!limit.allowed) {
    return noStoreJson(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  try {
    const url = new URL(request.url);
    const rawPage = url.searchParams.get("page") ?? "1";
    const page = Number(rawPage);

    if (!/^[1-9]\d*$/.test(rawPage) || !Number.isSafeInteger(page)) {
      return noStoreJson(
        { error: "Nomor halaman tidak valid." },
        { status: 400 },
      );
    }

    const rawSearch = (url.searchParams.get("search") ?? "")
      .trim()
      .slice(0, 100);

    // Batasi karakter untuk menghindari kerusakan sintaks filter PostgREST.
    const search = rawSearch
      .replace(/[^\p{L}\p{N}@.+\-\s]/gu, " ")
      .trim();

    const paymentStatus = (
      url.searchParams.get("paymentStatus") ?? "all"
    ).trim().toLowerCase();

    const orderStatus = (
      url.searchParams.get("orderStatus") ?? "all"
    ).trim().toLowerCase();

    if (
      paymentStatus !== "all" &&
      !PAYMENT_STATUSES.includes(
        paymentStatus as (typeof PAYMENT_STATUSES)[number],
      )
    ) {
      return noStoreJson(
        { error: "Status pembayaran tidak valid." },
        { status: 400 },
      );
    }

    if (
      orderStatus !== "all" &&
      !ORDER_STATUSES.includes(
        orderStatus as (typeof ORDER_STATUSES)[number],
      )
    ) {
      return noStoreJson(
        { error: "Status pesanan tidak valid." },
        { status: 400 },
      );
    }

    const dateFrom = url.searchParams.get("dateFrom") ?? "";
    const dateTo = url.searchParams.get("dateTo") ?? "";

    if (
      (dateFrom && !isValidDate(dateFrom)) ||
      (dateTo && !isValidDate(dateTo))
    ) {
      return noStoreJson(
        { error: "Format tanggal tidak valid." },
        { status: 400 },
      );
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      return noStoreJson(
        { error: "Tanggal awal tidak boleh melewati tanggal akhir." },
        { status: 400 },
      );
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
      return noStoreJson(
        { error: "Nomor halaman terlalu besar." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    let query = supabase
      .from("orders")
      .select(
        `
          id, order_number, customer_name, customer_email, customer_phone,
          shipping_city, shipping_province, subtotal, shipping_cost,
          total_amount, currency, order_status, payment_status,
          payment_gateway, created_at, paid_at,
          order_items (
            id, product_name, size, unit_price, quantity, line_total
          )
        `,
        { count: "exact" },
      );

    if (search) {
      query = query.or(
        [
          `order_number.ilike.%${search}%`,
          `customer_name.ilike.%${search}%`,
          `customer_email.ilike.%${search}%`,
          `customer_phone.ilike.%${search}%`,
        ].join(","),
      );
    }

    if (paymentStatus !== "all") {
      query = query.eq("payment_status", paymentStatus);
    }

    if (orderStatus !== "all") {
      query = query.eq("order_status", orderStatus);
    }

    // Rentang tanggal menggunakan waktu lokal Jakarta (UTC+7).
    if (dateFrom) {
      query = query.gte(
        "created_at",
        `${dateFrom}T00:00:00+07:00`,
      );
    }

    if (dateTo) {
      query = query.lt(
        "created_at",
        `${nextDate(dateTo)}T00:00:00+07:00`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to load admin orders:", error.message);

      return noStoreJson(
        { error: "Data pesanan gagal dimuat." },
        { status: 500 },
      );
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (page > Math.max(totalPages, 1)) {
      return noStoreJson(
        { error: "Halaman pesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({
      orders: data ?? [],
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Admin orders error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat mengambil pesanan." },
      { status: 500 },
    );
  }
}
