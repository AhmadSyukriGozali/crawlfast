# Security Policy

## Melaporkan Kerentanan

Jika menemukan celah keamanan, **jangan** membuka issue publik. Kirim laporan ke:

- Email: `hello@crawlfast.store` (ganti dengan email keamanan resmi sebelum produksi)
- Sertakan: deskripsi, langkah reproduksi, dampak, dan bukti (jika ada).

Kami akan mengonfirmasi laporan dalam 2 hari kerja dan berusaha menutupnya secepat mungkin. Mohon beri waktu perbaikan sebelum publikasi.

## Cakupan

- Aplikasi storefront dan panel admin
- API checkout, pelacakan pesanan, notifikasi Midtrans, metode pembayaran publik, serta API admin produk/kategori/diskon/pembayaran
- Konfigurasi header, CSP, dan autentikasi

## Kontrol Keamanan

### Transport & browser
- HTTPS wajib di produksi (HSTS `includeSubDomains; preload`).
- CSP membatasi script, style, image, frame, dan koneksi.
- `X-Frame-Options: DENY` dan `frame-ancestors 'none'` mencegah clickjacking.
- `nosniff`, `Referrer-Policy`, `Permissions-Policy`, dan COOP aktif.

### Autentikasi & otorisasi
- Admin login via Supabase Auth, bukan kredensial lokal.
- Setiap endpoint admin memanggil `requireAdmin()` dan memverifikasi token ke Supabase.
- Akses dibatasi allowlist `ADMIN_EMAIL`/`ADMIN_EMAILS` dan email harus terverifikasi.
- Public signup tidak disediakan di UI; buat admin melalui dashboard Supabase.
- Password minimal 8 karakter, reset password memakai flow PKCE.

### Input & API
- Validasi tipe, panjang, pola email/telepon/kode pos, ukuran, dan jumlah produk.
- Body JSON dibaca secara streaming, dihentikan saat melewati batas ukuran, dan wajib `Content-Type: application/json`.
- Route browser memeriksa `Origin`/`Sec-Fetch-Site`.
- Rate limit untuk checkout, tracking, dan endpoint admin.
- Harga, ongkir, total, dan kode diskon selalu dihitung ulang dari database server.
- Mutasi produk/kategori/diskon/pengaturan pembayaran hanya lewat API admin yang memverifikasi token, allowlist, dan rate limit.
- Metode pembayaran divalidasi ulang di server; checkout tidak menerima harga, total, atau nomor WhatsApp dari client.
- Template WhatsApp dirender di server, dan redirect WhatsApp dibatasi ke `https://wa.me` atau `https://api.whatsapp.com`.
- Upload gambar dibatasi ukuran, MIME type, dan disimpan dengan nama acak di bucket publik.
- Respons API memakai `Cache-Control: no-store` dan `X-Content-Type-Options: nosniff`.

### Pembayaran
- Signature Midtrans SHA-512 diverifikasi dengan `timingSafeEqual`.
- Nominal notifikasi harus sama dengan total pesanan.
- Status sukses tidak bisa dibatalkan oleh notifikasi pending/failure/authorize yang terlambat.
- Notifikasi yang datang bersamaan ditangani dengan optimistic concurrency (compare-and-swap), lalu dievaluasi ulang jika kalah balapan.
- Redirect URL Midtrans divalidasi (HTTPS + domain `*.midtrans.com`).
- Pembayaran WhatsApp manual membuat pesanan `pending`, mengirim ringkasan pesanan ke admin, dan tidak meminta kredensial pembayaran melalui chat.
- Admin dapat memperbarui status pembayaran/pesanan secara manual; status lunas mengisi `paid_at`.
- Service role key hanya dipakai di server (`server-only`); kredensial Midtrans tidak disimpan di tabel pengaturan.

### Data
- RLS aktif pada tabel pesanan, produk, kategori, diskon, dan payment_settings. Produk hanya punya policy baca untuk produk aktif; kategori hanya punya policy baca untuk kategori aktif; diskon dan payment_settings tidak punya policy publik.
- Data pelacakan mengembalikan field terbatas dan membutuhkan nomor pesanan + email.
- Tidak ada penyimpanan data kartu di aplikasi.

## Checklist Sebelum Go-Live

- [ ] Migrasi `001`, `002`, dan `003` sudah dijalankan; tabel `payment_settings` ada dan hanya dapat diakses service role.
- [ ] `SITE_URL` dan `NEXT_PUBLIC_SITE_URL` memakai domain HTTPS final.
- [ ] `MIDTRANS_IS_PRODUCTION=true` dan server key produksi terpasang.
- [ ] `SUPABASE_SECRET_KEY` tidak ada di bundle client (cek Network/JS).
- [ ] Public signup Supabase dimatikan.
- [ ] Email admin terverifikasi dan allowlist benar.
- [ ] RLS aktif; tidak ada policy `anon` pada `orders`, `order_items`, `discounts`, dan `payment_settings`; `categories` hanya punya policy baca untuk kategori aktif.
- [ ] Notification URL Midtrans sudah diarahkan ke domain produksi.
- [ ] Metode pembayaran di `/admin/payments` sudah diuji (Midtrans dan/atau WhatsApp), termasuk template dan nomor admin.
- [ ] Uji alur WhatsApp: pesanan tersimpan, pesan terisi, dan admin dapat menandai lunas.
- [ ] Ganti email/WhatsApp placeholder di `lib/site.ts`.
- [ ] Uji rate limit di balik reverse proxy dan pastikan header IP tepercaya.
- [ ] Rate limiter Redis/Upstash aktif (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) dan sudah diuji di deployment multi-instance.
- [ ] Aktifkan monitoring/log aggregation untuk error server.
- [ ] Backup database dan uji restore.

## Batasan yang Diketahui

- Rate limiter in-memory hanya fallback untuk pengembangan lokal; tanpa Upstash Redis, limit tidak konsisten antar instance serverless.
- CSP masih mengizinkan `'unsafe-inline'` untuk script karena kebutuhan runtime Next.js; pertimbangkan nonce/strict CSP jika arsitektur memungkinkan.
- Keranjang/wishlist disimpan di `localStorage` (tidak sensitif, tetapi dapat dimodifikasi pengguna; server tetap memvalidasi semua data checkout).
