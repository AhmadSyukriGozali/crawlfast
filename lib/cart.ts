import { getProductById, isProductSize, PRODUCTS } from "@/lib/catalog";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/shipping";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};

export type LegacyCartItem = {
  productId?: unknown;
  name?: unknown;
  price?: unknown;
  image?: unknown;
  size?: unknown;
  quantity?: unknown;
};

export const CART_KEY = "crawlfast-cart";
export const CART_EVENT = "crawlfast-cart-updated";
export const MAX_CART_LINES = 30;

const PRODUCT_IDS = new Set(PRODUCTS.map((product) => product.id));

export function normalizeCartItem(value: unknown): CartItem | null {
  if (value === null || typeof value !== "object") return null;

  const item = value as LegacyCartItem;
  const productId = Number(item.productId);
  const product = getProductById(productId);

  if (!product || !PRODUCT_IDS.has(productId)) return null;

  const size = typeof item.size === "string" ? item.size.trim() : "";
  if (!isProductSize(size) || !product.sizes.includes(size)) return null;

  const quantity = Math.floor(Number(item.quantity));
  if (!Number.isInteger(quantity) || quantity < 1) return null;

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    size,
    quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
  };
}

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const merged = new Map<string, CartItem>();

  for (const rawItem of value) {
    const item = normalizeCartItem(rawItem);
    if (!item) continue;

    const key = `${item.productId}:${item.size}`;
    const existing = merged.get(key);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + item.quantity,
        MAX_QUANTITY_PER_ITEM,
      );
    } else {
      merged.set(key, item);
    }
  }

  return Array.from(merged.values()).slice(0, MAX_CART_LINES);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function addItemToCart(
  items: CartItem[],
  productId: number,
  size: string,
  quantity = 1,
): CartItem[] {
  const product = getProductById(productId);
  if (!product || !isProductSize(size) || !product.sizes.includes(size)) {
    return items;
  }

  const safeQuantity = Math.min(
    Math.max(1, Math.floor(quantity)),
    MAX_QUANTITY_PER_ITEM,
  );

  const existingIndex = items.findIndex(
    (item) => item.productId === product.id && item.size === size,
  );

  if (existingIndex === -1) {
    return [
      ...items,
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity: safeQuantity,
      },
    ].slice(0, MAX_CART_LINES);
  }

  return items.map((item, index) =>
    index === existingIndex
      ? {
          ...item,
          quantity: Math.min(
            item.quantity + safeQuantity,
            MAX_QUANTITY_PER_ITEM,
          ),
        }
      : item,
  );
}

export function updateCartQuantity(
  items: CartItem[],
  productId: number,
  size: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return items.filter(
      (item) => !(item.productId === productId && item.size === size),
    );
  }

  return items.map((item) =>
    item.productId === productId && item.size === size
      ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }
      : item,
  );
}

export function removeCartItem(
  items: CartItem[],
  productId: number,
  size: string,
): CartItem[] {
  return items.filter(
    (item) => !(item.productId === productId && item.size === size),
  );
}
