export const SHIPPING_COST = 15_000;
export const FREE_SHIPPING_THRESHOLD = 500_000;
export const MAX_QUANTITY_PER_ITEM = 20;

export function calculateShipping(subtotal: number): number {
  const safeSubtotal = Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0;
  return safeSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function calculateTotal(subtotal: number): number {
  return Math.max(0, subtotal) + calculateShipping(subtotal);
}

export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - Math.max(0, subtotal));
}
