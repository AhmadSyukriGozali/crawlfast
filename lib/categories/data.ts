import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CATEGORIES } from "@/lib/catalog";
import type { Category, CategoryRow } from "@/lib/categories/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type { CategoryRow } from "@/lib/categories/types";

export const CATEGORY_SELECT = `
  id,
  name,
  slug,
  description,
  sort_order,
  is_active,
  created_at
`;

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function fallbackCategories(): Category[] {
  return CATEGORIES.map((name, index) => ({
    id: `fallback-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: null,
    sortOrder: (index + 1) * 10,
    isActive: true,
    createdAt: "",
  }));
}

export function isMissingCategoriesTable(error: SupabaseErrorLike): boolean {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table ['"]?public\.categories/i.test(
      error.message ?? "",
    ) ||
    /relation ['"]?public\.categories['"]? does not exist/i.test(
      error.message ?? "",
    )
  );
}

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: Number(row.sort_order ?? 0),
    isActive: row.is_active !== false,
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at.slice(0, 10)
        : "",
  };
}

/**
 * Kategori publik untuk filter storefront. Di-cache dengan tag "categories"
 * dan diinvalidasi oleh API admin setelah create/update/delete.
 */
export async function getStoreCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories");

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      if (isMissingCategoriesTable(error)) {
        console.warn(
          "Tabel categories belum ada. Storefront memakai kategori statis sementara.",
        );
        return fallbackCategories();
      }

      throw error;
    }

    return ((data ?? []) as unknown as CategoryRow[]).map(toCategory);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingCategoriesTable(error as SupabaseErrorLike)
    ) {
      console.warn(
        "Tabel categories belum ada. Storefront memakai kategori statis sementara.",
      );
      return fallbackCategories();
    }

    throw error;
  }
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as CategoryRow[]).map(toCategory);
}

export async function getAdminCategory(
  id: string,
): Promise<Category | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return toCategory(data as unknown as CategoryRow);
}

export async function getCategoryByName(
  name: string,
): Promise<Category | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("name", name)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return toCategory(data as unknown as CategoryRow);
}
