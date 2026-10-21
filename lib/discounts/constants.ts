export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,31}$/;
export const JAKARTA_TIME_ZONE = "Asia/Jakarta";

export type Discount = {
  id: string;
  code: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  startsOn?: string | null;
  endsOn?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DiscountInput = {
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  startsOn: string | null;
  endsOn: string | null;
  usageLimit: number | null;
  isActive: boolean;
};
