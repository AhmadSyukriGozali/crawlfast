import type { Product } from "@/lib/catalog";

export type AdminProduct = Product & { isActive: boolean };

export type AdminProductsResponse = {
  products?: AdminProduct[];
  product?: AdminProduct;
  error?: string;
};
