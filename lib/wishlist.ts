import { PRODUCTS } from "@/lib/catalog";

export const WISHLIST_KEY = "crawlfast-wishlist";
export const WISHLIST_EVENT = "crawlfast-wishlist-updated";

const PRODUCT_IDS = new Set(PRODUCTS.map((product) => product.id));

export function normalizeWishlist(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const unique = new Set<number>();

  for (const rawId of value) {
    const id = Number(rawId);
    if (Number.isInteger(id) && PRODUCT_IDS.has(id)) unique.add(id);
  }

  return Array.from(unique);
}
