import { guardAdminApi } from "@/lib/admin/guard";
import { noStoreJson, readJsonBody } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PAYMENT_SETTINGS_SELECT,
  getAdminPaymentSettings,
  isMissingPaymentSettingsTable,
  toPaymentSettings,
} from "@/lib/payments/data";
import type { PaymentSettingsRow } from "@/lib/payments/types";
import { PAYMENT_SETTINGS_TABLE_MISSING_MESSAGE } from "@/lib/payments/constants";
import { parsePaymentSettingsInput } from "@/lib/payments/validation";

export async function GET(request: Request) {
  const guard = await guardAdminApi(request, "payments", 120);

  if (!guard.ok) return guard.response;

  try {
    const settings = await getAdminPaymentSettings();

    return noStoreJson({
      settings,
      midtransConfigured: Boolean(process.env.MIDTRANS_SERVER_KEY),
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingPaymentSettingsTable(error as { code?: string; message?: string })
    ) {
      return noStoreJson(
        { error: PAYMENT_SETTINGS_TABLE_MISSING_MESSAGE },
        { status: 503 },
      );
    }

    console.error(
      "Admin payment settings error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Pengaturan pembayaran gagal dimuat." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const guard = await guardAdminApi(request, "payments-write", 60);

  if (!guard.ok) return guard.response;

  const bodyResult = await readJsonBody(request, 32 * 1024);

  if (!bodyResult.ok) {
    return noStoreJson(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const parsed = parsePaymentSettingsInput(bodyResult.data);

  if (!parsed.ok) {
    return noStoreJson({ error: parsed.error }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_settings")
      .upsert(
        {
          id: "default",
          midtrans_enabled: parsed.value.midtransEnabled,
          whatsapp_enabled: parsed.value.whatsappEnabled,
          whatsapp_number: parsed.value.whatsappNumber,
          whatsapp_template: parsed.value.whatsappTemplate,
        },
        { onConflict: "id" },
      )
      .select(PAYMENT_SETTINGS_SELECT)
      .single();

    if (error) {
      if (isMissingPaymentSettingsTable(error)) {
        return noStoreJson(
          { error: PAYMENT_SETTINGS_TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      if (error.code === "23514") {
        return noStoreJson(
          { error: "Nomor WhatsApp atau template tidak valid." },
          { status: 400 },
        );
      }

      console.error("Failed to save payment settings:", error.message);
      return noStoreJson(
        { error: "Pengaturan pembayaran gagal disimpan." },
        { status: 500 },
      );
    }

    return noStoreJson({
      settings: toPaymentSettings(data as unknown as PaymentSettingsRow),
      midtransConfigured: Boolean(process.env.MIDTRANS_SERVER_KEY),
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingPaymentSettingsTable(error as { code?: string; message?: string })
    ) {
      return noStoreJson(
        { error: PAYMENT_SETTINGS_TABLE_MISSING_MESSAGE },
        { status: 503 },
      );
    }

    console.error(
      "Update payment settings error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menyimpan pengaturan pembayaran." },
      { status: 500 },
    );
  }
}
