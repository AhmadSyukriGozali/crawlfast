"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CatalogBrowser from "@/components/store/CatalogBrowser";
import type { Product } from "@/lib/catalog";

function CatalogWithParams({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "featured";

  return (
    <CatalogBrowser
      key={`${q}|${category}|${sort}`}
      products={products}
      categories={categories}
      initialQuery={q}
      initialCategory={category}
      initialSort={sort}
    />
  );
}

export default function ProductsBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-ink-soft">
          Memuat koleksi...
        </div>
      }
    >
      <CatalogWithParams products={products} categories={categories} />
    </Suspense>
  );
}
