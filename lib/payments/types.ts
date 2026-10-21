export type PaymentMethod = "midtrans" | "whatsapp";

export type PaymentSettings = {
  midtransEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappTemplate: string;
  updatedAt: string;
};

export type PaymentSettingsInput = {
  midtransEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappTemplate: string;
};

export type PaymentSettingsRow = {
  id: string;
  midtrans_enabled: boolean | null;
  whatsapp_enabled: boolean | null;
  whatsapp_number: string | null;
  whatsapp_template: string | null;
  updated_at: string | null;
};
