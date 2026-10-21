import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductsBrowser from "@/components/store/ProductsBrowser";
import { getStoreCategories } from "@/lib/categories/data";
import { getStoreProducts } from "@/lib/products/data";

export const metadata: Metadata = {
  title: "Semua Produk",
  description:
    "Jelajahi seluruh koleksi CRAWLFAST: kaos, outerwear, bottoms, knitwear, dan shirts dengan palet netral yang mudah dipadukan.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getStoreProducts(),
    getStoreCategories(),
  ]);
  const productCategories = categories
    .filter((category) =>
      products.some((product) => product.category === category.name),
    )
    .map((category) => category.name);

  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-sage"
      >
        <ArrowLeft size={14} />
        Beranda
      </Link>

      <header className="mt-6 grid gap-6 border-b border-line pb-8 sm:mt-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="eyebrow">The collection / {products.length} pieces</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">
            Semua <span className="serif-accent">produk.</span>
          </h1>
        </div>
        <p className="max-w-md text-sm leading-7 text-ink-soft lg:justify-self-end">
          Koleksi inti yang dirancang untuk saling melengkapi. Filter berdasarkan
          kategori, cari potongan tertentu, atau urutkan sesuai kebutuhanmu.
        </p>
      </header>

      <ProductsBrowser products={products} categories={productCategories} />
    </div>
  );
}
