export const WISHLIST_KEY = "crawlfast-wishlist";
export const WISHLIST_EVENT = "crawlfast-wishlist-updated";

export function normalizeWishlist(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const unique = new Set<number>();

  for (const rawId of value) {
    const id = Number(rawId);
    if (Number.isInteger(id) && id > 0) unique.add(id);
  }

  return Array.from(unique);
}
