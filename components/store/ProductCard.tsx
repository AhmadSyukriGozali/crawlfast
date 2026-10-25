"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Star } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { useWishlist } from "@/lib/hooks/useWishlist";

export default function ProductCard({
  product,
  priority = false,
  className = "",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);

  return (
    <article className={`group min-w-0 ${className}`}>
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: product.tint }}
      >
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
              priority={priority}
              sizes="(max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          </div>
        </Link>

        {product.tag && (
          <span className="absolute left-3 top-3 bg-cream px-2.5 py-1 text-[8px] font-semibold tracking-[0.1em] text-ink sm:text-[9px]">
            {product.tag}
          </span>
        )}

        <button
          type="button"
          aria-label={
            saved
              ? `Hapus ${product.name} dari wishlist`
              : `Simpan ${product.name} ke wishlist`
          }
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
            saved
              ? "bg-sage text-white"
              : "bg-cream/90 text-ink hover:bg-white"
          }`}
        >
          <Heart
            size={15}
            strokeWidth={1.7}
            fill={saved ? "currentColor" : "none"}
          />
        </button>

        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-between bg-cream/95 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 sm:flex"
        >
          Lihat produk
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ink-muted sm:text-[10px]">
            {product.category}
          </p>
          <span className="flex items-center gap-1 text-[10px] text-ink-muted">
            <Star
              size={11}
              className="fill-sage text-sage"
              aria-hidden="true"
            />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-1.5">
          <Link
            href={`/products/${product.slug}`}
            className="text-[13px] font-medium leading-5 tracking-[-0.01em] transition-colors hover:text-sage sm:text-sm"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-xs font-semibold">
            {formatRupiah(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-[11px] text-ink-muted line-through">
              {formatRupiah(product.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
