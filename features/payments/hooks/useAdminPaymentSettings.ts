"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/features/admin/useAdminSession";
import type { AdminPaymentSettingsResponse } from "@/features/payments/types";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import type { PaymentSettings } from "@/lib/payments/types";

export function useAdminPaymentSettings() {
  const router = useRouter();
  const session = useAdminSession();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [midtransConfigured, setMidtransConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/payments");

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
        .catch(() => null)) as AdminPaymentSettingsResponse | null;

      if (!response.ok || !result?.settings) {
        throw new Error(
          result?.error || "Pengaturan pembayaran gagal dimuat.",
        );
      }

      setSettings(result.settings);
      setMidtransConfigured(result.midtransConfigured === true);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Pengaturan pembayaran gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (session.loading) return;

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) return loadSettings();
    });

    return () => {
      cancelled = true;
    };
  }, [loadSettings, session.loading]);

  const saveSettings = useCallback(
    async (input: PaymentSettings): Promise<boolean> => {
      setError("");

      const response = await adminFetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          midtransEnabled: input.midtransEnabled,
          whatsappEnabled: input.whatsappEnabled,
          whatsappNumber: input.whatsappNumber,
          whatsappTemplate: input.whatsappTemplate,
        }),
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

      const result = (await response.json().catch(() => null)) as
        | AdminPaymentSettingsResponse
        | null;

      if (!response.ok || !result?.settings) {
        setError(result?.error || "Pengaturan pembayaran gagal disimpan.");
        return false;
      }

      setSettings(result.settings);
      setMidtransConfigured(result.midtransConfigured === true);
      return true;
    },
    [router],
  );

  return {
    email: session.email,
    settings,
    midtransConfigured,
    loading: session.loading || loading,
    error: session.error || error,
    logout: session.logout,
    loadSettings,
    saveSettings,
  };
}
