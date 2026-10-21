"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={email}
        loading={loading}
        active="products"
        onRefresh={() => void loadProducts()}
        onLogout={() => void logout()}
      />

      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-700">CATALOG</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Produk
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Kelola produk yang tampil di storefront, termasuk harga, foto,
              ukuran, dan status publikasi.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            + Tambah produk
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-bold">Data produk bermasalah</p>
            <p className="mt-1 whitespace-pre-line">{error}</p>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total produk
            </p>
            <p className="mt-2 text-3xl font-black">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tayang
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Featured
            </p>
            <p className="mt-2 text-3xl font-black">{featuredCount}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, slug, atau kategori..."
                aria-label="Cari produk"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter status produk"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">Semua status</option>
                <option value="active">Tayang</option>
                <option value="inactive">Disembunyikan</option>
              </select>
            </div>
            <p className="text-sm text-slate-500">
              {filtered.length} dari {products.length} produk
            </p>
          </div>

          {loading && products.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">
              Memeriksa akses admin dan memuat produk...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada produk yang cocok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Produk</th>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Harga</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Featured</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((product) => (
                    <tr key={product.id} className="align-middle">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <Image
                              src={product.image}
                              alt={product.imageAlt}
                              fill
                              sizes="52px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-slate-500">
                              /{product.slug}
                            </p>
                            {product.tag && (
                              <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                {product.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {product.category}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {formatRupiah(product.price)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatRupiah(product.compareAtPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {product.isActive ? "Tayang" : "Disembunyikan"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {product.featured ? (
                          <span className="font-semibold text-emerald-700">
                            Ya
                          </span>
                        ) : (
                          <span className="text-slate-400">Tidak</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            Lihat
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() =>
                              void handleDelete(product.id, product.name)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === product.id
                              ? "Menghapus..."
                              : "Hapus"}
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

        <footer className="pb-4 text-xs text-slate-500">
          Produk disimpan di tabel Supabase `products`. Perubahan langsung
          memengaruhi storefront setelah cache produk diperbarui.
        </footer>
      </div>
    </main>
  );
}
