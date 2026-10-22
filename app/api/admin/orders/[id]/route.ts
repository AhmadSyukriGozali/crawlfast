import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { noStoreJson, readJsonBody } from "@/lib/security/request";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { guardAdminApi } from "@/lib/admin/guard";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

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

const PAID_PAYMENT_STATUSES = new Set(["settlement", "capture"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function orderDetailSelect(includeDiscount: boolean): string {
  return `
    id,
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    shipping_city,
    shipping_province,
    shipping_postal_code,
    customer_notes,
    subtotal,
    shipping_cost,
    ${includeDiscount ? "discount_code, discount_amount," : ""}
    total_amount,
    currency,
    order_status,
    payment_status,
    payment_gateway,
    created_at,
    paid_at,
    order_items (
      id,
      product_name,
      size,
      unit_price,
      quantity,
      line_total
    )
  `;
}

export async function GET(request: Request, context: RouteContext) {
  // Batasi percobaan sebelum verifikasi token agar token palsu tidak
  // memicu request tak terbatas ke Supabase Auth.
  const ipLimit = await rateLimit(
    `admin:auth:${getClientIp(request)}`,
    120,
    60_000,
  );

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
    return noStoreJson({ error: auth.error }, { status: auth.status });
  }

  const limit = await rateLimit(`admin:order:${auth.user.id}`, 120, 60_000);

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
    const { id } = await context.params;

    if (!id || !SAFE_ID.test(id)) {
      return noStoreJson(
        { error: "ID pesanan tidak valid." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    let result = await supabase
      .from("orders")
      .select(orderDetailSelect(true))
      .eq("id", id)
      .maybeSingle();

    // Kompatibilitas sebelum migrasi diskon dijalankan.
    if (result.error?.code === "42703") {
      result = await supabase
        .from("orders")
        .select(orderDetailSelect(false))
        .eq("id", id)
        .maybeSingle();
    }

    const { data, error } = result;

    if (error) {
      console.error("Failed to load admin order detail:", error.message);

      return noStoreJson(
        { error: "Detail pesanan gagal dimuat." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({ order: data });
  } catch (error) {
    console.error(
      "Admin order detail error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat mengambil detail pesanan." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "orders-write", 60);

  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!id || !SAFE_ID.test(id)) {
    return noStoreJson({ error: "ID pesanan tidak valid." }, { status: 400 });
  }

  const bodyResult = await readJsonBody(request, 8 * 1024);

  if (!bodyResult.ok) {
    return noStoreJson(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  if (!isRecord(bodyResult.data)) {
    return noStoreJson(
      { error: "Data status pesanan tidak valid." },
      { status: 400 },
    );
  }

  const paymentStatus =
    typeof bodyResult.data.paymentStatus === "string"
      ? bodyResult.data.paymentStatus.trim().toLowerCase()
      : "";
  const orderStatus =
    typeof bodyResult.data.orderStatus === "string"
      ? bodyResult.data.orderStatus.trim().toLowerCase()
      : "";

  if (
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
    !ORDER_STATUSES.includes(orderStatus as (typeof ORDER_STATUSES)[number])
  ) {
    return noStoreJson(
      { error: "Status pesanan tidak valid." },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const { data: existing, error: readError } = await supabase
      .from("orders")
      .select("id, paid_at")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      console.error("Failed to read order for status update:", readError.message);
      return noStoreJson(
        { error: "Status pesanan gagal diperbarui." },
        { status: 500 },
      );
    }

    if (!existing) {
      return noStoreJson(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    const isPaid = PAID_PAYMENT_STATUSES.has(paymentStatus);
    const paidAt = isPaid
      ? existing.paid_at ?? new Date().toISOString()
      : null;

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        order_status: orderStatus,
        paid_at: paidAt,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update order status:", updateError.message);
      return noStoreJson(
        { error: "Status pesanan gagal diperbarui." },
        { status: 500 },
      );
    }

    return noStoreJson({
      ok: true,
      payment_status: paymentStatus,
      order_status: orderStatus,
      paid_at: paidAt,
    });
  } catch (error) {
    console.error(
      "Admin order status update error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memperbarui status pesanan." },
      { status: 500 },
    );
  }
}
