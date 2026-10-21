import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Atur ulang password akun administrator CRAWLFAST.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-5 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <Logo />

        <div className="mt-10">
          <p className="eyebrow">Account recovery</p>
          <h1 className="display mt-3 text-3xl sm:text-4xl">
            Password <span className="serif-accent">baru.</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Buat password baru yang kuat. Gunakan minimal 8 karakter dengan
            kombinasi huruf dan angka.
          </p>
        </div>

        <div className="mt-8">
          <ResetPasswordForm />
        </div>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:text-ink"
        >
          Kembali ke login
        </Link>
      </div>
    </div>
  );
}
