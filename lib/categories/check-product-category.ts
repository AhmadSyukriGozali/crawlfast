import "server-only";

import {
  getCategoryByName,
  isMissingCategoriesTable,
} from "@/lib/categories/data";
import { CATEGORY_TABLE_MISSING_MESSAGE } from "@/lib/categories/constants";

type CategoryCheck =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Produk hanya boleh memakai kategori yang benar-benar ada di tabel
 * categories. Pengecekan dilakukan di server agar tidak bergantung pada
 * daftar statis di client.
 */
export async function checkProductCategory(
  name: string,
): Promise<CategoryCheck> {
  try {
    const category = await getCategoryByName(name);

    if (!category) {
      return {
        ok: false,
        status: 400,
        error:
          "Kategori produk tidak ditemukan. Pilih kategori yang tersedia atau buat kategori baru terlebih dahulu.",
      };
    }

    return { ok: true };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      isMissingCategoriesTable(error as { code?: string; message?: string })
    ) {
      return {
        ok: false,
        status: 503,
        error: CATEGORY_TABLE_MISSING_MESSAGE,
      };
    }

    throw error;
  }
}
