import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { isSameOrigin, readJsonBody } from "@/lib/security/request";
import {
  cleanText,
  isEmail,
  isOrderNumber,
} from "@/lib/security/validate";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Permintaan tidak diizinkan.", 403);
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`track:${ip}`, 10, 5 * 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const bodyResult = await readJsonBody(request, 4 * 1024);

  if (!bodyResult.ok) {
    return jsonError(bodyResult.error, bodyResult.status);
  }

  try {
    const body = bodyResult.data as {
      orderNumber?: unknown;
      email?: unknown;
    };

    const orderNumber = cleanText(body?.orderNumber, 80).toUpperCase();
    const email = cleanText(body?.email, 254).toLowerCase();

    if (!isOrderNumber(orderNumber) || !isEmail(email)) {
      return jsonError("Nomor pesanan atau email tidak valid.", 400);
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
          order_number,
          order_status,
          payment_status,
          total_amount,
          shipping_city,
          shipping_province,
          created_at,
          paid_at,
          order_items (
            product_name,
            size,
            quantity,
            unit_price,
            line_total
          )
        `,
      )
      .ilike("order_number", orderNumber)
      .eq("customer_email", email)
      .maybeSingle();

    if (error) {
      console.error("Order tracking lookup failed:", error.message);
      return jsonError("Status pesanan gagal dimuat.", 500);
    }

    if (!data) {
      return jsonError(
        "Pesanan tidak ditemukan. Periksa nomor pesanan dan email yang digunakan saat checkout.",
        404,
      );
    }

    return NextResponse.json(
      {
        order: {
          orderNumber: data.order_number,
          orderStatus: data.order_status,
          paymentStatus: data.payment_status,
          totalAmount: data.total_amount,
          city: data.shipping_city,
          province: data.shipping_province,
          createdAt: data.created_at,
          paidAt: data.paid_at,
          items: data.order_items ?? [],
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "Order tracking error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonError("Terjadi kesalahan saat memuat status pesanan.", 500);
  }
}
