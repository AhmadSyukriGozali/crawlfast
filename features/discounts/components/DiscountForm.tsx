"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, TicketPercent } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminSession } from "@/features/admin/useAdminSession";
import type {
  AdminDiscount,
  AdminDiscountsResponse,
} from "@/features/discounts/types";
import type { DiscountType } from "@/lib/discounts/constants";
import { normalizeDiscountCode } from "@/lib/discounts/validation";
import { adminFetch, signOutAdmin } from "@/lib/admin/client";
import { formatRupiah } from "@/lib/format";

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
    <main className="admin-shell admin-main">
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

      <div className="admin-container max-w-275">
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f7064] transition hover:text-[#171814]"
        >
          <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
          Kembali ke diskon
        </Link>

        <header className="admin-rise mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Promo</p>
            <h1 className="admin-title">
              {discountId ? "Ubah diskon" : "Tambah diskon"}
              <span className="serif-accent text-[#8a6a3a]">.</span>
            </h1>
            <p className="admin-subtitle">
              Kode akan diperiksa ulang saat pelanggan checkout.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#e4dfd2] bg-[#fffdf8]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#6f7064] sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b08d57]" />
            {discountId ? "Edit mode" : "New campaign"}
          </span>
        </header>

        {(displayError || formError) && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-clay/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c]"
          >
            {formError || displayError}
          </div>
        )}

        {loading ? (
          <div className="admin-card mt-6 space-y-4 p-6" aria-busy="true">
            <div className="h-4 w-40 animate-pulse rounded bg-[#f0ece2]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
          >
            <section className="admin-card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="admin-step" data-step="01">
                  Campaign
                </span>
                <span className="h-px flex-1 bg-[#eee9de]" />
              </div>
              <h2 className="admin-section-title mt-3">Detail diskon</h2>
              <p className="mt-1 text-xs leading-5 text-[#6f7064]">
                Atur kode, nilai potongan, dan batas pemakaian.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="admin-label">Kode diskon</span>
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
                    className="admin-input font-mono uppercase tracking-[0.08em]"
                  />
                  <span className="admin-hint">
                    Huruf, angka, dan tanda hubung. Akan disimpan dalam huruf
                    besar.
                  </span>
                </label>

                <label className="block sm:col-span-2">
                  <span className="admin-label">Deskripsi (opsional)</span>
                  <input
                    value={form.description}
                    onChange={(event) =>
                      setField("description", event.target.value)
                    }
                    maxLength={300}
                    placeholder="Contoh: Diskon pembukaan toko"
                    className="admin-input"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Tipe potongan</span>
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
                    className="admin-select"
                  >
                    <option value="percentage">Persen (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="admin-label">
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
                    className="admin-input"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Minimal belanja (Rp)</span>
                  <input
                    type="number"
                    min={0}
                    max={100000000}
                    step={1000}
                    value={form.minSubtotal}
                    onChange={(event) =>
                      setField("minSubtotal", event.target.value)
                    }
                    className="admin-input"
                  />
                  <span className="admin-hint">
                    Isi 0 jika tanpa minimal belanja.
                  </span>
                </label>

                <label className="block">
                  <span className="admin-label">Maksimal potongan (Rp)</span>
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
                    className="admin-input"
                  />
                  <span className="admin-hint">
                    Hanya berlaku untuk diskon persen.
                  </span>
                </label>

                <label className="block">
                  <span className="admin-label">Mulai berlaku</span>
                  <input
                    type="date"
                    value={form.startsOn}
                    onChange={(event) =>
                      setField("startsOn", event.target.value)
                    }
                    className="admin-input"
                  />
                  <span className="admin-hint">
                    Kosongkan jika langsung berlaku.
                  </span>
                </label>

                <label className="block">
                  <span className="admin-label">Berakhir</span>
                  <input
                    type="date"
                    value={form.endsOn}
                    onChange={(event) => setField("endsOn", event.target.value)}
                    className="admin-input"
                  />
                  <span className="admin-hint">
                    Kosongkan jika tanpa batas waktu.
                  </span>
                </label>

                <label className="block">
                  <span className="admin-label">Kuota pemakaian</span>
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
                    className="admin-input"
                  />
                  {discountId ? (
                    <span className="admin-hint">
                      Sudah dipakai {usedCount} kali. Kuota tidak boleh lebih
                      kecil dari angka ini.
                    </span>
                  ) : (
                    <span className="admin-hint">
                      Kosongkan untuk pemakaian tanpa batas.
                    </span>
                  )}
                </label>

                <label className="admin-option flex cursor-pointer items-start gap-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setField("isActive", event.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <span className="admin-switch" aria-hidden="true" />
                  <span>
                    <span className="block text-[12px] font-semibold text-[#2f302a]">
                      Aktifkan kode diskon
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-5 text-[#6f7064]">
                      Kode nonaktif tetap tersimpan tetapi tidak bisa dipakai.
                    </span>
                  </span>
                </label>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eee9de] pt-5 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/discounts"
                  className="admin-btn admin-btn-ghost"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  <Save size={14} strokeWidth={1.9} aria-hidden="true" />
                  {saving
                    ? "Menyimpan..."
                    : discountId
                      ? "Simpan perubahan"
                      : "Tambahkan diskon"}
                </button>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="admin-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="admin-step" data-step="02">
                    Preview
                  </span>
                  <span className="h-px flex-1 bg-[#eee9de]" />
                </div>

                <div className="mt-4 rounded-xl border border-dashed border-[#d5cebd] bg-[#faf7f0] px-4 py-6 text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-[#b08d57]/25 bg-[#f2e8d5] text-[#8a6a3a]">
                    <TicketPercent
                      size={17}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <p className="mt-3 truncate font-mono text-base font-bold tracking-[0.14em] text-[#2f302a]">
                    {form.code || "KODE"}
                  </p>
                  <p className="mt-2 font-display text-3xl leading-none text-[#8a6a3a]">
                    {form.type === "percentage"
                      ? `${form.value || 0}%`
                      : formatRupiah(Number(form.value) || 0)}
                  </p>
                  <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                    Potongan
                  </p>
                </div>

                <dl className="mt-4 space-y-2.5 text-[11px]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6f7064]">Min. belanja</dt>
                    <dd className="font-semibold text-[#3c3d34]">
                      {Number(form.minSubtotal) > 0
                        ? formatRupiah(Number(form.minSubtotal))
                        : "Tanpa minimum"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6f7064]">Periode</dt>
                    <dd className="text-right font-mono text-[10px] text-[#56584d]">
                      {form.startsOn || form.endsOn
                        ? `${form.startsOn || "…"} — ${form.endsOn || "…"}`
                        : "Tanpa batas"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6f7064]">Kuota</dt>
                    <dd className="font-mono text-[10px] text-[#56584d]">
                      {form.usageLimit
                        ? `${usedCount} / ${form.usageLimit}`
                        : `${usedCount} / ∞`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[#eee9de] pt-3">
                    <dt className="text-[#6f7064]">Status</dt>
                    <dd>
                      <span
                        className="admin-chip"
                        data-tone={form.isActive ? "success" : "neutral"}
                      >
                        {form.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="admin-card admin-card--soft p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a6a3a]">
                  Catatan
                </p>
                <p className="mt-1.5 text-[10.5px] leading-5 text-[#6b6c61]">
                  Kode diskon diperiksa ulang di server saat checkout. Kuota
                  pemakaian hanya bertambah setelah pesanan berhasil dibuat.
                </p>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
