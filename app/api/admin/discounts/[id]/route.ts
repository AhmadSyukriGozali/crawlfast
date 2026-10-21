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

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TABLE_MISSING_MESSAGE =
  "Tabel discounts belum dibuat. Jalankan migrasi supabase/migrations/001_products_and_discounts.sql terlebih dahulu.";

async function readId(context: RouteContext): Promise<string | null> {
  const { id } = await context.params;
  return UUID_PATTERN.test(id) ? id : null;
}

export async function GET(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "discounts", 120);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (!id) {
    return noStoreJson({ error: "ID diskon tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("discounts")
      .select(DISCOUNT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      if (isMissingDiscountsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to load discount:", error.message);
      return noStoreJson(
        { error: "Diskon gagal dimuat." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Diskon tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({
      discount: toDiscount(data as unknown as DiscountRow),
    });
  } catch (error) {
    console.error(
      "Admin discount detail error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memuat diskon." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "discounts-write", 60);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (!id) {
    return noStoreJson({ error: "ID diskon tidak valid." }, { status: 400 });
  }

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
      .update({
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
      .eq("id", id)
      .select(DISCOUNT_SELECT)
      .maybeSingle();

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

      if (error.code === "23514") {
        return noStoreJson(
          {
            error:
              "Kuota tidak boleh lebih kecil dari jumlah pemakaian saat ini.",
          },
          { status: 400 },
        );
      }

      console.error("Failed to update discount:", error.message);
      return noStoreJson(
        { error: "Diskon gagal diperbarui." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Diskon tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({
      discount: toDiscount(data as unknown as DiscountRow),
    });
  } catch (error) {
    console.error(
      "Update discount error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat memperbarui diskon." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await guardAdminApi(request, "discounts-write", 60);

  if (!guard.ok) return guard.response;

  const id = await readId(context);

  if (!id) {
    return noStoreJson({ error: "ID diskon tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("discounts")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (isMissingDiscountsTable(error)) {
        return noStoreJson(
          { error: TABLE_MISSING_MESSAGE },
          { status: 503 },
        );
      }

      console.error("Failed to delete discount:", error.message);
      return noStoreJson(
        { error: "Diskon gagal dihapus." },
        { status: 500 },
      );
    }

    if (!data) {
      return noStoreJson(
        { error: "Diskon tidak ditemukan." },
        { status: 404 },
      );
    }

    return noStoreJson({ deleted: true, id: data.id });
  } catch (error) {
    console.error(
      "Delete discount error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat menghapus diskon." },
      { status: 500 },
    );
  }
}
