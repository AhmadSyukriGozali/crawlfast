import { guardAdminApi } from "@/lib/admin/guard";
import { noStoreJson, readJsonBody } from "@/lib/security/request";
import { parseDiscountInput } from "@/lib/discounts/validation";
import {
  DISCOUNT_SELECT,
  isMissingDiscountsTable,
  toDiscount,
  type DiscountRow,
} from "@/lib/discounts/data";
import { createAdminClient } from "@/lib/supabase/admin";

const TABLE_MISSING_MESSAGE =
  "Tabel discounts belum dibuat. Jalankan migrasi supabase/migrations/001_products_and_discounts.sql terlebih dahulu.";

export async function GET(request: Request) {
  const guard = await guardAdminApi(request, "discounts", 120);

  if (!guard.ok) return guard.response;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("discounts")
      .select(DISCOUNT_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingDiscountsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load discounts:", error.message);
      return noStoreJson(
        { error: "Diskon gagal dimuat." },
        { status: 500 },
      );
    }

    return noStoreJson({
      discounts: ((data ?? []) as unknown as DiscountRow[]).map(toDiscount),
    });
  } catch (error) {
    console.error(
      "Admin discounts error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memuat diskon." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const guard = await guardAdminApi(request, "discounts-write", 60);

  if (!guard.ok) return guard.response;

  const bodyResult = await readJsonBody(request, 16 * 1024);

  if (!bodyResult.ok) {
    return noStoreJson(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const parsed = parseDiscountInput(bodyResult.data);

  if (!parsed.ok) {
    return noStoreJson({ error: parsed.error }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("discounts")
      .insert({
        code: parsed.value.code,
        description: parsed.value.description || null,
        type: parsed.value.type,
        value: parsed.value.value,
        min_subtotal: parsed.value.minSubtotal,
        max_discount: parsed.value.maxDiscount,
        starts_on: parsed.value.startsOn,
        ends_on: parsed.value.endsOn,
        usage_limit: parsed.value.usageLimit,
        is_active: parsed.value.isActive,
      })
      .select(DISCOUNT_SELECT)
      .single();

    if (error) {
      if (isMissingDiscountsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      if (error.code === "23505") {
        return noStoreJson(
          { error: "Kode diskon sudah dipakai." },
          { status: 409 },
        );
      }

      console.error("Failed to create discount:", error.message);
      return noStoreJson(
        { error: "Diskon gagal disimpan." },
        { status: 500 },
      );
    }

    return noStoreJson(
      { discount: toDiscount(data as unknown as DiscountRow) },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create discount error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menyimpan diskon." },
      { status: 500 },
    );
  }
}
