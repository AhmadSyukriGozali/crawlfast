import type { PaymentSettingsInput } from "@/lib/payments/types";
import {
  DEFAULT_WHATSAPP_TEMPLATE,
} from "@/lib/payments/constants";
import {
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
} from "@/lib/payments/whatsapp";

type ParseResult =
  | { ok: true; value: PaymentSettingsInput }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parsePaymentSettingsInput(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Data pengaturan pembayaran tidak valid." };
  }

  const midtransEnabled = value.midtransEnabled !== false;
  const whatsappEnabled = value.whatsappEnabled === true;
  const whatsappNumber = normalizeWhatsAppNumber(
    text(value.whatsappNumber, 30),
  );
  const whatsappTemplate =
    text(value.whatsappTemplate, 2_000) || DEFAULT_WHATSAPP_TEMPLATE;

  if (!midtransEnabled && !whatsappEnabled) {
    return {
      ok: false,
      error: "Aktifkan minimal satu metode pembayaran.",
    };
  }

  if (whatsappNumber && !isValidWhatsAppNumber(whatsappNumber)) {
    return {
      ok: false,
      error:
        "Nomor WhatsApp tidak valid. Gunakan format 08xx atau 62xx (8–15 digit).",
    };
  }

  if (whatsappEnabled && !whatsappNumber) {
    return {
      ok: false,
      error: "Nomor WhatsApp admin wajib diisi jika metode WhatsApp aktif.",
    };
  }

  if (whatsappTemplate.length < 10) {
    return { ok: false, error: "Template WhatsApp terlalu pendek." };
  }

  return {
    ok: true,
    value: {
      midtransEnabled,
      whatsappEnabled,
      whatsappNumber,
      whatsappTemplate,
    },
  };
}
