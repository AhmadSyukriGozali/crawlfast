import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Not found</p>
      <p className="display mt-5 text-[88px] leading-none sm:text-[120px]">
        4<span className="serif-accent">0</span>4
      </p>
      <h1 className="mt-4 text-2xl tracking-tight sm:text-3xl">
        Yang kamu cari tidak ditemukan.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-soft">
        Produk atau halaman ini mungkin sudah tidak tersedia. Coba lihat koleksi
        terbaru kami.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/products" className="btn btn-primary">
          Lihat koleksi
        </Link>
        <Link href="/" className="btn btn-secondary">
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
