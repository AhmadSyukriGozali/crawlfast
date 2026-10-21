import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { noStoreJson } from "@/lib/security/request";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

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
    return noStoreJson({ error: auth.error }, { status: auth.status });
  }

  const limit = rateLimit(`admin:order:${auth.user.id}`, 120, 60_000);

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
