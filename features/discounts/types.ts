import type { Discount } from "@/lib/discounts/constants";

export type AdminDiscount = Discount;

export type AdminDiscountsResponse = {
  discounts?: AdminDiscount[];
  discount?: AdminDiscount;
  error?: string;
};
