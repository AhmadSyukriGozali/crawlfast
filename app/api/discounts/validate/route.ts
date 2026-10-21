import { NextResponse } from "next/server";
import { calculateDiscount } from "@/lib/discounts/calculate";
import {
  getDiscountByCode,
  isMissingDiscountsTable,
} from "@/lib/discounts/data";
import { normalizeDiscountCode } from "@/lib/discounts/validation";
import { DISCOUNT_CODE_PATTERN } from "@/lib/discounts/constants";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import {
  isSameOrigin,
  noStoreJson,
  readJsonBody,
} from "@/lib/security/request";

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

  const limit = rateLimit(
    `discount:validate:${getClientIp(request)}`,
    15,
    5 * 60_000,
  );

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

  const body = bodyResult.data as {
    code?: unknown;
    subtotal?: unknown;
  };

  const code = normalizeDiscountCode(
    typeof body?.code === "string" ? body.code.slice(0, 32) : "",
  );
  const subtotal = Number(body?.subtotal);

  if (!DISCOUNT_CODE_PATTERN.test(code)) {
    return jsonError("Format kode diskon tidak valid.", 400);
  }

  if (
    !Number.isSafeInteger(subtotal) ||
    subtotal < 0 ||
    subtotal > 100_000_000
  ) {
    return jsonError("Subtotal tidak valid.", 400);
  }

  try {
    const discount = await getDiscountByCode(code);

    if (!discount) {
      return noStoreJson(
        { error: "Kode diskon tidak ditemukan atau tidak berlaku." },
        { status: 404 },
      );
    }

    const result = calculateDiscount(discount, subtotal);

    if (!result.ok) {
      return noStoreJson({ error: result.error }, { status: 400 });
    }

    return noStoreJson({
      code: discount.code,
      description: discount.description,
      amount: result.amount,
      label: result.label,
      type: discount.type,
      value: discount.value,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingDiscountsTable(error as { code?: string; message?: string })
    ) {
      return noStoreJson(
        { error: "Layanan diskon belum tersedia." },
        { status: 503 },
      );
    }

    console.error(
      "Discount validation error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Kode diskon gagal diperiksa." },
      { status: 500 },
    );
  }
}
