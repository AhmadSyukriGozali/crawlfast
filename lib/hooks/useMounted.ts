"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Mengembalikan false saat SSR dan true setelah hidrasi.
 * Dipakai untuk mencegah flash konten kosong pada data localStorage.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
