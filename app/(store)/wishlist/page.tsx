"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { PRODUCTS } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { useMounted } from "@/lib/hooks/useMounted";
import { useWishlist } from "@/lib/hooks/useWishlist";

export default function WishlistPage() {
  const mounted = useMounted();
  const { ids, remove } = useWishlist();

  const savedProducts = PRODUCTS.filter((product) => ids.includes(product.id));

  if (!mounted) {
    return (
      <div className="container-page py-24 text-center text-sm text-ink-muted">
        Memuat wishlist...
      </div>
    );
  }

  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-sage"
      >
        <ArrowRight size={14} className="rotate-180" />
        Lanjut belanja
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Your personal edit</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">
            Wishlist<span className="serif-accent">.</span>
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Potongan yang kamu simpan, untuk nanti.
          </p>
        </div>
        <p className="text-xs text-ink-soft">
          {savedProducts.length} item
        </p>
      </header>

      {savedProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
          {savedProducts.map((product) => (
            <article key={product.id} className="group min-w-0">
              <div className="relative overflow-hidden bg-sand">
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={`Lihat ${product.name}`}
                  className="block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label={`Hapus ${product.name} dari wishlist`}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 transition-colors hover:bg-red-600 hover:text-white"
                >
                  <Trash2 size={16} strokeWidth={1.7} />
                </button>
              </div>

              <div className="pt-3.5">
                <p className="text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                  {product.category}
                </p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-1.5 block text-[13px] font-medium leading-5 transition-colors hover:text-sage sm:text-sm"
                >
                  {product.name}
                </Link>
                <p className="mt-2 text-xs font-semibold">
                  {formatRupiah(product.price)}
                </p>

                <Link
                  href={`/products/${product.slug}`}
                  className="btn btn-secondary mt-4 w-full min-h-10 px-3 text-[10px]"
                >
                  <ShoppingBag size={14} />
                  Pilih ukuran
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-line px-5 py-16 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-sage">
            <Heart size={25} strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 text-2xl font-medium tracking-tight">
            Wishlist masih kosong
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-soft">
            Tekan ikon hati pada produk untuk menyimpannya di sini dan
            menemukannya kembali dengan mudah.
          </p>
          <Link href="/products" className="btn btn-primary mt-7">
            Jelajahi koleksi
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
