"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminFetch,
  signOutAdmin,
} from "@/lib/admin/client";

export function useAdminSession() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/me");

      if (!response) {
        router.replace("/login");
        return;
      }

      if (response.status === 401 || response.status === 403) {
        await signOutAdmin();
        router.replace("/login");
        return;
      }

      const result = (await response.json().catch(() => null)) as {
        email?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Sesi admin gagal diperiksa.");
      }

      setEmail(result?.email ?? "");
    } catch (sessionError) {
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "Sesi admin gagal diperiksa.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadSession();
    });

    return () => {
      cancelled = true;
    };
  }, [loadSession]);

  const logout = useCallback(async () => {
    await signOutAdmin();
    router.replace("/login");
    router.refresh();
  }, [router]);

  return { email, loading, error, logout, reload: loadSession };
}
