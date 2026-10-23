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
    <main className="admin-shell admin-main">
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

      <div className="admin-container max-w-250">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f7064] transition hover:text-[#171814]"
        >
          ← Kembali ke kategori
        </Link>

        <header className="admin-rise mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Catalog</p>
            <h1 className="admin-title">
              {categoryId ? "Ubah kategori" : "Tambah kategori"}
              <span className="serif-accent text-[#8a6a3a]">.</span>
            </h1>
            <p className="admin-subtitle">
              Kategori yang aktif akan muncul sebagai filter di halaman
              produk. Rename kategori otomatis mengikuti produk yang
              memakainya.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#e4dfd2] bg-[#fffdf8]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#6f7064] sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b08d57]" />
            {categoryId ? "Edit mode" : "New entry"}
          </span>
        </header>

        {(displayError || formError) && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-clay/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c]"
          >
            {formError || displayError}
          </div>
        )}

        {loading ? (
          <div className="admin-card mt-6 space-y-4 p-6" aria-busy="true">
            <div className="h-4 w-40 animate-pulse rounded bg-[#f0ece2]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="admin-card mt-6 p-5 sm:p-6"
          >
            <div className="flex items-center gap-2.5">
              <span className="admin-step" data-step="01">
                Collection
              </span>
              <span className="h-px flex-1 bg-[#eee9de]" />
            </div>
            <h2 className="admin-section-title mt-3">
              Detail kategori
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#6f7064]">
              Nama dan slug akan dipakai sebagai filter storefront.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="admin-label">Nama kategori</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  maxLength={60}
                  placeholder="Contoh: Hoodie"
                  className="admin-input"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="admin-label">Slug</span>
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
                  className="admin-input font-mono text-sm"
                />
                <span className="admin-hint">
                  URL filter: /products?category=
                  {encodeURIComponent(form.name || "nama-kategori")}
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="admin-label">Deskripsi</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  maxLength={300}
                  rows={3}
                  placeholder="Opsional, tampil sebagai catatan internal admin."
                  className="admin-textarea"
                />
              </label>

              <label className="block">
                <span className="admin-label">Urutan tampil</span>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={form.sortOrder}
                  onChange={(event) => setField("sortOrder", event.target.value)}
                  className="admin-input"
                />
                <span className="admin-hint">
                  Angka lebih kecil tampil lebih dulu.
                </span>
              </label>

              <label className="admin-option flex cursor-pointer items-start gap-3 self-end">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setField("isActive", event.target.checked)
                  }
                  className="peer sr-only"
                />
                <span className="admin-switch" aria-hidden="true" />
                <span>
                  <span className="block text-[12px] font-semibold text-[#2f302a]">
                    Aktif
                  </span>
                  <span className="block text-[10.5px] leading-5 text-[#6f7064]">
                    Tampilkan sebagai filter storefront.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eee9de] pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/admin/categories"
                className="admin-btn admin-btn-ghost"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn admin-btn-primary"
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
