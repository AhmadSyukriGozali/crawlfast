# Security Policy

## Melaporkan Kerentanan

Jika menemukan celah keamanan, **jangan** membuka issue publik. Kirim laporan ke:

- Email: `hello@crawlfast.store` (ganti dengan email keamanan resmi sebelum produksi)
- Sertakan: deskripsi, langkah reproduksi, dampak, dan bukti (jika ada).

Kami akan mengonfirmasi laporan dalam 2 hari kerja dan berusaha menutupnya secepat mungkin. Mohon beri waktu perbaikan sebelum publikasi.

## Cakupan

- Aplikasi storefront dan panel admin
- API checkout, pelacakan pesanan, dan notifikasi Midtrans
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
- Harga, ongkir, dan total selalu dihitung ulang dari katalog server.
- Respons API memakai `Cache-Control: no-store` dan `X-Content-Type-Options: nosniff`.

### Pembayaran
- Signature Midtrans SHA-512 diverifikasi dengan `timingSafeEqual`.
- Nominal notifikasi harus sama dengan total pesanan.
- Status sukses tidak bisa dibatalkan oleh notifikasi pending/failure/authorize yang terlambat.
- Notifikasi yang datang bersamaan ditangani dengan optimistic concurrency (compare-and-swap), lalu dievaluasi ulang jika kalah balapan.
- Redirect URL Midtrans divalidasi (HTTPS + domain `*.midtrans.com`).
- Service role key hanya dipakai di server (`server-only`).

### Data
- RLS aktif pada tabel pesanan; tidak ada policy publik.
- Data pelacakan mengembalikan field terbatas dan membutuhkan nomor pesanan + email.
- Tidak ada penyimpanan data kartu di aplikasi.

## Checklist Sebelum Go-Live

- [ ] `SITE_URL` dan `NEXT_PUBLIC_SITE_URL` memakai domain HTTPS final.
- [ ] `MIDTRANS_IS_PRODUCTION=true` dan server key produksi terpasang.
- [ ] `SUPABASE_SECRET_KEY` tidak ada di bundle client (cek Network/JS).
- [ ] Public signup Supabase dimatikan.
- [ ] Email admin terverifikasi dan allowlist benar.
- [ ] RLS aktif; tidak ada policy `anon` pada `orders`/`order_items`.
- [ ] Notification URL Midtrans sudah diarahkan ke domain produksi.
- [ ] Ganti email/WhatsApp placeholder di `lib/site.ts`.
- [ ] Uji rate limit di balik reverse proxy dan pastikan header IP tepercaya.
- [ ] Ganti rate limiter in-memory dengan Redis/Upstash jika multi-instance.
- [ ] Aktifkan monitoring/log aggregation untuk error server.
- [ ] Backup database dan uji restore.

## Batasan yang Diketahui

- Rate limiter in-memory tidak konsisten antar instance.
- CSP masih mengizinkan `'unsafe-inline'` untuk script karena kebutuhan runtime Next.js; pertimbangkan nonce/strict CSP jika arsitektur memungkinkan.
- Keranjang/wishlist disimpan di `localStorage` (tidak sensitif, tetapi dapat dimodifikasi pengguna; server tetap memvalidasi semua data checkout).
