# CRAWLFAST Store

Storefront fashion esensial dengan katalog, keranjang, wishlist, **checkout Midtrans**, pelacakan pesanan, halaman informasi, dan panel admin. Dibangun dengan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, dan **Supabase**.

## Fitur

### Storefront
- Landing page editorial dengan hero, marquee, koleksi pilihan, lookbook, value props, dan testimoni.
- Katalog 12 produk dengan filter kategori, pencarian, dan sorting (client-side, instan).
- Halaman detail produk dengan metadata SEO, JSON-LD, ukuran, quantity, wishlist, dan produk terkait.
- Keranjang persisten di `localStorage`, progress gratis ongkir, dan ringkasan biaya.
- Wishlist persisten dengan halaman khusus.
- Checkout dengan validasi form, honeypot anti-bot, ringkasan pesanan, dan redirect aman ke Midtrans.
- Halaman hasil checkout dan **lacak pesanan** menggunakan nomor pesanan + email.
- Halaman About, FAQ, Shipping, Returns, Size Guide, Contact, Privacy, Terms, dan 404/error pages.
- SEO: metadata per halaman, canonical, Open Graph/Twitter image, sitemap, robots, manifest, dan favicon.
- Aksesibilitas: skip link, focus ring, label form, `aria-*`, dan dukungan `prefers-reduced-motion`.

### Admin
- Login admin berbasis Supabase Auth + allowlist email (`ADMIN_EMAIL` / `ADMIN_EMAILS`).
- Dashboard pesanan: metrik, grafik revenue, status pembayaran, filter tanggal/status, pencarian, dan pagination.
- Detail pesanan lengkap.
- Endpoint admin diverifikasi di server pada setiap request (token Bearer), bukan hanya di UI.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

Lihat `.env.example`. Ringkasan:

| Variable | Scope | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Anon/publishable key |
| `SUPABASE_URL` | server | URL Supabase untuk admin client |
| `SUPABASE_SECRET_KEY` | server | Service role key. **Jangan** pakai prefix `NEXT_PUBLIC_` |
| `ADMIN_EMAIL` / `ADMIN_EMAILS` | server | Allowlist email admin, pisahkan dengan koma |
| `MIDTRANS_SERVER_KEY` | server | Server key Midtrans |
| `MIDTRANS_IS_PRODUCTION` | server | `true` untuk produksi, selain itu sandbox |
| `SITE_URL` | server | URL publik untuk callback pembayaran |
| `NEXT_PUBLIC_SITE_URL` | client | URL publik untuk metadata/SEO |

> Jangan pernah commit `.env.local`. Hanya `.env.example` yang boleh masuk repository.

## Setup Supabase

1. Buat project Supabase, lalu salin URL dan keys ke `.env.local`.
2. Nonaktifkan **public signup** di Authentication → Providers → Email, karena akun admin dibuat manual.
3. Buat user admin di Authentication → Users, lalu isi emailnya di `ADMIN_EMAIL`.
4. Pastikan email admin sudah terverifikasi (`email_confirmed_at` terisi).

### Tabel yang dibutuhkan

Aplikasi mengharapkan tabel `orders` dan `order_items`. Jika belum ada, gunakan referensi SQL berikut (sesuaikan dengan schema yang sudah berjalan):

```sql
create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_province text not null,
  shipping_postal_code text not null,
  customer_notes text,
  subtotal integer not null check (subtotal >= 0),
  shipping_cost integer not null check (shipping_cost >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'IDR',
  order_status text not null default 'pending_payment',
  payment_status text not null default 'pending',
  payment_gateway text not null default 'midtrans',
  payment_reference text,
  payment_payload jsonb,
  snap_token text,
  snap_redirect_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id integer not null,
  product_name text not null,
  product_image text,
  size text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0)
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_number_idx on public.orders (order_number);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Tidak ada policy publik. Semua akses data lewat route handler server
-- menggunakan service role. Jangan menambahkan policy anon untuk tabel ini.
```

> **RLS:** service role melewati RLS, jadi jangan pernah mengirim service role key ke client. Akses publik ke `orders`/`order_items` sebaiknya ditutup total.

## Setup Midtrans

1. Isi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_IS_PRODUCTION`.
2. Set **Payment Notification URL** di dashboard Midtrans:
   `https://domain-kamu/api/payments/midtrans/notification`
3. URL `finish` dikirim otomatis oleh aplikasi saat membuat transaksi Snap, mengarah ke `/checkout/result?order_id=...`.
4. Untuk produksi, gunakan domain HTTPS dan pastikan `SITE_URL` benar. Notifikasi diverifikasi dengan signature SHA-512 dan nominal harus sama dengan total pesanan.

## Keamanan

Lapisan keamanan yang sudah diterapkan:

- **Security headers**: CSP, HSTS (production), `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, dan `poweredByHeader: false` (lihat `next.config.ts`).
- **Admin**: token diverifikasi ke Supabase di server, allowlist email, cek email terverifikasi, rate limit, respons `no-store`.
- **Checkout**: origin check (CSRF), rate limit per IP, batas ukuran body, validasi field, whitelist produk/ukuran dari katalog server, harga & ongkir dihitung ulang di server, honeypot, dan validasi redirect Midtrans.
- **Pembayaran**: signature SHA-512 dengan `timingSafeEqual`, verifikasi nominal, proteksi notifikasi duplikat/terlambat/bersamaan dengan optimistic concurrency, dan pencatatan payload.
- **Pelacakan pesanan**: butuh nomor pesanan + email yang cocok, rate limit, dan hanya mengembalikan data terbatas (tanpa alamat/telepon).
- **404 produk**: slug/ID divalidasi di `proxy.ts`, sehingga URL produk yang tidak ada langsung mengembalikan status 404 (bukan soft 404).
- **Auth**: public signup tidak tersedia di UI, pesan error dinormalisasi agar tidak membocorkan detail, reset password via Supabase, dan flow PKCE.
- **Data**: tidak ada `dangerouslySetInnerHTML` untuk input pengguna, JSON-LD di-escape, dan harga dari browser tidak pernah dipercaya.

Lihat [`SECURITY.md`](./SECURITY.md) untuk checklist deployment dan pelaporan kerentanan.

## Scripts

```bash
npm run dev    # development
npm run build  # production build
npm run start  # jalankan hasil build
npm run lint   # ESLint
```

## Aset Gambar

Foto produk dan editorial disimpan lokal di [`public/products`](./public/products) dan [`public/editorial`](./public/editorial), sehingga storefront tidak bergantung pada host gambar eksternal. Semua foto berasal dari [Unsplash](https://unsplash.com) dan digunakan sesuai [Unsplash License](https://unsplash.com/license). Ganti dengan foto milik sendiri sebelum produksi jika diperlukan.

## Catatan & Batasan

- Keranjang dan wishlist disimpan di browser (belum tersinkron ke akun).
- Rate limit menggunakan memori proses. Untuk deployment multi-instance/serverless, gunakan Redis/Upstash.
- Login pelanggan, riwayat pesanan otomatis, dan email transaksional belum diimplementasikan.
- Produk masih berupa katalog statis di `lib/catalog.ts`; untuk skala besar, pindahkan ke database/CMS.
- Ganti alamat email, WhatsApp, dan sosial media placeholder di `lib/site.ts` sebelum go-live.
