"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import Reveal from "@/components/home/Reveal";
import {
  getFeaturedProducts,
  getNewArrivals,
  type Product,
} from "@/lib/catalog";

const TABS = [
  { id: "featured", label: "Pilihan editor" },
  { id: "new", label: "New arrivals" },
  { id: "all", label: "Semua" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FeaturedCollection({
  products,
}: {
  products: Product[];
}) {
  const [tab, setTab] = useState<TabId>("featured");

  const visibleProducts = useMemo(() => {
    if (tab === "new") return getNewArrivals(products, 8);
    if (tab === "all") return products.slice(0, 8);
    return getFeaturedProducts(products, 4);
  }, [products, tab]);

  return (
    <section
      id="collection"
      className="container-page pb-16 pt-14 sm:pb-24 sm:pt-20"
    >
      <Reveal className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
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

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter koleksi"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-all duration-300 ${
                tab === item.id
                  ? "border-ink bg-ink text-white shadow-[0_10px_30px_-18px_rgba(29,30,26,0.9)]"
                  : "border-line text-ink-soft hover:-translate-y-0.5 hover:border-ink hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div
        key={tab}
        className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6"
      >
        {visibleProducts.map((product, index) => (
          <Reveal key={product.id} delay={index * 70}>
            <ProductCard product={product} priority={index < 4} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex justify-center sm:mt-14">
        <Link href="/products" className="btn btn-secondary group">
          Lihat semua produk
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </Reveal>
    </section>
  );
}
