# Deploy ke Vercel (Produksi)

Panduan ini khusus untuk men-deploy CRAWLFAST Store ke Vercel sebagai produksi.
Arsitektur: **Next.js 16 di Vercel + Supabase (database, auth, storage) + Midtrans + Upstash Redis**.

---

## 0. Yang sudah disiapkan di repo

| Perubahan | Alasan |
| --- | --- |
| Batas upload gambar **4 MB** (`lib/products/constants.ts`) | Vercel Functions menolak body > 4.5 MB (`FUNCTION_PAYLOAD_TOO_LARGE`) |
| Validasi ukuran file di browser (`ProductForm.tsx`) | Gagal cepat sebelum request dikirim |
| Rate limit **Upstash Redis** dengan fallback in-memory (`lib/security/rate-limit.ts`) | Memori proses tidak dibagi antar instance serverless |
| Dokumentasi ini + env baru di `.env.example` | Checklist deploy yang bisa diulang |

Kalau `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` kosong, aplikasi tetap
jalan, tetapi rate limit hanya berlaku per instance (tidak efektif di Vercel).

---

## 1. Prasyarat

- Repo sudah di GitHub/GitLab/Bitbucket.
- Akun Vercel dengan **plan Pro**. Plan Hobby tidak boleh dipakai untuk situs komersial.
- Project **Supabase produksi** (region **Southeast Asia (Singapore)** agar dekat Vercel `sin1`).
- Akun **Midtrans produksi** yang sudah lolos KYC.
- Database **Upstash Redis** (bisa dibuat dari Vercel Marketplace, ada free tier).
- Node.js 22.x untuk build lokal (Next.js 16 minimal 20.9).

---

## 2. Setup Supabase produksi

1. Buat project baru, simpan **Project URL**, **anon/publishable key**, dan **service role key**.
2. Jika project Supabase masih **baru**, buat tabel `orders` dan `order_items` terlebih dahulu memakai SQL di [README](./README.md#tabel-yang-dibutuhkan). Migrasi `001` hanya menambahkan kolom diskon ke `orders`, jadi tabel `orders` harus sudah ada.
3. Jalankan migrasi di **SQL Editor**, berurutan:
   1. `supabase/migrations/001_products_and_discounts.sql`
   2. `supabase/migrations/002_categories.sql`
   3. `supabase/migrations/003_payment_settings.sql`
4. Pastikan bucket `product-images` **public** dan limitnya minimal 4 MB.
5. **Authentication → Providers → Email**: matikan *Allow new users to sign up*.
6. **Authentication → Users**: buat admin, lalu verifikasi emailnya.
7. **Authentication → URL Configuration**:
   - Site URL: `https://domain-anda.com`
   - Redirect URLs: `https://domain-anda.com/login/reset`
8. Cek RLS: `orders`, `order_items`, `discounts`, `payment_settings` **tanpa policy anon**;
   `products` dan `categories` hanya policy baca untuk data aktif. `proxy.ts` memakai
   anon key untuk cek produk, jadi policy baca `products` wajib ada.

> Jangan menambahkan policy anon ke tabel pesanan. Semua akses pesanan lewat route
> handler server dengan service role.

---

## 3. Setup Upstash Redis

1. Di dashboard Vercel: **Storage → Create Database → Upstash Redis** (atau buat di console Upstash).
2. Hubungkan ke project Vercel. Env yang terbentuk biasanya:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Kalau memakai integrasi Vercel KV lama, variabel `KV_REST_API_URL` / `KV_REST_API_TOKEN`
   juga didukung otomatis oleh kode.

Tanpa Redis, rate limit checkout/admin hanya berlaku per instance function.

---

## 4. Setup Midtrans

1. Isi **Payment Notification URL** di dashboard Midtrans:
   `https://domain-anda.com/api/payments/midtrans/notification`
2. Gunakan **server key produksi** dan set `MIDTRANS_IS_PRODUCTION=true`.
3. URL `finish` dibuat otomatis oleh aplikasi menggunakan `SITE_URL`, mengarah ke
   `/checkout/result?order_id=...`.
4. Jangan mencampur key sandbox dengan `MIDTRANS_IS_PRODUCTION=true` (notifikasi akan gagal validasi signature).
5. Uji dengan transaksi nominal kecil setelah deploy.

---

## 5. Import project ke Vercel

1. **Add New → Project → Import** repo.
2. Framework Preset: **Next.js** (otomatis). Build Command: `next build`. Output: default.
3. **Settings → General → Node.js Version: 22.x**.
4. **Settings → Functions → Region: Singapore (`sin1`)**.
   Default `iad1` (US) membuat query Supabase dan webhook Midtrans jauh lebih lambat.
5. **Settings → Deployment Protection**: matikan untuk domain produksi agar webhook Midtrans bisa masuk.

---

## 6. Environment Variables

Isi di **Project → Settings → Environment Variables** untuk **Production, Preview, dan Development**.
`NEXT_PUBLIC_*` dibaca **saat build**, jadi setiap perubahan harus **Redeploy**.

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=eyJ...            # service role, server-only

# Admin
ADMIN_EMAIL=admin@domain-anda.com
# ADMIN_EMAILS=admin@domain-anda.com,owner@domain-anda.com

# Midtrans
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_IS_PRODUCTION=true

# URL publik
SITE_URL=https://domain-anda.com
NEXT_PUBLIC_SITE_URL=https://domain-anda.com

# Rate limit (dari integrasi Upstash)
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

| Variable | Scope | Wajib | Catatan |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client | ya | di-inline saat build |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | ya | aman di client (dilindungi RLS) |
| `SUPABASE_URL` | server + build | ya | dipakai admin client & prerender |
| `SUPABASE_SECRET_KEY` | server + build | ya | **jangan** pakai prefix `NEXT_PUBLIC_` |
| `ADMIN_EMAIL` / `ADMIN_EMAILS` | server | ya | email harus terverifikasi |
| `MIDTRANS_SERVER_KEY` | server | ya (jika Midtrans aktif) | key produksi |
| `MIDTRANS_IS_PRODUCTION` | server | ya | `true` di produksi |
| `SITE_URL` | server | ya | callback pembayaran |
| `NEXT_PUBLIC_SITE_URL` | client | ya | canonical, sitemap, OG |
| `UPSTASH_REDIS_REST_URL` | server | sangat disarankan | rate limit global |
| `UPSTASH_REDIS_REST_TOKEN` | server | sangat disarankan | pasangan URL |

Catatan build: halaman produk di-prerender lewat `generateStaticParams()`, jadi
`SUPABASE_URL` dan `SUPABASE_SECRET_KEY` **harus tersedia saat build**. Kalau Supabase
tidak bisa dihubungi, build akan gagal (bukan diam-diam memakai katalog statis).

Jangan pernah commit `.env.local` (sudah di-.gitignore). Hanya `.env.example` yang masuk repo.

### Deploy via CLI (opsional)

```bash
npm i -g vercel
vercel link
vercel env pull .env.vercel.local   # mengambil env dari Vercel
vercel --prod
```

---

## 7. Domain & DNS

1. **Settings → Domains → Add**, lalu ikuti record DNS yang diminta Vercel.
2. Pilih satu versi kanonik (`domain-anda.com` atau `www.domain-anda.com`) dan redirect yang lain.
3. Tunggu sertifikat HTTPS aktif.
4. Perbarui `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, Redirect URL Supabase, dan Notification URL Midtrans ke domain final, lalu **Redeploy**.
5. HSTS di `next.config.ts` memakai `includeSubDomains; preload`. Pastikan semua subdomain sudah HTTPS sebelum submit ke preload list.

---

## 8. Checklist verifikasi pasca-deploy

- [ ] Build Vercel sukses; tidak ada warning env hilang.
- [ ] Beranda, `/products`, detail produk, dan URL produk acak (harus 404).
- [ ] `/sitemap.xml` dan `/robots.txt` berisi domain produksi (bukan `localhost`).
- [ ] Response header memuat CSP dan `Strict-Transport-Security`.
- [ ] Login admin, dashboard, CRUD produk/kategori/diskon.
- [ ] Upload gambar 1 MB berhasil; 5 MB ditolak dengan pesan 4 MB.
- [ ] Checkout Midtrans nominal kecil → notifikasi masuk → status pesanan berubah.
- [ ] Checkout WhatsApp → pesan terisi → admin menandai lunas.
- [ ] Lacak pesanan dengan nomor + email.
- [ ] Rate limit: request ke-9 ke `/api/checkout` dalam 1 menit mengembalikan 429.
- [ ] `SUPABASE_SECRET_KEY` tidak muncul di bundle client (cek DevTools → Sources/Network).
- [ ] Webhook Midtrans tidak terblokir Deployment Protection.

---

## 9. Preview deployment

- Set env Preview ke project Supabase **staging**, bukan produksi, jika tersedia.
- `SITE_URL` preview sebaiknya memakai domain preview; kalau memakai domain produksi,
  callback Midtrans dari preview akan mengarah ke produksi.
- Jangan arahkan webhook Midtrans produksi ke URL preview.

---

## 10. Operasional

- **Log**: Vercel → Project → Logs (Runtime Logs). Cari `rate limit failed`, `Failed to upload`, `Midtrans`.
- **Monitoring**: aktifkan Speed Insights/Analytics (opsional), pertimbangkan Sentry.
- **Backup**: aktifkan backup harian Supabase dan uji restore.
- **Image Optimization**: gambar `public/` dan Supabase diproses oleh Vercel; pantau kuota.
- **Cron**: tidak dibutuhkan, aplikasi tidak punya job terjadwal.
- **Redeploy wajib** setelah mengubah env `NEXT_PUBLIC_*` atau domain.

---

## 11. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `413 FUNCTION_PAYLOAD_TOO_LARGE` saat upload | File > 4.5 MB | Batas aplikasi sudah 4 MB; pastikan bukan request lain |
| `Supabase server environment variables are missing` | Env runtime kosong | Isi `SUPABASE_URL` + `SUPABASE_SECRET_KEY`, redeploy |
| Build gagal di halaman produk | Env build kosong / Supabase down | Isi env untuk environment Build, cek status Supabase |
| Semua `/products/*` 404 | `proxy.ts` tidak bisa baca produk | Cek policy RLS baca `products`, anon key, dan timeout 2 detik |
| Login admin berhasil lalu balik ke `/login` | `ADMIN_EMAIL` tidak cocok / email belum verified | Perbaiki allowlist dan verifikasi email |
| Reset password tidak kembali ke app | Redirect URL belum didaftarkan | Tambah `https://domain/login/reset` di Supabase |
| Notifikasi Midtrans 401 | Key sandbox vs produksi / signature | Samakan key dengan mode Midtrans, cek `MIDTRANS_IS_PRODUCTION` |
| Sitemap/canonical menunjuk `localhost` | `NEXT_PUBLIC_SITE_URL` kosong saat build | Isi env lalu redeploy |
| Rate limit tidak menolak apa pun | Upstash belum terhubung | Cek `UPSTASH_REDIS_REST_URL`/`TOKEN` dan log function |
| Admin ter-logout saat upload besar | Function gagal sebelum auth selesai | Pastikan file ≤ 4 MB |

---

## 12. Batasan yang perlu diketahui

- Keranjang dan wishlist hanya di `localStorage`, belum tersinkron ke akun.
- Tracking pesanan butuh nomor pesanan + email; tidak ada halaman riwayat pesanan.
- Tidak ada email transaksional otomatis.
- CSP masih mengizinkan `'unsafe-inline'` untuk script (kebutuhan runtime Next.js).
- Fallback katalog statis hanya untuk kondisi tabel `products` belum dibuat.
- Ganti email/WhatsApp placeholder di `lib/site.ts` sebelum go-live.
