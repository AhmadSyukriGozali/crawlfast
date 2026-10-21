import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Akses terbatas untuk administrator CRAWLFAST.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh bg-cream lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/editorial/lookbook-01.jpg"
          alt="Editorial CRAWLFAST"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo inverted />

          <div className="max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sage-light">
              Internal management
            </p>
            <p className="display mt-4 text-4xl text-white xl:text-5xl">
              Kelola toko
              <br />
              <span className="serif-accent text-sage-light">dengan tenang.</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-white/55">
              Panel ini hanya untuk administrator terautentikasi. Setiap akses
              data pesanan diverifikasi di server.
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
            © CRAWLFAST
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/10 text-sage">
              <ShieldCheck size={21} strokeWidth={1.6} />
            </div>

            <p className="eyebrow mt-5">Admin access</p>
            <h1 className="display mt-3 text-3xl sm:text-4xl">
              Selamat datang <span className="serif-accent">kembali.</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Masuk dengan akun administrator yang terdaftar. Pendaftaran publik
              dinonaktifkan; akun dibuat melalui dashboard Supabase.
            </p>
          </div>

          <div className="mt-8">
            <Suspense
              fallback={
                <p className="py-8 text-sm text-ink-muted">Memuat formulir...</p>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-6 text-[10px] leading-5 text-ink-muted">
            Akses dilindungi allowlist email dan verifikasi sesi Supabase. Jika
            kamu bukan administrator, kembali ke{" "}
            <Link href="/" className="text-sage underline underline-offset-4">
              halaman toko
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
