"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-5 py-16 text-center">
      <Logo />
      <p className="eyebrow mt-10">Something went wrong</p>
      <h1 className="display mt-4 max-w-xl text-3xl sm:text-5xl">
        Ada gangguan <span className="serif-accent">sebentar.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-soft">
        Kami tidak dapat memuat halaman ini. Coba muat ulang, atau kembali ke
        beranda jika masalah berlanjut.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">
          <RefreshCw size={15} />
          Coba lagi
        </button>
        <Link href="/" className="btn btn-secondary">
          Ke beranda
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 font-mono text-[10px] text-ink-muted">
          Ref: {error.digest}
        </p>
      )}
    </div>
  );
}
