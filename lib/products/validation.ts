import {
  ALL_SIZES,
  PRODUCT_TAGS,
  type ProductCategory,
  type ProductTag,
} from "@/lib/catalog";
import { PRODUCT_IMAGE_PATH_PREFIX } from "@/lib/products/constants";

export type ProductInput = {
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice: number | null;
  tag: ProductTag | null;
  image: string;
  imageAlt: string;
  tint: string;
  description: string;
  details: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  isActive: boolean;
};

type ParseResult =
  | { ok: true; value: ProductInput }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function isSafeImage(value: string): boolean {
  if (value.startsWith("/")) {
    return (
      value.startsWith("/products/") &&
      !value.includes("..") &&
      !value.includes("//") &&
      /^\/products\/[A-Za-z0-9._/-]+\.(?:jpe?g|png|webp|avif)$/i.test(value)
    );
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "supabase.co" || url.hostname.endsWith(".supabase.co")) &&
      url.pathname.startsWith(PRODUCT_IMAGE_PATH_PREFIX)
    );
  } catch {
    return false;
  }
}

export function slugifyProductName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function parseProductInput(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Data produk tidak valid." };
  }

  const name = text(value.name, 120);
  const slug = slugifyProductName(text(value.slug, 120));

  if (name.length < 2) {
    return { ok: false, error: "Nama produk minimal 2 karakter." };
  }

  if (
    slug.length < 2 ||
    /^\d+$/.test(slug) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return {
      ok: false,
      error: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
    };
  }

  const category = text(value.category, 60);

  if (category.length < 2) {
    return { ok: false, error: "Kategori produk wajib dipilih." };
  }

  const price = optionalInteger(value.price);

  if (price === null || price < 1_000 || price > 100_000_000) {
    return {
      ok: false,
      error: "Harga harus bilangan bulat antara Rp 1.000 dan Rp 100.000.000.",
    };
  }

  const rawCompareAtPrice = optionalInteger(value.compareAtPrice);
  const compareAtPrice =
    rawCompareAtPrice !== null && rawCompareAtPrice > 0
      ? rawCompareAtPrice
      : null;

  if (
    compareAtPrice !== null &&
    (compareAtPrice <= price || compareAtPrice > 100_000_000)
  ) {
    return {
      ok: false,
      error: "Harga coret harus lebih besar dari harga jual.",
    };
  }

  const rawTag = text(value.tag, 30);
  const tag = rawTag.length === 0 ? null : (rawTag as ProductTag);

  if (tag !== null && !PRODUCT_TAGS.includes(tag)) {
    return { ok: false, error: "Label produk tidak valid." };
  }

  const image = text(value.image, 600);

  if (!isSafeImage(image)) {
    return {
      ok: false,
      error:
        "Gambar harus berupa path lokal (/products/...) atau URL Supabase Storage dari bucket product-images.",
    };
  }

  const imageAlt = text(value.imageAlt, 160);

  if (imageAlt.length < 2) {
    return { ok: false, error: "Alt text gambar minimal 2 karakter." };
  }

  const tint = text(value.tint, 7).toLowerCase();

  if (!/^#[0-9a-f]{6}$/.test(tint)) {
    return { ok: false, error: "Warna latar harus format hex, contoh #e9e5dc." };
  }

  const description = text(value.description, 2_000);

  if (description.length < 10) {
    return { ok: false, error: "Deskripsi produk minimal 10 karakter." };
  }

  const rawDetails = Array.isArray(value.details) ? value.details : [];
  const details = rawDetails
    .map((detail) => text(detail, 200))
    .filter((detail) => detail.length > 0)
    .slice(0, 20);

  const rawSizes = Array.isArray(value.sizes) ? value.sizes : [];
  const sizes = Array.from(
    new Set(
      rawSizes
        .map((size) => text(size, 20))
        .filter((size) => (ALL_SIZES as readonly string[]).includes(size)),
    ),
  );

  if (sizes.length === 0) {
    return { ok: false, error: "Pilih minimal satu ukuran produk." };
  }

  const rawRating = Number(value.rating);
  const rating = Number.isFinite(rawRating)
    ? Math.min(5, Math.max(0, Math.round(rawRating * 10) / 10))
    : 0;

  const rawReviewCount = optionalInteger(value.reviewCount);
  const reviewCount =
    rawReviewCount !== null && rawReviewCount >= 0 && rawReviewCount <= 1_000_000
      ? rawReviewCount
      : 0;

  return {
    ok: true,
    value: {
      slug,
      name,
      category,
      price,
      compareAtPrice,
      tag,
      image,
      imageAlt,
      tint,
      description,
      details,
      sizes,
      rating,
      reviewCount,
      featured: value.featured === true,
      isActive: value.isActive !== false,
    },
  };
}
