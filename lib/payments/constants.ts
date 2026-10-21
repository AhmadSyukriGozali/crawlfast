export const PAYMENT_SETTINGS_TABLE_MISSING_MESSAGE =
  "Tabel payment_settings belum dibuat. Jalankan migrasi supabase/migrations/003_payment_settings.sql terlebih dahulu.";

export const DEFAULT_WHATSAPP_TEMPLATE = `Halo CRAWLFAST, saya ingin konfirmasi pesanan.

No. Pesanan: {order_number}
Nama: {customer_name}
No. HP: {customer_phone}

Detail pesanan:
{items}

Subtotal: {subtotal}
Ongkir: {shipping}
Diskon: {discount}
Total: {total}

Alamat pengiriman:
{shipping_address}

Catatan: {notes}`;

export const WHATSAPP_TEMPLATE_PLACEHOLDERS = [
  "{order_number}",
  "{customer_name}",
  "{customer_phone}",
  "{customer_email}",
  "{items}",
  "{subtotal}",
  "{shipping}",
  "{discount}",
  "{total}",
  "{shipping_address}",
  "{notes}",
] as const;
