"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import { getFeaturedProducts, getNewArrivals, PRODUCTS } from "@/lib/catalog";

const TABS = [
  { id: "featured", label: "Pilihan editor" },
  { id: "new", label: "New arrivals" },
  { id: "all", label: "Semua" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FeaturedCollection() {
  const [tab, setTab] = useState<TabId>("featured");

  const products = useMemo(() => {
    if (tab === "new") return getNewArrivals(8);
    if (tab === "all") return PRODUCTS.slice(0, 8);
    return getFeaturedProducts(4);
  }, [tab]);

  return (
    <section
      id="collection"
      className="container-page pb-16 pt-14 sm:pb-20 sm:pt-20"
    >
      <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Curated for you</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-[56px]">
            Koleksi <span className="serif-accent">pilihan.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
            Potongan yang tenang, bahan yang nyaman, dan warna yang mudah
            dipadukan. Dibuat untuk dipakai berulang kali.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
                tab === item.id
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
            className="animate-fade-up"
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center sm:mt-12">
        <Link href="/products" className="btn btn-secondary group">
          Lihat semua produk
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
