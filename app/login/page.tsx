import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Akses terbatas untuk administrator CRAWLFAST.",
  robots: { index: false, follow: false },
};

const ASSURANCES = [
  "Sesi diverifikasi di server",
  "Allowlist email administrator",
  "Tidak ada pendaftaran publik",
];

export default function LoginPage() {
  return (
    <main
      id="main"
      className="admin-auth grid min-h-dvh grid-cols-[minmax(0,1fr)] bg-[#f3f1ea] lg:grid-cols-[1.04fr_1fr]"
    >
      <div className="relative hidden overflow-hidden bg-[#171814] lg:block">
        <Image
          src="/editorial/lookbook-01.jpg"
          alt="Editorial CRAWLFAST"
          fill
          priority
          sizes="52vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#121309] via-[#171814]/70 to-[#171814]/20" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(38rem 26rem at 12% 8%, rgb(176 141 87 / 0.22), transparent 62%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center justify-between gap-4">
            <Logo inverted />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b08d57]/30 bg-[#b08d57]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#d9be8b]">
              <Sparkles size={11} strokeWidth={1.8} aria-hidden="true" />
              Atelier Console
            </span>
          </div>

          <div className="max-w-md">
            <span
              aria-hidden="true"
              className="mb-7 block h-px w-16 bg-linear-to-r from-[#c9a86a] to-transparent"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#c9a86a]">
              Internal management
            </p>
            <p className="display mt-4 text-4xl leading-[1.02] text-white xl:text-[3.4rem]">
              Kelola toko
              <br />
              <span className="serif-accent text-[#c9a86a]">dengan tenang.</span>
            </p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              Satu ruang kerja untuk pesanan, katalog, promo, dan pembayaran
              CRAWLFAST. Setiap akses data diverifikasi di server.
            </p>

            <ul className="mt-8 space-y-2.5 border-t border-white/10 pt-6">
              {ASSURANCES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-[11px] text-white/55"
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full border border-[#b08d57]/35 bg-[#b08d57]/10 text-[#d9be8b]">
                    <Check size={9} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.2em] text-white/55">
            <span>© CRAWLFAST</span>
            <span>Admin · Internal</span>
          </div>
        </div>
      </div>

      <div className="relative flex min-w-0 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full min-w-0 max-w-108">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="admin-card overflow-hidden">
            <div
              aria-hidden="true"
              className="h-px bg-linear-to-r from-transparent via-[#b08d57] to-transparent"
            />

            <div className="p-6 sm:p-8">
              <div className="admin-icon-tile">
                <ShieldCheck size={21} strokeWidth={1.6} aria-hidden="true" />
              </div>

              <p className="admin-eyebrow mt-5">Admin access</p>
              <h1 className="admin-title">
                Selamat datang{" "}
                <span className="serif-accent text-[#8a6a3a]">kembali.</span>
              </h1>
              <p className="admin-subtitle">
                Masuk dengan akun administrator terdaftar. Akun dibuat melalui
                dashboard Supabase.
              </p>

              <div className="mt-7">
                <Suspense
                  fallback={
                    <p className="py-8 text-sm text-[#6f7064]">
                      Memuat formulir…
                    </p>
                  }
                >
                  <LoginForm />
                </Suspense>
              </div>
            </div>

            <div className="border-t border-[#eee9de] bg-[#faf7f0] px-6 py-4 text-center text-[10px] leading-5 text-[#6f7064] sm:px-8">
              Bukan administrator?{" "}
              <Link
                href="/"
                className="admin-link text-[10px] uppercase tracking-[0.08em]"
              >
                Kembali ke toko
              </Link>{" "}
              <span aria-hidden="true" className="text-[#c9c4b6]">
                ·
              </span>{" "}
              <Link
                href="/privacy"
                className="admin-link text-[10px] uppercase tracking-[0.08em]"
              >
                Privasi
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] leading-5 text-[#76776b]">
            Akses dilindungi allowlist email dan verifikasi sesi Supabase.
          </p>
        </div>
      </div>
    </main>
  );
}
