"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
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
  const [fileName, setFileName] = useState("");
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
    <main className="admin-shell admin-main">
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

      <div className="admin-container max-w-[1280px]">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f7064] transition hover:text-[#171814]"
        >
          <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
          Kembali ke produk
        </Link>

        <header className="admin-rise mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Catalog</p>
            <h1 className="admin-title">
              {productId ? "Ubah produk" : "Tambah produk"}
              <span className="serif-accent text-[#8a6a3a]">.</span>
            </h1>
            <p className="admin-subtitle">
              Perubahan akan langsung terlihat di storefront setelah disimpan.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#e4dfd2] bg-[#fffdf8]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f7064] sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b08d57]" />
            {productId ? "Edit mode" : "New entry"}
          </span>
        </header>

        {(displayError || formError) && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#a95f3d]/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c]"
          >
            {formError || displayError}
          </div>
        )}

        {loading ? (
          <div
            className="admin-card mt-6 space-y-4 p-6"
            aria-busy="true"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-[#f0ece2]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
          >
            <div className="space-y-5">
              <section className="admin-card p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="admin-step" data-step="01">
                    Identity
                  </span>
                  <span className="h-px flex-1 bg-[#eee9de]" />
                </div>
                <h2 className="admin-section-title mt-3">Informasi produk</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                      Nama produk
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      maxLength={120}
                      className="admin-input mt-2"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
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
                      className="admin-input mt-2 font-mono text-sm"
                    />
                    <span className="mt-1.5 block text-xs text-[#6f7064]">
                      URL: /products/{form.slug || "nama-produk"}
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                      Kategori
                    </span>
                    <select
                      required
                      value={form.category}
                      onChange={(event) =>
                        setField("category", event.target.value)
                      }
                      disabled={categoriesLoading || categories.length === 0}
                      className="admin-select mt-2"
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
                      <span className="mt-1.5 block text-xs text-[#a95f3d]">
                        {categoriesError}{" "}
                        <Link
                          href="/admin/categories"
                          className="font-semibold underline"
                        >
                          Kelola kategori
                        </Link>
                      </span>
                    ) : (
                      <span className="mt-1.5 block text-xs text-[#6f7064]">
                        Kategori dikelola di{" "}
                        <Link
                          href="/admin/categories"
                          className="admin-link"
                        >
                          menu Kategori
                        </Link>
                        .
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                      Label
                    </span>
                    <select
                      value={form.tag}
                      onChange={(event) => setField("tag", event.target.value)}
                      className="admin-select mt-2"
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
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
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
                      className="admin-input mt-2"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
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
                      className="admin-input mt-2"
                    />
                    <span className="mt-1.5 block text-xs text-[#6f7064]">
                      Harus lebih besar dari harga jual.
                    </span>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
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
                      className="admin-textarea mt-2"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                      Detail bahan / perawatan
                    </span>
                    <textarea
                      value={form.detailsText}
                      onChange={(event) =>
                        setField("detailsText", event.target.value)
                      }
                      rows={5}
                      placeholder={"Satu detail per baris\nContoh: 100% cotton combed 24s"}
                      className="admin-textarea mt-2"
                    />
                  </label>
                </div>
              </section>

              <section className="admin-card p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="admin-step" data-step="02">
                    Fit
                  </span>
                  <span className="h-px flex-1 bg-[#eee9de]" />
                </div>
                <h2 className="admin-section-title mt-3">Ukuran tersedia</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ALL_SIZES.map((size) => {
                    const checked = form.sizes.includes(size);

                    return (
                      <label
                        key={size}
                        className={`cursor-pointer rounded-lg border px-4 py-2 text-[11px] font-semibold transition ${
                          checked
                            ? "border-[#5b6650]/40 bg-[#e6e9dd] text-[#4b5741] shadow-[inset_0_0_0_1px_rgba(91,102,80,0.12)]"
                            : "border-[#e4dfd2] bg-[#fffefb] text-[#6b6c61] hover:border-[#d5cebd] hover:bg-[#faf7f0]"
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
                  <p className="mt-3 text-xs font-semibold text-[#a95f3d]">
                    Pilih minimal satu ukuran.
                  </p>
                )}
              </section>

              <section className="admin-card p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="admin-step" data-step="03">
                    Social proof
                  </span>
                  <span className="h-px flex-1 bg-[#eee9de]" />
                </div>
                <h2 className="admin-section-title mt-3">Rating &amp; ulasan</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
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
                      className="admin-input mt-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
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
                      className="admin-input mt-2"
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="admin-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="admin-step" data-step="04">
                    Media
                  </span>
                  <span className="h-px flex-1 bg-[#eee9de]" />
                </div>
                <h2 className="admin-section-title mt-3">Gambar produk</h2>

                <div className="mt-4 aspect-[4/5] overflow-hidden rounded-xl border border-dashed border-[#d5cebd] bg-[#f4efe4]">
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
                    <div className="flex h-full items-center justify-center p-4 text-center text-xs leading-5 text-[#6f7064]">
                      Preview gambar akan muncul di sini.
                    </div>
                  )}
                </div>

                <label className="mt-4 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                    URL gambar
                  </span>
                  <input
                    required
                    value={form.image}
                    onChange={(event) => setField("image", event.target.value)}
                    placeholder="/products/nama-file.jpg"
                    className="admin-input mt-2 text-xs"
                  />
                </label>

                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="admin-btn admin-btn-ghost admin-btn-sm cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#b08d57]">
                      <Upload
                        size={13}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                      {fileName ? "Ganti gambar" : "Pilih gambar"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          setFileName(file?.name ?? "");
                          void handleFileChange(file);
                        }}
                        className="sr-only"
                      />
                    </label>
                    <span
                      className={`min-w-0 flex-1 truncate text-[10.5px] ${
                        fileName ? "text-[#3c3d34]" : "text-[#76776b]"
                      }`}
                    >
                      {fileName || "Belum ada file dipilih"}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-[#6f7064]">
                    Maksimal 4 MB. JPG, PNG, WEBP, atau AVIF. Upload akan
                    otomatis mengisi URL gambar.
                  </p>
                  {uploading && (
                    <p className="mt-2 text-xs font-semibold text-[#4b5741]">
                      Meng-upload gambar...
                    </p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-xs font-semibold text-[#a95f3d]">
                      {uploadError}
                    </p>
                  )}
                </div>

                <label className="mt-4 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                    Alt text gambar
                  </span>
                  <input
                    required
                    value={form.imageAlt}
                    onChange={(event) =>
                      setField("imageAlt", event.target.value)
                    }
                    maxLength={160}
                    className="admin-input mt-2"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56584d]">
                    Warna latar
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="color"
                      value={form.tint}
                      onChange={(event) => setField("tint", event.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-[#e4dfd2] bg-white p-1"
                    />
                    <input
                      value={form.tint}
                      onChange={(event) => setField("tint", event.target.value)}
                      maxLength={7}
                      className="admin-input mt-2 min-w-0 flex-1 font-mono text-sm"
                    />
                  </div>
                </label>
              </section>

              <section className="admin-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="admin-step" data-step="05">
                    Publish
                  </span>
                  <span className="h-px flex-1 bg-[#eee9de]" />
                </div>
                <h2 className="admin-section-title mt-3">Publikasi</h2>

                <label className="admin-option mt-4 flex cursor-pointer items-start gap-3">
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
                      Tayangkan di storefront
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-5 text-[#6f7064]">
                      Jika dimatikan, produk tetap tersimpan tetapi tidak bisa
                      dibeli.
                    </span>
                  </span>
                </label>

                <label className="admin-option mt-3 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setField("featured", event.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <span className="admin-switch" aria-hidden="true" />
                  <span>
                    <span className="block text-[12px] font-semibold text-[#2f302a]">
                      Tampilkan sebagai featured
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-5 text-[#6f7064]">
                      Produk featured tampil di bagian pilihan editor.
                    </span>
                  </span>
                </label>
              </section>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="admin-btn admin-btn-primary w-full"
                >
                  <Save size={14} strokeWidth={1.9} aria-hidden="true" />
                  {saving
                    ? "Menyimpan..."
                    : productId
                      ? "Simpan perubahan"
                      : "Tambahkan produk"}
                </button>
                <Link
                  href="/admin/products"
                  className="admin-btn admin-btn-ghost w-full"
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
