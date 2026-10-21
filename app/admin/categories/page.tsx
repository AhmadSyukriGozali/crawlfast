"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminCategories } from "@/features/categories/hooks/useAdminCategories";
import type { AdminCategory } from "@/features/categories/types";

export default function AdminCategoriesPage() {
  const {
    email,
    categories,
    loading,
    error,
    logout,
    loadCategories,
    deleteCategory,
  } = useAdminCategories();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return categories.filter((category) => {
      if (!term) return true;

      return (
        category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term) ||
        (category.description ?? "").toLowerCase().includes(term)
      );
    });
  }, [categories, search]);

  const activeCount = categories.filter((category) => category.isActive).length;

  async function handleDelete(category: AdminCategory) {
    if (
      !window.confirm(
        `Hapus kategori "${category.name}"? Kategori hanya bisa dihapus jika tidak dipakai produk.`,
      )
    ) {
      return;
    }

    setDeletingId(category.id);
    await deleteCategory(category.id);
    setDeletingId(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={email}
        loading={loading}
        active="categories"
        onRefresh={() => void loadCategories()}
        onLogout={() => void logout()}
      />

      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-700">CATALOG</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Kategori
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Kelola kategori produk yang dipakai sebagai filter di storefront.
              Kategori yang masih dipakai produk tidak bisa dihapus.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat produk
            </Link>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              + Tambah kategori
            </Link>
          </div>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-bold">Data kategori bermasalah</p>
            <p className="mt-1 whitespace-pre-line">{error}</p>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total kategori
            </p>
            <p className="mt-2 text-3xl font-black">{categories.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Aktif di storefront
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {activeCount}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, slug, atau deskripsi..."
              aria-label="Cari kategori"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-md"
            />
            <p className="text-sm text-slate-500">
              {filtered.length} dari {categories.length} kategori
            </p>
          </div>

          {loading && categories.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">
              Memeriksa akses admin dan memuat kategori...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              {categories.length === 0
                ? "Belum ada kategori. Tambahkan kategori pertama untuk mulai mengelompokkan produk."
                : "Belum ada kategori yang cocok."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Deskripsi</th>
                    <th className="px-5 py-3 font-semibold">Urutan</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((category) => (
                    <tr key={category.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {category.name}
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-400">
                          {category.slug}
                        </p>
                      </td>
                      <td className="max-w-[360px] px-5 py-4 text-slate-500">
                        {category.description || "—"}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600">
                        {category.sortOrder}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {category.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Ubah
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDelete(category)}
                            disabled={deletingId === category.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === category.id
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
      </div>
    </main>
  );
}
