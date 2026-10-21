import type { PaymentSettings } from "@/lib/payments/types";

export type AdminPaymentSettingsResponse = {
  settings?: PaymentSettings;
  midtransConfigured?: boolean;
  error?: string;
};
