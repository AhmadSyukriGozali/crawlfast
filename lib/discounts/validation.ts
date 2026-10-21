import {
  DISCOUNT_CODE_PATTERN,
  DISCOUNT_TYPES,
  type DiscountInput,
  type DiscountType,
} from "@/lib/discounts/constants";

type ParseResult =
  | { ok: true; value: DiscountInput }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function integer(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function normalizeDiscountCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

export function parseDiscountInput(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Data diskon tidak valid." };
  }

  const code = normalizeDiscountCode(text(value.code, 32));

  if (!DISCOUNT_CODE_PATTERN.test(code)) {
    return {
      ok: false,
      error:
        "Kode diskon 3–32 karakter, hanya huruf, angka, dan tanda hubung.",
    };
  }

  const type = text(value.type, 20) as DiscountType;

  if (!DISCOUNT_TYPES.includes(type)) {
    return { ok: false, error: "Tipe diskon tidak valid." };
  }

  const discountValue = integer(value.value);

  if (type === "percentage") {
    if (
      discountValue === null ||
      discountValue < 1 ||
      discountValue > 100
    ) {
      return { ok: false, error: "Diskon persen harus antara 1 dan 100." };
    }
  } else if (
    discountValue === null ||
    discountValue < 1_000 ||
    discountValue > 100_000_000
  ) {
    return {
      ok: false,
      error: "Diskon nominal harus antara Rp 1.000 dan Rp 100.000.000.",
    };
  }

  const minSubtotal = integer(value.minSubtotal) ?? 0;

  if (minSubtotal < 0 || minSubtotal > 100_000_000) {
    return { ok: false, error: "Minimal belanja tidak valid." };
  }

  const rawMaxDiscount = integer(value.maxDiscount);
  const maxDiscount =
    type === "percentage" && rawMaxDiscount !== null && rawMaxDiscount > 0
      ? Math.min(rawMaxDiscount, 100_000_000)
      : null;

  const startsOn = text(value.startsOn, 10) || null;
  const endsOn = text(value.endsOn, 10) || null;

  if (
    (startsOn && !isValidDate(startsOn)) ||
    (endsOn && !isValidDate(endsOn))
  ) {
    return { ok: false, error: "Format tanggal diskon tidak valid." };
  }

  if (startsOn && endsOn && startsOn > endsOn) {
    return {
      ok: false,
      error: "Tanggal mulai tidak boleh melewati tanggal berakhir.",
    };
  }

  const usageLimit = integer(value.usageLimit);

  if (
    usageLimit !== null &&
    (usageLimit < 1 || usageLimit > 1_000_000)
  ) {
    return { ok: false, error: "Kuota pemakaian tidak valid." };
  }

  return {
    ok: true,
    value: {
      code,
      description: text(value.description, 300),
      type,
      value: discountValue as number,
      minSubtotal,
      maxDiscount,
      startsOn,
      endsOn,
      usageLimit,
      isActive: value.isActive !== false,
    },
  };
}
