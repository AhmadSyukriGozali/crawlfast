"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Package,
  MapPin,
  Heart,
  ShieldCheck,
  ChevronRight,
  Mail,
} from "lucide-react";

export default function AccountPage() {
  const [email, setEmail] = useState("");

  const accountLinks = [
    {
      icon: Package,
      title: "Pesanan Saya",
      description: "Lihat status dan riwayat pesanan",
    },
    {
      icon: MapPin,
      title: "Alamat Pengiriman",
      description: "Kelola alamat pengiriman",
    },
    {
      icon: Heart,
      title: "Wishlist",
      description: "Produk yang kamu simpan",
    },
    {
      icon: ShieldCheck,
      title: "Keamanan Akun",
      description: "Pengaturan dan privasi akun",
    },
  ];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    alert(
      "Fitur akun belum aktif. Login dan pengelolaan akun akan ditambahkan pada tahap berikutnya."
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20211f]">
      <header className="border-b border-[#20211f]/10 px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-[0.2em] sm:text-2xl"
          >
            CRAWLFAST
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#20211f]/70 transition hover:text-[#59634b]"
          >
            <ArrowLeft size={17} />
            <span>Kembali ke toko</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-[#59634b]">
            YOUR ACCOUNT
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Akun Saya
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#20211f]/65 sm:text-base">
            Kelola akun, pantau pesanan, dan simpan produk favoritmu di satu
            tempat.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-[#20211f]/10 bg-white/60 p-6 sm:p-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#59634b]/10 text-[#59634b]">
              <UserRound size={27} strokeWidth={1.6} />
            </div>

            <h2 className="text-xl font-semibold">Selamat datang!</h2>

            <p className="mt-2 text-sm leading-6 text-[#20211f]/65">
              Masukkan email untuk memulai proses akses akun. Fitur autentikasi
              belum diaktifkan pada versi ini.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label
                htmlFor="account-email"
                className="block text-sm font-medium"
              >
                Alamat email
              </label>

              <div className="flex items-center gap-3 border border-[#20211f]/15 bg-white px-4 py-3 focus-within:border-[#59634b]">
                <Mail size={18} className="shrink-0 text-[#59634b]" />

                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#20211f]/35"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#20211f] px-5 py-4 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-[#59634b]"
              >
                LANJUTKAN
              </button>
            </form>

            <p className="mt-5 text-xs leading-5 text-[#20211f]/45">
              Login, registrasi, dan verifikasi email akan dihubungkan setelah
              backend akun tersedia.
            </p>
          </section>

          <section className="border border-[#20211f]/10 bg-white/40">
            <div className="border-b border-[#20211f]/10 p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Ringkasan Akun</h2>
              <p className="mt-2 text-sm text-[#20211f]/60">
                Semua kebutuhan belanjamu, lebih mudah diakses.
              </p>
            </div>

            <div className="divide-y divide-[#20211f]/10">
              {accountLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 p-5 sm:px-8 sm:py-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#59634b]/10 text-[#59634b]">
                      <Icon size={21} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#20211f]/55">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={19}
                      className="shrink-0 text-[#20211f]/35"
                    />
                  </div>
                );
              })}
            </div>

            <div className="m-5 bg-[#59634b]/8 p-5 sm:m-8">
              <p className="text-sm font-semibold">Sedang kami siapkan</p>
              <p className="mt-2 text-xs leading-5 text-[#20211f]/65">
                Fitur akun akan diaktifkan bertahap. Bagian ini saat ini
                merupakan tampilan awal dan belum terhubung ke data pesanan
                atau autentikasi.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 border-t border-[#20211f]/10 pt-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#59634b] transition hover:text-[#20211f]"
          >
            <Package size={17} />
            Lihat keranjang belanja
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#20211f]/10 px-5 py-6 text-center text-xs tracking-wide text-[#20211f]/45">
        © 2026 CRAWLFAST STORE
      </footer>
    </main>
  );
}
