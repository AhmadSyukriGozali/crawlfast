import type { CategoryInput } from "@/lib/categories/types";

type ParseResult =
  | { ok: true; value: CategoryInput }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function slugifyCategoryName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function parseCategoryInput(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Data kategori tidak valid." };
  }

  const name = text(value.name, 60);

  if (name.length < 2) {
    return { ok: false, error: "Nama kategori minimal 2 karakter." };
  }

  const slug = slugifyCategoryName(text(value.slug, 80) || name);

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

  const description = text(value.description, 300);

  const rawSortOrder = Number(value.sortOrder ?? 0);
  const sortOrder = Number.isInteger(rawSortOrder) ? rawSortOrder : 0;

  if (sortOrder < 0 || sortOrder > 9_999) {
    return {
      ok: false,
      error: "Urutan kategori harus antara 0 dan 9.999.",
    };
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      description: description.length > 0 ? description : null,
      sortOrder,
      isActive: value.isActive !== false,
    },
  };
}
