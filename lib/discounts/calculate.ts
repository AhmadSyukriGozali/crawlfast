import {
  JAKARTA_TIME_ZONE,
  type Discount,
} from "@/lib/discounts/constants";
import { formatRupiah } from "@/lib/format";

export type DiscountResult =
  | { ok: true; amount: number; label: string }
  | { ok: false; error: string };

export function todayInJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDiscountValue(discount: Discount): string {
  if (discount.type === "percentage") {
    return `${discount.value}%`;
  }

  return formatRupiah(discount.value);
}

export function calculateDiscount(
  discount: Discount,
  subtotal: number,
  today = todayInJakarta(),
): DiscountResult {
  if (!discount.isActive) {
    return { ok: false, error: "Kode diskon sedang tidak aktif." };
  }

  if (discount.startsOn && today < discount.startsOn) {
    return { ok: false, error: "Kode diskon belum berlaku." };
  }

  if (discount.endsOn && today > discount.endsOn) {
    return { ok: false, error: "Kode diskon sudah kedaluwarsa." };
  }

  if (discount.minSubtotal > 0 && subtotal < discount.minSubtotal) {
    return {
      ok: false,
      error: `Minimal belanja ${formatRupiah(discount.minSubtotal)} untuk memakai kode ini.`,
    };
  }

  if (
    discount.usageLimit !== null &&
    discount.usageLimit !== undefined &&
    discount.usedCount >= discount.usageLimit
  ) {
    return { ok: false, error: "Kuota kode diskon sudah habis." };
  }

  const rawAmount =
    discount.type === "percentage"
      ? Math.floor((subtotal * discount.value) / 100)
      : discount.value;

  const cappedAmount =
    discount.maxDiscount !== null && discount.maxDiscount !== undefined
      ? Math.min(rawAmount, discount.maxDiscount)
      : rawAmount;

  const amount = Math.min(subtotal, Math.max(0, cappedAmount));

  if (amount <= 0) {
    return { ok: false, error: "Kode diskon tidak menghasilkan potongan." };
  }

  return {
    ok: true,
    amount,
    label:
      discount.type === "percentage"
        ? `Diskon ${discount.value}%`
        : "Diskon nominal",
  };
}
