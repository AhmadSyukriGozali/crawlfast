"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/features/admin/useAdminSession";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import type {
  AdminCategoriesResponse,
  AdminCategory,
} from "@/features/categories/types";

export function useAdminCategories() {
  const router = useRouter();
  const session = useAdminSession();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/categories");

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
        .catch(() => null)) as AdminCategoriesResponse | null;

      if (!response.ok) {
        throw new Error(result?.error || "Kategori gagal dimuat.");
      }

      setCategories(result?.categories ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Kategori gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (session.loading) return;

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadCategories();
    });

    return () => {
      cancelled = true;
    };
  }, [loadCategories, session.loading]);

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      const response = await adminFetch(`/api/admin/categories/${id}`, {
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
        setError(result?.error || "Kategori gagal dihapus.");
        return false;
      }

      await loadCategories();
      return true;
    },
    [loadCategories, router],
  );

  return {
    email: session.email,
    categories,
    loading: session.loading || loading,
    error: session.error || error,
    logout: session.logout,
    loadCategories,
    deleteCategory,
  };
}
