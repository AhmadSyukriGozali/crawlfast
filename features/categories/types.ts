import type { Category } from "@/lib/categories/types";

export type AdminCategory = Category;

export type AdminCategoriesResponse = {
  categories?: AdminCategory[];
  category?: AdminCategory;
  error?: string;
};
