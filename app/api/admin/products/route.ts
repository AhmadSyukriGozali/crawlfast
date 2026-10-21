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

const TABLE_MISSING_MESSAGE =
  "Tabel products belum dibuat. Jalankan migrasi supabase/migrations/001_products_and_discounts.sql terlebih dahulu.";

export async function GET(request: Request) {
  const guard = await guardAdminApi(request, "products", 120);

  if (!guard.ok) return guard.response;

  try {
    const url = new URL(request.url);
    const search = (url.searchParams.get("q") ?? "")
      .trim()
      .slice(0, 100)
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim();
    const status = (url.searchParams.get("status") ?? "all")
      .trim()
      .toLowerCase();

    const supabase = createAdminClient();
    let query = supabase.from("products").select(PRODUCT_SELECT);

    if (search) {
      query = query.or(
        [
          `name.ilike.%${search}%`,
          `slug.ilike.%${search}%`,
          `category.ilike.%${search}%`,
        ].join(","),
      );
    }

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      if (isMissingProductsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load admin products:", error.message);
      return noStoreJson(
        { error: "Produk gagal dimuat." },
        { status: 500 },
      );
    }

    return noStoreJson({
      products: ((data ?? []) as unknown as ProductRow[]).map(toProduct),
    });
  } catch (error) {
    console.error(
      "Admin products error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memuat produk." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const guard = await guardAdminApi(request, "products-write", 60);

  if (!guard.ok) return guard.response;

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
      .insert({
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
      .select(PRODUCT_SELECT)
      .single();

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

      console.error("Failed to create product:", error.message);
      return noStoreJson(
        { error: "Produk gagal disimpan." },
        { status: 500 },
      );
    }

    revalidateTag("products", "max");

    return noStoreJson(
      { product: toProduct(data as unknown as ProductRow) },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create product error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menyimpan produk." },
      { status: 500 },
    );
  }
}
