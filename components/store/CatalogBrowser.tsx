"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/lib/catalog";

type SortOption = "featured" | "new" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Pilihan editor" },
  { value: "new", label: "Terbaru" },
  { value: "price-asc", label: "Harga terendah" },
  { value: "price-desc", label: "Harga tertinggi" },
  { value: "rating", label: "Rating tertinggi" },
];

export default function CatalogBrowser({
  products,
  categories,
  initialQuery = "",
  initialCategory = "",
  initialSort = "featured",
}: {
  products: Product[];
  categories: string[];
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: string;
}) {
  const safeCategory = categories.includes(initialCategory)
    ? initialCategory
    : null;

  const safeSort = SORT_OPTIONS.some((option) => option.value === initialSort)
    ? (initialSort as SortOption)
    : "featured";

  const [category, setCategory] = useState<string | null>(safeCategory);
  const [query, setQuery] = useState(initialQuery.slice(0, 80));
  const [sort, setSort] = useState<SortOption>(safeSort);

  /**
   * Filter tetap responsif saat mengetik, tetapi URL baru diperbarui saat
   * pencarian dikomit (Enter/blur) agar input tidak remount tiap ketukan.
   */
  function syncUrl(next: {
    category: string | null;
    query: string;
    sort: SortOption;
  }) {
    const params = new URLSearchParams(window.location.search);

    if (next.category) params.set("category", next.category);
    else params.delete("category");

    if (next.query.trim()) params.set("q", next.query);
    else params.delete("q");

    if (next.sort !== "featured") params.set("sort", next.sort);
    else params.delete("sort");

    const search = params.toString();

    window.history.replaceState(
      null,
      "",
      search
        ? `${window.location.pathname}?${search}`
        : window.location.pathname,
    );
  }

  function selectCategory(next: string | null) {
    setCategory(next);
    syncUrl({ category: next, query, sort });
  }

  function commitQuery() {
    syncUrl({ category, query, sort });
  }

  function changeSort(next: SortOption) {
    setSort(next);
    syncUrl({ category, query, sort: next });
  }

  function resetFilters() {
    setQuery("");
    setCategory(null);
    syncUrl({ category: null, query: "", sort });
  }

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesTerm;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "new":
          return b.createdAt.localeCompare(a.createdAt);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
    });
  }, [category, products, query, sort]);

  const activeFilters = (category ? 1 : 0) + (query.trim() ? 1 : 0);

  return (
    <div>
      <div className="border-y border-line py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectCategory(null)}
              aria-pressed={category === null}
              className={`shrink-0 border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
                category === null
                  ? "border-ink bg-ink text-white"
                  : "border-line hover:border-ink"
              }`}
            >
              Semua
            </button>

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectCategory(item)}
                aria-pressed={category === item}
                className={`shrink-0 border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
                  category === item
                    ? "border-ink bg-ink text-white"
                    : "border-line hover:border-ink"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex items-center">
              <span className="sr-only">Cari produk</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={commitQuery}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitQuery();
                  }
                }}
                placeholder="Cari produk..."
                maxLength={80}
                className="field min-h-10 w-full py-2 sm:w-56"
              />
            </label>

            <label className="relative flex items-center">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 text-ink-muted"
              />
              <span className="sr-only">Urutkan produk</span>
              <select
                value={sort}
                onChange={(event) =>
                  changeSort(event.target.value as SortOption)
                }
                className="field min-h-10 w-full py-2 pl-9 sm:w-44"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-5 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        <span>
          {filteredProducts.length} produk
          {activeFilters ? " ditemukan" : " tersedia"}
        </span>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sage underline underline-offset-4 hover:text-ink"
          >
            Reset filter
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-ink/20 px-6 py-20 text-center">
          <p className="text-xl tracking-tight">Tidak ada produk yang cocok</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-soft">
            Coba kata kunci lain atau reset filter untuk melihat seluruh
            koleksi.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-secondary mt-6"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
