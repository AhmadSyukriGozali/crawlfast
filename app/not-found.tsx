import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">404 — Page not found</p>
          <p className="display mt-5 text-[96px] leading-none sm:text-[140px]">
            4<span className="serif-accent">0</span>4
          </p>
          <h1 className="mt-4 text-2xl tracking-tight sm:text-3xl">
            Halaman ini tidak ada.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-soft">
            Mungkin tautannya sudah berubah, atau produk yang kamu cari sudah
            tidak tersedia. Mari kembali ke koleksi.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-primary">
              Lihat koleksi
            </Link>
            <Link href="/" className="btn btn-secondary">
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
