-- CRAWLFAST payment settings
-- Jalankan setelah 001_products_and_discounts.sql dan 002_categories.sql.
-- Aman dijalankan ulang (idempotent).

create table if not exists public.payment_settings (
  id text primary key default 'default',
  midtrans_enabled boolean not null default true,
  whatsapp_enabled boolean not null default false,
  whatsapp_number text not null default '',
  whatsapp_template text not null default '',
  updated_at timestamptz not null default now(),
  constraint payment_settings_single_row check (id = 'default'),
  constraint payment_settings_whatsapp_number_check check (
    whatsapp_number = '' or whatsapp_number ~ '^[0-9]{8,15}$'
  )
);

insert into public.payment_settings (
  id,
  midtrans_enabled,
  whatsapp_enabled,
  whatsapp_number,
  whatsapp_template
)
values (
  'default',
  true,
  false,
  '',
  $template$Halo CRAWLFAST, saya ingin konfirmasi pesanan.

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

Catatan: {notes}$template$
)
on conflict (id) do nothing;

drop trigger if exists payment_settings_touch_updated_at on public.payment_settings;
create trigger payment_settings_touch_updated_at
before update on public.payment_settings
for each row execute function public.touch_updated_at();

alter table public.payment_settings enable row level security;

-- Pengaturan pembayaran hanya dibaca/ditulis oleh server memakai service role.
revoke all on public.payment_settings from anon, authenticated;
grant all on public.payment_settings to service_role;
