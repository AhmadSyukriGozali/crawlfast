"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Order } from "@/features/orders/types";

type OrderDetailResponse = {
  order?: Order;
  error?: string;
};

export function useAdminOrderDetail(id: string) {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        router.replace("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      };

      const adminResponse = await fetch("/api/admin/me", {
        headers,
        cache: "no-store",
      });

      if (
        adminResponse.status === 401 ||
        adminResponse.status === 403
      ) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const adminResult = await adminResponse.json();

      if (!adminResponse.ok) {
        throw new Error(
          adminResult.error || "Akses admin ditolak.",
        );
      }

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(id)}`,
        {
          headers,
          cache: "no-store",
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const result =
        (await response.json()) as OrderDetailResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Detail pesanan gagal dimuat.",
        );
      }

      if (!result.order) {
        throw new Error("Data pesanan tidak ditemukan.");
      }

      setOrder(result.order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadOrder();
    });

    return () => {
      cancelled = true;
    };
  }, [loadOrder]);

  return {
    order,
    loading,
    error,
    loadOrder,
  };
}