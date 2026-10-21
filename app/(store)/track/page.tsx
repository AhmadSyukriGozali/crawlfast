import type { Metadata } from "next";
import { Suspense } from "react";
import TrackOrderForm from "@/components/store/TrackOrderForm";

export const metadata: Metadata = {
  title: "Lacak Pesanan",
  description:
    "Lacak status pembayaran dan pengiriman pesanan CRAWLFAST menggunakan nomor pesanan dan email.",
  alternates: { canonical: "/track" },
  robots: { index: false, follow: true },
};

export default function TrackPage() {
  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <header className="max-w-2xl border-b border-line pb-7">
        <p className="eyebrow">Order tracking</p>
        <h1 className="display mt-4 text-4xl sm:text-5xl">
          Lacak <span className="serif-accent">pesanan.</span>
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">
          Cek status pembayaran dan progres pengiriman pesananmu secara aman.
          Nomor pesanan dikirimkan setelah checkout berhasil.
        </p>
      </header>

      <div className="mt-8">
        <Suspense
          fallback={
            <p className="py-12 text-center text-sm text-ink-muted">
              Memuat formulir...
            </p>
          }
        >
          <TrackOrderForm />
        </Suspense>
      </div>
    </div>
  );
}
