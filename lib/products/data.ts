import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  PRODUCTS,
  getProductFromList,
  type Product,
  type ProductCategory,
  type ProductTag,
} from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

export const PRODUCT_SELECT = `
  id,
  slug,
  name,
  category,
  price,
  compare_at_price,
  tag,
  image,
  image_alt,
  tint,
  description,
  details,
  sizes,
  rating,
  review_count,
  created_at,
  featured,
  is_active
`;

export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compare_at_price: number | null;
  tag: ProductTag | null;
  image: string;
  image_alt: string;
  tint: string;
  description: string;
  details: string[] | null;
  sizes: string[] | null;
  rating: number | string | null;
  review_count: number | null;
  created_at: string;
  featured: boolean | null;
  is_active: boolean | null;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

const FALLBACK_PRODUCTS: Product[] = PRODUCTS.map((product) => ({
  ...product,
  details: [...product.details],
  sizes: [...product.sizes],
  isActive: true,
}));

function isMissingProductsTable(error: SupabaseErrorLike): boolean {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table ['"]?public\.products/i.test(
      error.message ?? "",
    ) ||
    /relation ['"]?public\.products['"]? does not exist/i.test(
      error.message ?? "",
    )
  );
}

export function toProduct(row: ProductRow): Product {
  const createdAt =
    typeof row.created_at === "string"
      ? row.created_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? undefined
        : Number(row.compare_at_price),
    tag: row.tag ?? undefined,
    image: row.image,
    imageAlt: row.image_alt,
    tint: row.tint,
    description: row.description,
    details: row.details ?? [],
    sizes: row.sizes ?? [],
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    createdAt,
    featured: Boolean(row.featured),
    isActive: row.is_active !== false,
  };
}

/**
 * Produk publik untuk storefront. Hasil di-cache dengan tag "products" dan
 * diinvalidasi oleh API admin setelah create/update/delete.
 */
export async function getStoreProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingProductsTable(error)) {
        console.warn(
          "Tabel products belum ada. Storefront memakai katalog statis sementara.",
        );
        return FALLBACK_PRODUCTS;
      }

      throw error;
    }

    return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingProductsTable(error as SupabaseErrorLike)
    ) {
      console.warn(
        "Tabel products belum ada. Storefront memakai katalog statis sementara.",
      );
      return FALLBACK_PRODUCTS;
    }

    throw error;
  }
}

export async function getStoreProduct(
  slugOrId: string,
): Promise<Product | undefined> {
  const products = await getStoreProducts();
  return getProductFromList(products, slugOrId);
}

/**
 * Data admin tidak di-cache agar perubahan langsung terlihat di panel.
 */
export async function getAdminProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
}

export async function getAdminProduct(
  id: number,
): Promise<Product | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return toProduct(data as unknown as ProductRow);
}

/**
 * Harga checkout selalu diambil langsung dari database, bukan dari client.
 * Fallback statis hanya dipakai saat tabel products belum dibuat.
 */
export async function getCheckoutProducts(
  ids: number[],
): Promise<Map<number, Product>> {
  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) return new Map();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", uniqueIds)
      .eq("is_active", true);

    if (error) {
      if (isMissingProductsTable(error)) {
        return new Map(
          FALLBACK_PRODUCTS.filter((product) =>
            uniqueIds.includes(product.id),
          ).map((product) => [product.id, product]),
        );
      }

      throw error;
    }

    return new Map(
      ((data ?? []) as unknown as ProductRow[]).map((row) => {
        const product = toProduct(row);
        return [product.id, product];
      }),
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingProductsTable(error as SupabaseErrorLike)
    ) {
      return new Map(
        FALLBACK_PRODUCTS.filter((product) =>
          uniqueIds.includes(product.id),
        ).map((product) => [product.id, product]),
      );
    }

    throw error;
  }
}

export { isMissingProductsTable };
