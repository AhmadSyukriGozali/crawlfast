import "server-only";

import { DEFAULT_WHATSAPP_TEMPLATE } from "@/lib/payments/constants";
import type {
  PaymentSettings,
  PaymentSettingsRow,
} from "@/lib/payments/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const PAYMENT_SETTINGS_SELECT = `
  id,
  midtrans_enabled,
  whatsapp_enabled,
  whatsapp_number,
  whatsapp_template,
  updated_at
`;

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export function isMissingPaymentSettingsTable(
  error: SupabaseErrorLike,
): boolean {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table ['"]?public\.payment_settings/i.test(
      error.message ?? "",
    ) ||
    /relation ['"]?public\.payment_settings['"]? does not exist/i.test(
      error.message ?? "",
    )
  );
}

export function toPaymentSettings(row: PaymentSettingsRow): PaymentSettings {
  return {
    midtransEnabled: row.midtrans_enabled !== false,
    whatsappEnabled: row.whatsapp_enabled === true,
    whatsappNumber: row.whatsapp_number ?? "",
    whatsappTemplate: row.whatsapp_template || DEFAULT_WHATSAPP_TEMPLATE,
    updatedAt:
      typeof row.updated_at === "string" ? row.updated_at.slice(0, 10) : "",
  };
}

function fallbackPaymentSettings(): PaymentSettings {
  return {
    midtransEnabled: Boolean(process.env.MIDTRANS_SERVER_KEY),
    whatsappEnabled: false,
    whatsappNumber: "",
    whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
    updatedAt: "",
  };
}

/**
 * Dipakai checkout server-side. Jika tabel belum dibuat, Midtrans tetap
 * tersedia selama server key ada agar storefront tidak langsung rusak.
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_settings")
      .select(PAYMENT_SETTINGS_SELECT)
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      if (isMissingPaymentSettingsTable(error)) {
        return fallbackPaymentSettings();
      }

      throw error;
    }

    if (!data) return fallbackPaymentSettings();

    return toPaymentSettings(data as unknown as PaymentSettingsRow);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingPaymentSettingsTable(error as SupabaseErrorLike)
    ) {
      return fallbackPaymentSettings();
    }

    throw error;
  }
}

export async function getAdminPaymentSettings(): Promise<PaymentSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_settings")
    .select(PAYMENT_SETTINGS_SELECT)
    .eq("id", "default")
    .maybeSingle();

  if (error) throw error;
  if (!data) return fallbackPaymentSettings();

  return toPaymentSettings(data as unknown as PaymentSettingsRow);
}
