import { revalidateTag } from "next/cache";
import { guardAdminApi } from "@/lib/admin/guard";
import { CATEGORY_TABLE_MISSING_MESSAGE } from "@/lib/categories/constants";
import {
  CATEGORY_SELECT,
  isMissingCategoriesTable,
  toCategory,
  type CategoryRow,
} from "@/lib/categories/data";
import { parseCategoryInput } from "@/lib/categories/validation";
import { noStoreJson, readJsonBody } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const guard = await guardAdminApi(request, "categories", 120);

  if (!guard.ok) return guard.response;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_SELECT)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      if (isMissingCategoriesTable(error)) {
        return noStoreJson(
          { error: CATEGORY_TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load admin categories:", error.message);
      return noStoreJson(
        { error: "Kategori gagal dimuat." },
        { status: 500 },
      );
    }

    return noStoreJson({
      categories: ((data ?? []) as unknown as CategoryRow[]).map(toCategory),
    });
  } catch (error) {
    console.error(
      "Admin categories error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memuat kategori." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const guard = await guardAdminApi(request, "categories-write", 60);

  if (!guard.ok) return guard.response;

  const bodyResult = await readJsonBody(request, 16 * 1024);

  if (!bodyResult.ok) {
    return noStoreJson(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const parsed = parseCategoryInput(bodyResult.data);

  if (!parsed.ok) {
    return noStoreJson({ error: parsed.error }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: parsed.value.name,
        slug: parsed.value.slug,
        description: parsed.value.description,
        sort_order: parsed.value.sortOrder,
        is_active: parsed.value.isActive,
      })
      .select(CATEGORY_SELECT)
      .single();

    if (error) {
      if (isMissingCategoriesTable(error)) {
        return noStoreJson(
          { error: CATEGORY_TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      if (error.code === "23505") {
        return noStoreJson(
          { error: "Nama atau slug kategori sudah dipakai." },
          { status: 409 },
        );
      }

      console.error("Failed to create category:", error.message);
      return noStoreJson(
        { error: "Kategori gagal disimpan." },
        { status: 500 },
      );
    }

    revalidateTag("categories", "max");

    return noStoreJson(
      { category: toCategory(data as unknown as CategoryRow) },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create category error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menyimpan kategori." },
      { status: 500 },
    );
  }
}
