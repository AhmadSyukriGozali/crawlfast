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

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readId(context: RouteContext): Promise<string | null> {
  const { id } = await context.params;
  return UUID_PATTERN.test(id) ? id : null;
}

export async function GET(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "categories", 120);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (!id) {
    return noStoreJson({ error: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      if (isMissingCategoriesTable(error)) {
        return noStoreJson(
          { error: CATEGORY_TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load category:", error.message);
      return noStoreJson(
        { error: "Kategori gagal dimuat." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Kategori tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({
      category: toCategory(data as unknown as CategoryRow),
    });
  } catch (error) {
    console.error(
      "Admin category detail error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memuat kategori." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "categories-write", 60);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (!id) {
    return noStoreJson({ error: "ID kategori tidak valid." }, { status: 400 });
  }

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

    // Foreign key products.category -> categories.name memakai ON UPDATE
    // CASCADE, jadi rename kategori otomatis ikut memperbarui produk.
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: parsed.value.name,
        slug: parsed.value.slug,
        description: parsed.value.description,
        sort_order: parsed.value.sortOrder,
        is_active: parsed.value.isActive,
      })
      .eq("id", id)
      .select(CATEGORY_SELECT)
      .maybeSingle();

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

      console.error("Failed to update category:", error.message);
      return noStoreJson(
        { error: "Kategori gagal diperbarui." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Kategori tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidateTag("categories", "max");
    revalidateTag("products", "max");

    return noStoreJson({
      category: toCategory(data as unknown as CategoryRow),
    });
  } catch (error) {
    console.error(
      "Update category error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memperbarui kategori." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "categories-write", 60);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (!id) {
    return noStoreJson({ error: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (categoryError) {
      if (isMissingCategoriesTable(categoryError)) {
        return noStoreJson(
          { error: CATEGORY_TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load category before delete:", categoryError.message);
      return noStoreJson(
        { error: "Kategori gagal dihapus." },
        { status: 500 },
      );
    }

    if (!category) {
      return noStoreJson(
        { error: "Kategori tidak ditemukan." },
        { status: 404 },
      );
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", category.name);

    if (countError) {
      console.error("Failed to count products by category:", countError.message);
      return noStoreJson(
        { error: "Kategori gagal dihapus." },
        { status: 500 },
      );
    }

    if ((count ?? 0) > 0) {
      return noStoreJson(
        {
          error:
            "Kategori masih dipakai oleh produk. Pindahkan produk ke kategori lain sebelum menghapus.",
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (isMissingCategoriesTable(error)) {
        return noStoreJson(
          { error: CATEGORY_TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      if (error.code === "23503") {
        return noStoreJson(
          {
            error:
              "Kategori masih dipakai oleh produk. Pindahkan produk ke kategori lain sebelum menghapus.",
          },
          { status: 409 },
        );
      }

      console.error("Failed to delete category:", error.message);
      return noStoreJson(
        { error: "Kategori gagal dihapus." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Kategori tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidateTag("categories", "max");

    return noStoreJson({ deleted: true, id: data.id });
  } catch (error) {
    console.error(
      "Delete category error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menghapus kategori." },
      { status: 500 },
    );
  }
}
