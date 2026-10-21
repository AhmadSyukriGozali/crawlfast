"use client";

import { useCallback, useSyncExternalStore } from "react";
import { normalizeWishlist, WISHLIST_EVENT, WISHLIST_KEY } from "@/lib/wishlist";

const EMPTY: number[] = [];
let lastRaw: string | null | undefined;
let cached: number[] = EMPTY;

function readWishlist(): number[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);

    if (raw === lastRaw) return cached;

    lastRaw = raw;
    cached = raw ? normalizeWishlist(JSON.parse(raw)) : EMPTY;
    return cached;
  } catch {
    lastRaw = undefined;
    cached = EMPTY;
    return cached;
  }
}

function subscribe(onStoreChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_KEY || event.key === null) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(WISHLIST_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WISHLIST_EVENT, onStoreChange);
  };
}

function writeWishlist(ids: number[]) {
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(WISHLIST_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function useWishlist() {
  const ids = useSyncExternalStore(subscribe, readWishlist, () => EMPTY);

  const toggle = useCallback((productId: number) => {
    const current = readWishlist();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    return writeWishlist(next);
  }, []);

  const remove = useCallback(
    (productId: number) =>
      writeWishlist(readWishlist().filter((id) => id !== productId)),
    [],
  );

  return {
    ids,
    count: ids.length,
    isSaved: (productId: number) => ids.includes(productId),
    toggle,
    remove,
  };
}
