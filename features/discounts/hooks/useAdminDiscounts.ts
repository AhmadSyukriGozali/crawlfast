"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/features/admin/useAdminSession";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import type {
  AdminDiscount,
  AdminDiscountsResponse,
} from "@/features/discounts/types";

export function useAdminDiscounts() {
  const router = useRouter();
  const session = useAdminSession();
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/discounts");

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
        .catch(() => null)) as AdminDiscountsResponse | null;

      if (!response.ok) {
        throw new Error(result?.error || "Diskon gagal dimuat.");
      }

      setDiscounts(result?.discounts ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Diskon gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (session.loading) return;

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadDiscounts();
    });

    return () => {
      cancelled = true;
    };
  }, [loadDiscounts, session.loading]);

  const deleteDiscount = useCallback(
    async (id: string): Promise<boolean> => {
      const response = await adminFetch(`/api/admin/discounts/${id}`, {
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
        setError(result?.error || "Diskon gagal dihapus.");
        return false;
      }

      await loadDiscounts();
      return true;
    },
    [loadDiscounts, router],
  );

  return {
    email: session.email,
    discounts,
    loading: session.loading || loading,
    error: session.error || error,
    logout: session.logout,
    loadDiscounts,
    deleteDiscount,
  };
}
