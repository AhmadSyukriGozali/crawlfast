"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminSession } from "@/features/admin/useAdminSession";
import type { AdminCategory } from "@/features/categories/types";
import { ALL_SIZES, PRODUCT_TAGS } from "@/lib/catalog";
import { slugifyProductName } from "@/lib/products/validation";
import { PRODUCT_IMAGE_MAX_BYTES } from "@/lib/products/constants";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import type { AdminProduct } from "@/features/products/types";

type Props = {
  productId?: number;
};

type FormState = {
  name: string;
  slug: string;
  category: string;
  price: string;
  compareAtPrice: string;
  tag: string;
  image: string;
  imageAlt: string;
  tint: string;
  description: string;
  detailsText: string;
  sizes: string[];
  rating: string;
  reviewCount: string;
  featured: boolean;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  category: "",
  price: "",
  compareAtPrice: "",
  tag: "",
  image: "",
  imageAlt: "",
  tint: "#e9e5dc",
  description: "",
  detailsText: "",
  sizes: ["S", "M", "L", "XL"],
  rating: "4.5",
  reviewCount: "0",
  featured: false,
  isActive: true,
};

function toForm(product: AdminProduct): FormState {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice
      ? String(product.compareAtPrice)
      : "",
    tag: product.tag ?? "",
    image: product.image,
    imageAlt: product.imageAlt,
    tint: product.tint,
    description: product.description,
    detailsText: product.details.join("\n"),
    sizes: product.sizes,
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    featured: Boolean(product.featured),
    isActive: product.isActive !== false,
  };
}

function isPreviewableImage(value: string): boolean {
  return (
    value.startsWith("/") ||
    /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/product-images\//i.test(
      value,
    )
  );
}

export default function ProductForm({ productId }: Props) {
  const router = useRouter();
  const session = useAdminSession();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [productLoading, setProductLoading] = useState(Boolean(productId));
  const [productError, setProductError] = useState("");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    async function loadProduct() {
      setProductLoading(true);
      setProductError("");

      try {
        const response = await adminFetch(`/api/admin/products/${productId}`);

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
          product?: AdminProduct;
          error?: string;
        } | null;

        if (!response.ok || !result?.product) {
          throw new Error(result?.error || "Produk gagal dimuat.");
        }

        if (!cancelled) {
          setForm(toForm(result.product));
          setSlugTouched(true);
        }
      } catch (loadError) {
        if (!cancelled) {
          setProductError(
            loadError instanceof Error
              ? loadError.message
              : "Produk gagal dimuat.",
          );
        }
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId, router]);

  useEffect(() => {
    if (session.loading) return;

    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoriesError("");

      try {
        const response = await adminFetch("/api/admin/categories");

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
          categories?: AdminCategory[];
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(result?.error || "Kategori gagal dimuat.");
        }

        if (!cancelled) {
          const list = result?.categories ?? [];
          setCategories(list);
          setForm((current) =>
            current.category
              ? current
              : { ...current, category: list[0]?.name ?? "" },
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setCategoriesError(
            loadError instanceof Error
              ? loadError.message
              : "Kategori gagal dimuat.",
          );
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [router, session.loading]);

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
      slug: slugTouched ? current.slug : slugifyProductName(value),
    }));
  }

  function toggleSize(size: string) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }));
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) return;

    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      setUploadError("Ukuran gambar maksimal 4 MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await adminFetch("/api/admin/products/upload", {
        method: "POST",
        body,
      });

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
        url?: string;
        error?: string;
      } | null;

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || "Gambar gagal di-upload.");
      }

      setForm((current) => ({
        ...current,
        image: result.url as string,
        imageAlt: current.imageAlt || file.name.replace(/\.[^.]+$/, ""),
      }));
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "Gambar gagal di-upload.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.category) {
      setFormError("Pilih kategori produk terlebih dahulu.");
      return;
    }

    if (!form.image) {
      setFormError("Gambar produk wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        category: form.category,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : null,
        tag: form.tag || null,
        image: form.image,
        imageAlt: form.imageAlt,
        tint: form.tint,
        description: form.description,
        details: form.detailsText
          .split("\n")
          .map((detail) => detail.trim())
          .filter(Boolean),
        sizes: form.sizes,
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount || 0),
        featured: form.featured,
        isActive: form.isActive,
      };

      const response = await adminFetch(
        productId
          ? `/api/admin/products/${productId}`
          : "/api/admin/products",
        {
          method: productId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
        throw new Error(result?.error || "Produk gagal disimpan.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Produk gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  const loading = session.loading || productLoading;
  const displayError = session.error || productError;
  const previewImage = isPreviewableImage(form.image) ? form.image : "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={session.email}
        loading={loading}
        active="products"
        onRefresh={() => {
          if (productId) {
            router.refresh();
          } else {
            void session.reload();
          }
        }}
        onLogout={() => void session.logout()}
      />

      <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-9">
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Kembali ke produk
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold text-emerald-700">CATALOG</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {productId ? "Ubah produk" : "Tambah produk"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Perubahan akan langsung terlihat di storefront setelah disimpan.
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
            Memuat data produk...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
          >
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold">Informasi produk</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Nama produk
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      maxLength={120}
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
                      maxLength={120}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <span className="mt-1.5 block text-xs text-slate-500">
                      URL: /products/{form.slug || "nama-produk"}
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Kategori
                    </span>
                    <select
                      required
                      value={form.category}
                      onChange={(event) =>
                        setField("category", event.target.value)
                      }
                      disabled={categoriesLoading || categories.length === 0}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Memuat kategori..."
                          : categories.length === 0
                            ? "Belum ada kategori"
                            : "Pilih kategori"}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                          {category.isActive ? "" : " (nonaktif)"}
                        </option>
                      ))}
                      {form.category &&
                        !categories.some(
                          (category) => category.name === form.category,
                        ) && (
                          <option value={form.category}>
                            {form.category} (tidak terdaftar)
                          </option>
                        )}
                    </select>
                    {categoriesError ? (
                      <span className="mt-1.5 block text-xs text-red-600">
                        {categoriesError}{" "}
                        <Link
                          href="/admin/categories"
                          className="font-semibold underline"
                        >
                          Kelola kategori
                        </Link>
                      </span>
                    ) : (
                      <span className="mt-1.5 block text-xs text-slate-500">
                        Kategori dikelola di{" "}
                        <Link
                          href="/admin/categories"
                          className="font-semibold text-emerald-700 underline"
                        >
                          menu Kategori
                        </Link>
                        .
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Label
                    </span>
                    <select
                      value={form.tag}
                      onChange={(event) => setField("tag", event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="">Tanpa label</option>
                      {PRODUCT_TAGS.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Harga jual (Rp)
                    </span>
                    <input
                      required
                      type="number"
                      min={1000}
                      max={100000000}
                      step={1000}
                      value={form.price}
                      onChange={(event) => setField("price", event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Harga coret (opsional)
                    </span>
                    <input
                      type="number"
                      min={1000}
                      max={100000000}
                      step={1000}
                      value={form.compareAtPrice}
                      onChange={(event) =>
                        setField("compareAtPrice", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <span className="mt-1.5 block text-xs text-slate-500">
                      Harus lebih besar dari harga jual.
                    </span>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Deskripsi
                    </span>
                    <textarea
                      required
                      value={form.description}
                      onChange={(event) =>
                        setField("description", event.target.value)
                      }
                      rows={5}
                      maxLength={2000}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Detail bahan / perawatan
                    </span>
                    <textarea
                      value={form.detailsText}
                      onChange={(event) =>
                        setField("detailsText", event.target.value)
                      }
                      rows={5}
                      placeholder={"Satu detail per baris\nContoh: 100% cotton combed 24s"}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold">Ukuran tersedia</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ALL_SIZES.map((size) => {
                    const checked = form.sizes.includes(size);

                    return (
                      <label
                        key={size}
                        className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          checked
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSize(size)}
                          className="sr-only"
                        />
                        {size}
                      </label>
                    );
                  })}
                </div>
                {form.sizes.length === 0 && (
                  <p className="mt-3 text-xs font-semibold text-red-700">
                    Pilih minimal satu ukuran.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold">Rating & ulasan</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Rating (0–5)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={form.rating}
                      onChange={(event) =>
                        setField("rating", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Jumlah ulasan
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={1000000}
                      step={1}
                      value={form.reviewCount}
                      onChange={(event) =>
                        setField("reviewCount", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">Gambar produk</h2>

                <div className="mt-4 aspect-[4/5] overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-100">
                  {previewImage ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={previewImage}
                        alt={form.imageAlt || "Preview produk"}
                        fill
                        sizes="340px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-xs leading-5 text-slate-500">
                      Preview gambar akan muncul di sini.
                    </div>
                  )}
                </div>

                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-slate-700">
                    URL gambar
                  </span>
                  <input
                    required
                    value={form.image}
                    onChange={(event) => setField("image", event.target.value)}
                    placeholder="/products/nama-file.jpg"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-emerald-500"
                  />
                </label>

                <div className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) =>
                      void handleFileChange(event.target.files?.[0])
                    }
                    className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-700"
                  />
                  <p className="mt-2 text-[11px] leading-4 text-slate-500">
                    Maksimal 4 MB. JPG, PNG, WEBP, atau AVIF. Upload akan
                    otomatis mengisi URL gambar.
                  </p>
                  {uploading && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      Meng-upload gambar...
                    </p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-xs font-semibold text-red-700">
                      {uploadError}
                    </p>
                  )}
                </div>

                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-slate-700">
                    Alt text gambar
                  </span>
                  <input
                    required
                    value={form.imageAlt}
                    onChange={(event) =>
                      setField("imageAlt", event.target.value)
                    }
                    maxLength={160}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-slate-700">
                    Warna latar
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="color"
                      value={form.tint}
                      onChange={(event) => setField("tint", event.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                    />
                    <input
                      value={form.tint}
                      onChange={(event) => setField("tint", event.target.value)}
                      maxLength={7}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">Publikasi</h2>

                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setField("isActive", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-emerald-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Tayangkan di storefront
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      Jika dimatikan, produk tetap tersimpan tetapi tidak bisa
                      dibeli.
                    </span>
                  </span>
                </label>

                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setField("featured", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-emerald-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Tampilkan sebagai featured
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      Produk featured tampil di bagian pilihan editor.
                    </span>
                  </span>
                </label>
              </section>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : productId
                      ? "Simpan perubahan"
                      : "Tambahkan produk"}
                </button>
                <Link
                  href="/admin/products"
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </Link>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
