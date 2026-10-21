"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminSession } from "@/features/admin/useAdminSession";
import type { AdminCategory } from "@/features/categories/types";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import { slugifyCategoryName } from "@/lib/categories/validation";

type Props = {
  categoryId?: string;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

function toForm(category: AdminCategory): FormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  };
}

export default function CategoryForm({ categoryId }: Props) {
  const router = useRouter();
  const session = useAdminSession();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(Boolean(categoryId));
  const [categoryError, setCategoryError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;

    async function loadCategory() {
      setCategoryLoading(true);
      setCategoryError("");

      try {
        const response = await adminFetch(
          `/api/admin/categories/${categoryId}`,
        );

        if (!response) {
          router.replace("/login");
          return;
        }

        if (response.status === 401 || response.status === 403) {
          await signOutAdmin();
          router.replace("/login");
          return;
        }

        const result = (await response.json().catch(() => null)) as {
          category?: AdminCategory;
          error?: string;
        } | null;

        if (!response.ok || !result?.category) {
          throw new Error(result?.error || "Kategori gagal dimuat.");
        }

        if (!cancelled) {
          setForm(toForm(result.category));
          setSlugTouched(true);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCategoryError(
            loadError instanceof Error
              ? loadError.message
              : "Kategori gagal dimuat.",
          );
        }
      } finally {
        if (!cancelled) setCategoryLoading(false);
      }
    }

    void loadCategory();

    return () => {
      cancelled = true;
    };
  }, [categoryId, router]);

  function setField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugTouched ? current.slug : slugifyCategoryName(value),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    setSaving(true);

    try {
      const response = await adminFetch(
        categoryId
          ? `/api/admin/categories/${categoryId}`
          : "/api/admin/categories",
        {
          method: categoryId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description,
            sortOrder: Number(form.sortOrder || 0),
            isActive: form.isActive,
          }),
        },
      );

      if (!response) {
        router.replace("/login");
        return;
      }

      if (response.status === 401 || response.status === 403) {
        await signOutAdmin();
        router.replace("/login");
        return;
      }

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Kategori gagal disimpan.");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Kategori gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  const loading = session.loading || categoryLoading;
  const displayError = session.error || categoryError;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={session.email}
        loading={loading}
        active="categories"
        onRefresh={() => {
          if (categoryId) {
            router.refresh();
          } else {
            void session.reload();
          }
        }}
        onLogout={() => void session.logout()}
      />

      <div className="mx-auto max-w-[900px] px-4 py-7 sm:px-6 sm:py-9">
        <Link
          href="/admin/categories"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Kembali ke kategori
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold text-emerald-700">CATALOG</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {categoryId ? "Ubah kategori" : "Tambah kategori"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Kategori yang aktif akan muncul sebagai filter di halaman produk.
            Rename kategori otomatis mengikuti produk yang memakainya.
          </p>
        </header>

        {(displayError || formError) && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {formError || displayError}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Memuat data kategori...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Nama kategori
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  maxLength={60}
                  placeholder="Contoh: Hoodie"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Slug
                </span>
                <input
                  required
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setField(
                      "slug",
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, ""),
                    );
                  }}
                  maxLength={80}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  URL filter: /products?category=
                  {encodeURIComponent(form.name || "nama-kategori")}
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Deskripsi
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  maxLength={300}
                  rows={3}
                  placeholder="Opsional, tampil sebagai catatan internal admin."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Urutan tampil
                </span>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={form.sortOrder}
                  onChange={(event) => setField("sortOrder", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Angka lebih kecil tampil lebih dulu.
                </span>
              </label>

              <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-700"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-700">
                    Aktif
                  </span>
                  <span className="block text-xs text-slate-500">
                    Tampilkan sebagai filter storefront.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/admin/categories"
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan kategori"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
