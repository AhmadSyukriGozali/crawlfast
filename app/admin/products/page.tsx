"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Boxes,
  Eye,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminProducts } from "@/features/products/hooks/useAdminProducts";
import { formatRupiah } from "@/lib/format";

export default function AdminProductsPage() {
  const {
    email,
    products,
    loading,
    error,
    logout,
    loadProducts,
    deleteProduct,
  } = useAdminProducts();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchesStatus =
        status === "all" ||
        (status === "active" && product.isActive) ||
        (status === "inactive" && !product.isActive);

      return matchesTerm && matchesStatus;
    });
  }, [products, search, status]);

  const activeCount = products.filter((product) => product.isActive).length;
  const featuredCount = products.filter((product) => product.featured).length;

  async function handleDelete(id: number, name: string) {
    if (
      !window.confirm(
        `Hapus produk "${name}"? Produk akan hilang dari storefront. Riwayat pesanan lama tetap tersimpan.`,
      )
    ) {
      return;
    }

    setDeletingId(id);
    await deleteProduct(id);
    setDeletingId(null);
  }

  const stats = [
    {
      label: "Total produk",
      value: products.length,
      hint: "Seluruh katalog",
      icon: Boxes,
      tone: "ink" as const,
    },
    {
      label: "Tayang",
      value: activeCount,
      hint: "Terlihat di storefront",
      icon: Eye,
      tone: "sage" as const,
    },
    {
      label: "Featured",
      value: featuredCount,
      hint: "Pilihan editor",
      icon: Sparkles,
      tone: "brass" as const,
    },
  ];

  return (
    <main className="admin-shell admin-main">
      <AdminHeader
        email={email}
        loading={loading}
        active="products"
        onRefresh={() => void loadProducts()}
        onLogout={() => void logout()}
      />

      <div className="admin-container space-y-6">
        <header className="admin-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Catalog</p>
            <h1 className="admin-title">
              Produk{" "}
              <span className="serif-accent text-[#8a6a3a]">atelier.</span>
            </h1>
            <p className="admin-subtitle">
              Kelola produk yang tampil di storefront, termasuk harga, foto,
              ukuran, dan status publikasi.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="admin-btn admin-btn-accent self-start sm:self-auto"
          >
            <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
            Tambah produk
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-[#a95f3d]/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Data produk bermasalah</p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-[#a06a52]">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="admin-btn admin-btn-danger admin-btn-sm self-start sm:self-auto"
            >
              Coba lagi
            </button>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="admin-card admin-hover-lift flex items-center gap-4 p-5"
              >
                <span className="admin-icon-tile" data-tone={stat.tone}>
                  <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                    {stat.label}
                  </p>
                  <p className="admin-stat-value mt-1.5 text-[2rem]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10.5px] text-[#76776b]">
                    {stat.hint}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="admin-card admin-card--flush">
          <div className="flex flex-col gap-3 border-b border-[#eee9de] bg-[#fdfbf6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <label className="relative flex-1 sm:max-w-md">
                <span className="sr-only">Cari produk</span>
                <Search
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#76776b]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama, slug, atau kategori…"
                  aria-label="Cari produk"
                  className="admin-input admin-input--icon-left"
                />
              </label>
              <div className="sm:w-48 sm:shrink-0">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter status produk"
                  className="admin-select"
                >
                  <option value="all">Semua status</option>
                  <option value="active">Tayang</option>
                  <option value="inactive">Disembunyikan</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-[#6f7064]">
              <strong className="font-semibold text-[#3c3d34]">
                {filtered.length}
              </strong>{" "}
              dari {products.length} produk
            </p>
          </div>

          {loading && products.length === 0 ? (
            <div className="space-y-3 p-6" aria-busy="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-[#f6f2e9]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[#e4dfd2] bg-[#f8f5ed] text-[#8b8c80]">
                <Boxes size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#3c3d34]">
                Belum ada produk yang cocok
              </p>
              <p className="mt-1 text-xs text-[#6f7064]">
                Ubah kata kunci atau tambahkan produk baru.
              </p>
              <Link
                href="/admin/products/new"
                className="admin-btn admin-btn-primary admin-btn-sm mt-5"
              >
                <Plus size={13} strokeWidth={2.2} aria-hidden="true" />
                Tambah produk
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-[#e4dfd2] bg-[#f1ece0]">
                            <Image
                              src={product.image}
                              alt={product.imageAlt}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-semibold text-[#2f302a]">
                              {product.name}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-[#76776b]">
                              /{product.slug}
                            </p>
                            {product.tag && (
                              <span className="mt-1 inline-flex rounded-full border border-[#b08d57]/25 bg-[#f2e8d5] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#7d5d2f]">
                                {product.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-[11.5px] text-[#6b6c61]">
                        {product.category}
                      </td>
                      <td>
                        <p className="text-[12.5px] font-semibold text-[#2f302a]">
                          {formatRupiah(product.price)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="mt-0.5 text-[10px] text-[#b0b0a5] line-through">
                            {formatRupiah(product.compareAtPrice)}
                          </p>
                        )}
                      </td>
                      <td>
                        <span
                          className="admin-chip"
                          data-tone={product.isActive ? "success" : "neutral"}
                        >
                          {product.isActive ? "Tayang" : "Disembunyikan"}
                        </span>
                      </td>
                      <td>
                        {product.featured ? (
                          <span className="admin-chip" data-tone="warn">
                            Ya
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#b0b0a5]">
                            Tidak
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            aria-label={`Lihat ${product.name} di storefront`}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            <ExternalLink
                              size={12}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                            Lihat
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            aria-label={`Edit ${product.name}`}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            <Pencil
                              size={12}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() =>
                              void handleDelete(product.id, product.name)
                            }
                            aria-label={`Hapus ${product.name}`}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            <Trash2
                              size={12}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                            {deletingId === product.id ? "…" : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="border-t border-[#e4dfd2] pb-4 pt-5 text-[10px] uppercase tracking-[0.12em] text-[#76776b]">
          Produk tersimpan di tabel Supabase{" "}
          <span className="font-mono normal-case tracking-normal text-[#6b6c61]">
            products
          </span>{" "}
          · perubahan langsung memengaruhi storefront
        </footer>
      </div>
    </main>
  );
}
