"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminSession } from "@/features/admin/useAdminSession";
import type {
  AdminDiscount,
  AdminDiscountsResponse,
} from "@/features/discounts/types";
import type { DiscountType } from "@/lib/discounts/constants";
import { normalizeDiscountCode } from "@/lib/discounts/validation";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";

type Props = {
  discountId?: string;
};

type FormState = {
  code: string;
  description: string;
  type: DiscountType;
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  startsOn: string;
  endsOn: string;
  usageLimit: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  type: "percentage",
  value: "10",
  minSubtotal: "0",
  maxDiscount: "",
  startsOn: "",
  endsOn: "",
  usageLimit: "",
  isActive: true,
};

function toForm(discount: AdminDiscount): FormState {
  return {
    code: discount.code,
    description: discount.description ?? "",
    type: discount.type,
    value: String(discount.value),
    minSubtotal: String(discount.minSubtotal),
    maxDiscount: discount.maxDiscount ? String(discount.maxDiscount) : "",
    startsOn: discount.startsOn ?? "",
    endsOn: discount.endsOn ?? "",
    usageLimit: discount.usageLimit ? String(discount.usageLimit) : "",
    isActive: discount.isActive,
  };
}

export default function DiscountForm({ discountId }: Props) {
  const router = useRouter();
  const session = useAdminSession();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [discountLoading, setDiscountLoading] = useState(Boolean(discountId));
  const [discountError, setDiscountError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [usedCount, setUsedCount] = useState(0);

  useEffect(() => {
    if (!discountId) return;

    let cancelled = false;

    async function loadDiscount() {
      setDiscountLoading(true);
      setDiscountError("");

      try {
        const response = await adminFetch(
          `/api/admin/discounts/${discountId}`,
        );

        if (!response) {
          router.replace("/login");
          return;
        }

        if (response.status === 401 || response.status === 403) {
          await signOutAdmin();
          router.replace("/login");
          return;
        }

        const result = (await response.json().catch(() => null)) as
          | AdminDiscountsResponse
          | null;

        if (!response.ok || !result?.discount) {
          throw new Error(result?.error || "Diskon gagal dimuat.");
        }

        if (!cancelled) {
          setForm(toForm(result.discount));
          setUsedCount(result.discount.usedCount);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDiscountError(
            loadError instanceof Error
              ? loadError.message
              : "Diskon gagal dimuat.",
          );
        }
      } finally {
        if (!cancelled) setDiscountLoading(false);
      }
    }

    void loadDiscount();

    return () => {
      cancelled = true;
    };
  }, [discountId, router]);

  function setField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const payload = {
        code: form.code,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minSubtotal: Number(form.minSubtotal || 0),
        maxDiscount:
          form.type === "percentage" && form.maxDiscount
            ? Number(form.maxDiscount)
            : null,
        startsOn: form.startsOn || null,
        endsOn: form.endsOn || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        isActive: form.isActive,
      };

      const response = await adminFetch(
        discountId
          ? `/api/admin/discounts/${discountId}`
          : "/api/admin/discounts",
        {
          method: discountId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response) {
        router.replace("/login");
        return;
      }

      if (response.status === 401 || response.status === 403) {
        await signOutAdmin();
        router.replace("/login");
        return;
      }

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Diskon gagal disimpan.");
      }

      router.push("/admin/discounts");
      router.refresh();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Diskon gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  const loading = session.loading || discountLoading;
  const displayError = session.error || discountError;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={session.email}
        loading={loading}
        active="discounts"
        onRefresh={() => {
          if (discountId) {
            router.refresh();
          } else {
            void session.reload();
          }
        }}
        onLogout={() => void session.logout()}
      />

      <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 sm:py-9">
        <Link
          href="/admin/discounts"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Kembali ke diskon
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold text-emerald-700">PROMO</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {discountId ? "Ubah diskon" : "Tambah diskon"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Kode akan diperiksa ulang saat pelanggan checkout.
          </p>
        </header>

        {(displayError || formError) && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {formError || displayError}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Memuat data diskon...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Kode diskon
                </span>
                <input
                  required
                  value={form.code}
                  onChange={(event) =>
                    setField(
                      "code",
                      normalizeDiscountCode(event.target.value),
                    )
                  }
                  maxLength={32}
                  placeholder="WELCOME10"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Huruf, angka, dan tanda hubung. Akan disimpan dalam huruf
                  besar.
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Deskripsi (opsional)
                </span>
                <input
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  maxLength={300}
                  placeholder="Contoh: Diskon pembukaan toko"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Tipe potongan
                </span>
                <select
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value as DiscountType;
                    setForm((current) => ({
                      ...current,
                      type,
                      value: type === "percentage" ? "10" : "50000",
                      maxDiscount:
                        type === "percentage" ? current.maxDiscount : "",
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="percentage">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  {form.type === "percentage"
                    ? "Besar diskon (%)"
                    : "Besar diskon (Rp)"}
                </span>
                <input
                  required
                  type="number"
                  min={form.type === "percentage" ? 1 : 1000}
                  max={form.type === "percentage" ? 100 : 100000000}
                  step={form.type === "percentage" ? 1 : 1000}
                  value={form.value}
                  onChange={(event) => setField("value", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Minimal belanja (Rp)
                </span>
                <input
                  type="number"
                  min={0}
                  max={100000000}
                  step={1000}
                  value={form.minSubtotal}
                  onChange={(event) =>
                    setField("minSubtotal", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Isi 0 jika tanpa minimal belanja.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Maksimal potongan (Rp)
                </span>
                <input
                  type="number"
                  min={1}
                  max={100000000}
                  step={1000}
                  disabled={form.type !== "percentage"}
                  value={form.maxDiscount}
                  onChange={(event) =>
                    setField("maxDiscount", event.target.value)
                  }
                  placeholder="Tanpa batas"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Hanya berlaku untuk diskon persen.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Mulai berlaku
                </span>
                <input
                  type="date"
                  value={form.startsOn}
                  onChange={(event) => setField("startsOn", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Kosongkan jika langsung berlaku.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Berakhir
                </span>
                <input
                  type="date"
                  value={form.endsOn}
                  onChange={(event) => setField("endsOn", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Kosongkan jika tanpa batas waktu.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Kuota pemakaian
                </span>
                <input
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  value={form.usageLimit}
                  onChange={(event) =>
                    setField("usageLimit", event.target.value)
                  }
                  placeholder="Tanpa batas"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                {discountId && (
                  <span className="mt-1.5 block text-xs text-slate-500">
                    Sudah dipakai {usedCount} kali. Kuota tidak boleh lebih
                    kecil dari angka ini.
                  </span>
                )}
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setField("isActive", event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 accent-emerald-700"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Aktifkan kode diskon
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    Kode nonaktif tetap tersimpan tetapi tidak bisa dipakai.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/admin/discounts"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : discountId
                    ? "Simpan perubahan"
                    : "Tambahkan diskon"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
