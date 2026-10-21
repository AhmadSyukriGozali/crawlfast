import { revalidateTag } from "next/cache";
import { guardAdminApi } from "@/lib/admin/guard";
import { noStoreJson, readJsonBody } from "@/lib/security/request";
import { parseProductInput } from "@/lib/products/validation";
import { checkProductCategory } from "@/lib/categories/check-product-category";
import {
  PRODUCT_SELECT,
  isMissingProductsTable,
  toProduct,
  type ProductRow,
} from "@/lib/products/data";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SAFE_ID = /^\d{1,10}$/;

const TABLE_MISSING_MESSAGE =
  "Tabel products belum dibuat. Jalankan migrasi supabase/migrations/001_products_and_discounts.sql terlebih dahulu.";

async function readId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;

  if (!SAFE_ID.test(id)) return null;

  const parsed = Number(id);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "products", 120);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (id === null) {
    return noStoreJson({ error: "ID produk tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      if (isMissingProductsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load admin product:", error.message);
      return noStoreJson(
        { error: "Produk gagal dimuat." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({
      product: toProduct(data as unknown as ProductRow),
    });
  } catch (error) {
    console.error(
      "Admin product detail error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memuat produk." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "products-write", 60);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (id === null) {
    return noStoreJson({ error: "ID produk tidak valid." }, { status: 400 });
  }

  const bodyResult = await readJsonBody(request, 64 * 1024);

  if (!bodyResult.ok) {
    return noStoreJson(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const parsed = parseProductInput(bodyResult.data);

  if (!parsed.ok) {
    return noStoreJson({ error: parsed.error }, { status: 400 });
  }

  try {
    const categoryCheck = await checkProductCategory(parsed.value.category);

    if (!categoryCheck.ok) {
      return noStoreJson(
        { error: categoryCheck.error },
        { status: categoryCheck.status },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        slug: parsed.value.slug,
        name: parsed.value.name,
        category: parsed.value.category,
        price: parsed.value.price,
        compare_at_price: parsed.value.compareAtPrice,
        tag: parsed.value.tag,
        image: parsed.value.image,
        image_alt: parsed.value.imageAlt,
        tint: parsed.value.tint,
        description: parsed.value.description,
        details: parsed.value.details,
        sizes: parsed.value.sizes,
        rating: parsed.value.rating,
        review_count: parsed.value.reviewCount,
        featured: parsed.value.featured,
        is_active: parsed.value.isActive,
      })
      .eq("id", id)
      .select(PRODUCT_SELECT)
      .maybeSingle();

    if (error) {
      if (isMissingProductsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      if (error.code === "23505") {
        return noStoreJson(
          { error: "Slug produk sudah dipakai. Gunakan slug lain." },
          { status: 409 },
        );
      }

      console.error("Failed to update product:", error.message);
      return noStoreJson(
        { error: "Produk gagal diperbarui." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidateTag("products", "max");

    return noStoreJson({
      product: toProduct(data as unknown as ProductRow),
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memperbarui produk." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "products-write", 60);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (id === null) {
    return noStoreJson({ error: "ID produk tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (isMissingProductsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to delete product:", error.message);
      return noStoreJson(
        { error: "Produk gagal dihapus." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidateTag("products", "max");

    return noStoreJson({ deleted: true, id: data.id });
  } catch (error) {
    console.error(
      "Delete product error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menghapus produk." },
      { status: 500 },
    );
  }
}
