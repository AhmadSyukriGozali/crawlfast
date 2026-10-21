
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type {
  AdminMeResponse,
  AdminOrdersResponse,
  Order,
} from "@/features/orders/types";

const PAGE_SIZE = 20;

export type AdminOrderFilters = {
  search: string;
  paymentStatus: string;
  orderStatus: string;
  dateFrom: string;
  dateTo: string;
};

export function useAdminOrders(filters: AdminOrderFilters) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadOrders = useCallback(
    async (requestedPage = page) => {
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

        const adminResult =
          (await adminResponse.json()) as AdminMeResponse;

        if (!adminResponse.ok) {
          throw new Error(
            adminResult.error || "Akses admin ditolak.",
          );
        }

        setEmail(adminResult.email ?? "");

        const params = new URLSearchParams({
          page: String(requestedPage),
          search: filters.search,
          paymentStatus: filters.paymentStatus,
          orderStatus: filters.orderStatus,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        const response = await fetch(
          `/api/admin/orders?${params.toString()}`,
          {
            headers,
            cache: "no-store",
          },
        );

        if (response.status === 401 || response.status === 403) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        const result =
          (await response.json()) as AdminOrdersResponse;

        if (!response.ok) {
          throw new Error(
            result.error || "Pesanan gagal dimuat.",
          );
        }

        setOrders(result.orders ?? []);
        setPage(result.pagination?.page ?? requestedPage);
        setTotalCount(result.pagination?.totalCount ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 0);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan.",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, page, router],
  );

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadOrders();
    });

    return () => {
      cancelled = true;
    };
  }, [loadOrders]);

  const logout = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }, [router]);

  return {
    email,
    orders,
    loading,
    error,
    page,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages,
    setPage,
    loadOrders,
    logout,
  };
}
