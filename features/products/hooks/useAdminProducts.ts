"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/features/admin/useAdminSession";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import type {
  AdminProduct,
  AdminProductsResponse,
} from "@/features/products/types";

export function useAdminProducts() {
  const router = useRouter();
  const session = useAdminSession();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/products");

      if (!response) {
        router.replace("/login");
        return;
      }

      if (response.status === 401 || response.status === 403) {
        await signOutAdmin();
        router.replace("/login");
        return;
      }

      const result = (await response
        .json()
        .catch(() => null)) as AdminProductsResponse | null;

      if (!response.ok) {
        throw new Error(result?.error || "Produk gagal dimuat.");
      }

      setProducts(result?.products ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Produk gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (session.loading) return;

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadProducts();
    });

    return () => {
      cancelled = true;
    };
  }, [loadProducts, session.loading]);

  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      const response = await adminFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response) {
        router.replace("/login");
        return false;
      }

      if (response.status === 401 || response.status === 403) {
        await signOutAdmin();
        router.replace("/login");
        return false;
      }

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(result?.error || "Produk gagal dihapus.");
        return false;
      }

      await loadProducts();
      return true;
    },
    [loadProducts, router],
  );

  return {
    email: session.email,
    products,
    loading: session.loading || loading,
    error: session.error || error,
    logout: session.logout,
    loadProducts,
    deleteProduct,
  };
}
