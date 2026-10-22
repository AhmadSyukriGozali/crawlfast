import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/payments/data";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limit = await rateLimit(
    `payment-methods:${getClientIp(request)}`,
    120,
    60_000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  try {
    const settings = await getPaymentSettings();

    return NextResponse.json(
      {
        midtransEnabled:
          settings.midtransEnabled &&
          Boolean(process.env.MIDTRANS_SERVER_KEY),
        whatsappEnabled:
          settings.whatsappEnabled && Boolean(settings.whatsappNumber),
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
      "Payment methods error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Metode pembayaran gagal dimuat." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
