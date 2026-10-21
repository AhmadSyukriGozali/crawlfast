import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Discount,
  DiscountType,
} from "@/lib/discounts/constants";

export const DISCOUNT_SELECT = `
  id,
  code,
  description,
  type,
  value,
  min_subtotal,
  max_discount,
  starts_on,
  ends_on,
  usage_limit,
  used_count,
  is_active,
  created_at,
  updated_at
`;

export type DiscountRow = {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  value: number;
  min_subtotal: number;
  max_discount: number | null;
  starts_on: string | null;
  ends_on: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export function isMissingDiscountsTable(error: SupabaseErrorLike): boolean {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table ['"]?public\.discounts/i.test(
      error.message ?? "",
    ) ||
    /relation ['"]?public\.discounts['"]? does not exist/i.test(
      error.message ?? "",
    )
  );
}

export function toDiscount(row: DiscountRow): Discount {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type: row.type,
    value: Number(row.value),
    minSubtotal: Number(row.min_subtotal ?? 0),
    maxDiscount:
      row.max_discount === null || row.max_discount === undefined
        ? null
        : Number(row.max_discount),
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    usageLimit:
      row.usage_limit === null || row.usage_limit === undefined
        ? null
        : Number(row.usage_limit),
    usedCount: Number(row.used_count ?? 0),
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminDiscounts(): Promise<Discount[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("discounts")
    .select(DISCOUNT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as DiscountRow[]).map(toDiscount);
}

export async function getAdminDiscount(
  id: string,
): Promise<Discount | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("discounts")
    .select(DISCOUNT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return toDiscount(data as unknown as DiscountRow);
}

export async function getDiscountByCode(
  code: string,
): Promise<Discount | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("discounts")
    .select(DISCOUNT_SELECT)
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return toDiscount(data as unknown as DiscountRow);
}

/**
 * Klaim kuota diskon secara optimistik. Mengembalikan false jika kuota
 * sudah diambil request lain.
 */
export async function claimDiscountUsage(
  discount: Discount,
): Promise<boolean> {
  let current: Discount | undefined = discount;

  // Retry optimistic concurrency beberapa kali. Ini penting untuk kode tanpa
  // kuota: request paralel tidak boleh dianggap gagal hanya karena kalah
  // balapan increment.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!current) return false;

    if (
      current.usageLimit !== null &&
      current.usageLimit !== undefined &&
      current.usedCount >= current.usageLimit
    ) {
      return false;
    }

    const supabase = createAdminClient();
    let query = supabase
      .from("discounts")
      .update({ used_count: current.usedCount + 1 })
      .eq("id", current.id)
      .eq("used_count", current.usedCount);

    if (
      current.usageLimit !== null &&
      current.usageLimit !== undefined
    ) {
      query = query.lt("used_count", current.usageLimit);
    }

    const { data, error } = await query
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (data) return true;

    current = await getAdminDiscount(current.id);
  }

  return false;
}

export async function releaseDiscountUsage(
  discount: Discount,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("discounts")
      .update({ used_count: discount.usedCount })
      .eq("id", discount.id)
      .eq("used_count", discount.usedCount + 1);

    if (error) {
      console.error("Failed to release discount usage:", error.message);
    }
  } catch (error) {
    console.error(
      "Failed to release discount usage:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
