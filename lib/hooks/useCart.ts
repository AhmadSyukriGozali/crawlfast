"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  CART_EVENT,
  CART_KEY,
  addItemToCart,
  cartCount,
  cartSubtotal,
  normalizeCart,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";
import type { Product } from "@/lib/catalog";

const EMPTY_CART: CartItem[] = [];
let lastRaw: string | null | undefined;
let cachedCart: CartItem[] = EMPTY_CART;

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);

    if (raw === lastRaw) return cachedCart;

    lastRaw = raw;
    cachedCart = raw ? normalizeCart(JSON.parse(raw)) : EMPTY_CART;
    return cachedCart;
  } catch {
    lastRaw = undefined;
    cachedCart = EMPTY_CART;
    return cachedCart;
  }
}

function subscribe(onStoreChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY || event.key === null) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_EVENT, onStoreChange);
  };
}

function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);

  const addItem = useCallback(
    (product: Product, size: string, quantity = 1) =>
      writeCart(addItemToCart(readCart(), product, size, quantity)),
    [],
  );

  const setQuantity = useCallback(
    (productId: number, size: string, quantity: number) =>
      writeCart(updateCartQuantity(readCart(), productId, size, quantity)),
    [],
  );

  const removeItem = useCallback(
    (productId: number, size: string) =>
      writeCart(removeCartItem(readCart(), productId, size)),
    [],
  );

  const clearCart = useCallback(() => writeCart([]), []);

  return {
    items,
    totalItems: cartCount(items),
    subtotal: cartSubtotal(items),
    addItem,
    setQuantity,
    removeItem,
    clearCart,
  };
}
