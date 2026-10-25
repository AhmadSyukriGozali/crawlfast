"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Eye,
  Layers3,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(
    null,
  );

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

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    await deleteCategory(pendingDelete.id);
    setDeletingId(null);
    setPendingDelete(null);
  }

  const stats = [
    {
      label: "Total kategori",
      value: categories.length,
      hint: "Struktur katalog",
      icon: Layers3,
      tone: "ink" as const,
    },
    {
      label: "Aktif di storefront",
      value: activeCount,
      hint: "Tampil sebagai filter",
      icon: Eye,
      tone: "sage" as const,
    },
  ];

  return (
    <main id="main" className="admin-shell admin-main">
      <AdminHeader
        email={email}
        loading={loading}
        active="categories"
        onRefresh={() => void loadCategories()}
        onLogout={() => void logout()}
      />

      <div className="admin-container space-y-6">
        <header className="admin-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Catalog</p>
            <h1 className="admin-title">
              Kategori{" "}
              <span className="serif-accent text-[#8a6a3a]">koleksi.</span>
            </h1>
            <p className="admin-subtitle">
              Kelola kategori produk yang dipakai sebagai filter di storefront.
              Kategori yang masih dipakai produk tidak bisa dihapus.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <Link href="/admin/products" className="admin-btn admin-btn-ghost">
              <Tags size={13} strokeWidth={1.9} aria-hidden="true" />
              Lihat produk
            </Link>
            <Link
              href="/admin/categories/new"
              className="admin-btn admin-btn-accent"
            >
              <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
              Tambah kategori
            </Link>
          </div>
        </header>

        {error && (
          <section
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-[#a95f3d]/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Data kategori bermasalah</p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-[#a06a52]">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="admin-btn admin-btn-danger admin-btn-sm self-start sm:self-auto"
            >
              Coba lagi
            </button>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
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
            <label className="relative flex-1 sm:max-w-md">
              <span className="sr-only">Cari kategori</span>
              <Search
                size={15}
                strokeWidth={1.7}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#76776b]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, slug, atau deskripsi…"
                aria-label="Cari kategori"
                className="admin-input admin-input--icon-left"
              />
            </label>
            <p className="text-[11px] text-[#6f7064]">
              <strong className="font-semibold text-[#3c3d34]">
                {filtered.length}
              </strong>{" "}
              dari {categories.length} kategori
            </p>
          </div>

          {loading && categories.length === 0 ? (
            <div className="space-y-3 p-6" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-[#f6f2e9]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[#e4dfd2] bg-[#f8f5ed] text-[#6f7064]">
                <Layers3 size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#3c3d34]">
                {categories.length === 0
                  ? "Belum ada kategori"
                  : "Belum ada kategori yang cocok"}
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[#6f7064]">
                {categories.length === 0
                  ? "Tambahkan kategori pertama untuk mulai mengelompokkan produk."
                  : "Coba ubah kata kunci pencarian."}
              </p>
              {categories.length === 0 && (
                <Link
                  href="/admin/categories/new"
                  className="admin-btn admin-btn-primary admin-btn-sm mt-5"
                >
                  <Plus size={13} strokeWidth={2.2} aria-hidden="true" />
                  Tambah kategori
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <caption className="sr-only">Daftar kategori</caption>
                <thead>
                  <tr>
                    <th scope="col">Kategori</th>
                    <th scope="col">Deskripsi</th>
                    <th scope="col">Urutan</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e4dfd2] bg-[#f7f3ea] text-[#8a6a3a]">
                            <Tags
                              size={14}
                              strokeWidth={1.7}
                              aria-hidden="true"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold text-[#2f302a]">
                              {category.name}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-[#76776b]">
                              {category.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[360px]">
                        <p className="line-clamp-2 text-[11.5px] leading-5 text-[#6b6c61]">
                          {category.description || "—"}
                        </p>
                      </td>
                      <td>
                        <span className="inline-flex min-w-7 items-center justify-center rounded-md border border-[#e4dfd2] bg-[#faf7f0] px-1.5 py-0.5 font-mono text-[10.5px] text-[#6b6c61]">
                          {category.sortOrder}
                        </span>
                      </td>
                      <td>
                        <span
                          className="admin-chip"
                          data-tone={category.isActive ? "success" : "neutral"}
                        >
                          {category.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            <Pencil
                              size={12}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                            Ubah
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(category)}
                            disabled={deletingId === category.id}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            <Trash2
                              size={12}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                            {deletingId === category.id ? "…" : "Hapus"}
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
          Kategori aktif tampil sebagai filter storefront · urutan kecil tampil
          lebih dulu
        </footer>
      </div>

      <ConfirmDialog
        variant="admin"
        open={pendingDelete !== null}
        title="Hapus kategori?"
        description={
          pendingDelete
            ? `Kategori "${pendingDelete.name}" akan dihapus. Kategori hanya bisa dihapus jika tidak dipakai produk.`
            : ""
        }
        busy={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  );
}
