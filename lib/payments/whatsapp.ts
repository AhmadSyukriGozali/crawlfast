import { formatRupiah } from "@/lib/format";

export type WhatsAppTemplateValues = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: string;
  subtotal: string;
  shipping: string;
  discount: string;
  total: string;
  shipping_address: string;
  notes: string;
};

export function normalizeWhatsAppNumber(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  }

  return digits;
}

export function isValidWhatsAppNumber(value: string): boolean {
  return /^[1-9][0-9]{7,14}$/.test(value);
}

export function renderWhatsAppTemplate(
  template: string,
  values: WhatsAppTemplateValues,
): string {
  return template.replace(/\{([a-z_]+)\}/g, (match, key: string) => {
    const replacement = values[key as keyof WhatsAppTemplateValues];
    return replacement ?? match;
  });
}

export function buildWhatsAppUrl(
  number: string,
  message: string,
): string | null {
  const normalized = normalizeWhatsAppNumber(number);

  if (!isValidWhatsAppNumber(normalized)) return null;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function formatWhatsAppItems(
  items: readonly {
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
  }[],
): string {
  return items
    .map(
      (item) =>
        `- ${item.product_name} (${item.size}) x${item.quantity} = ${formatRupiah(
          item.unit_price * item.quantity,
        )}`,
    )
    .join("\n");
}
