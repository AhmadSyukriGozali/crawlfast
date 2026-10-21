"use client";

import Link from "next/link";
import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminDiscounts } from "@/features/discounts/hooks/useAdminDiscounts";
import type { AdminDiscount } from "@/features/discounts/types";
import {
  formatDiscountValue,
  todayInJakarta,
} from "@/lib/discounts/calculate";
import { formatRupiah } from "@/lib/format";

type Status = {
  label: string;
  className: string;
};

function getStatus(discount: AdminDiscount): Status {
  const today = todayInJakarta();

  if (!discount.isActive) {
    return { label: "Nonaktif", className: "bg-slate-100 text-slate-500" };
  }

  if (discount.startsOn && today < discount.startsOn) {
    return { label: "Terjadwal", className: "bg-amber-50 text-amber-700" };
  }

  if (discount.endsOn && today > discount.endsOn) {
    return { label: "Kedaluwarsa", className: "bg-red-50 text-red-700" };
  }

  if (
    discount.usageLimit !== null &&
    discount.usageLimit !== undefined &&
    discount.usedCount >= discount.usageLimit
  ) {
    return { label: "Kuota habis", className: "bg-orange-50 text-orange-700" };
  }

  return { label: "Aktif", className: "bg-emerald-50 text-emerald-700" };
}

function formatPeriod(discount: AdminDiscount): string {
  if (!discount.startsOn && !discount.endsOn) return "Tanpa batas";

  const start = discount.startsOn ?? "…";
  const end = discount.endsOn ?? "…";

  return `${start} — ${end}`;
}

export default function AdminDiscountsPage() {
  const {
    email,
    discounts,
    loading,
    error,
    logout,
    loadDiscounts,
    deleteDiscount,
  } = useAdminDiscounts();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(discount: AdminDiscount) {
    if (
      !window.confirm(
        `Hapus kode diskon "${discount.code}"? Pelanggan tidak bisa memakainya lagi setelah dihapus.`,
      )
    ) {
      return;
    }

    setDeletingId(discount.id);
    await deleteDiscount(discount.id);
    setDeletingId(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={email}
        loading={loading}
        active="discounts"
        onRefresh={() => void loadDiscounts()}
        onLogout={() => void logout()}
      />

      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-700">PROMO</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Diskon
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Buat kode promo persen atau nominal, atur minimal belanja, masa
              berlaku, dan kuota pemakaian.
            </p>
          </div>

          <Link
            href="/admin/discounts/new"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            + Tambah diskon
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-bold">Data diskon bermasalah</p>
            <p className="mt-1 whitespace-pre-line">{error}</p>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold">Daftar kode diskon</h2>
            <span className="text-sm text-slate-500">
              {discounts.length} kode
            </span>
          </div>

          {loading && discounts.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">
              Memeriksa akses admin dan memuat diskon...
            </div>
          ) : discounts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold">Belum ada kode diskon</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Tambahkan kode promo pertama untuk mulai memberikan potongan
                harga di checkout.
              </p>
              <Link
                href="/admin/discounts/new"
                className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Buat kode diskon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Kode</th>
                    <th className="px-5 py-3 font-semibold">Potongan</th>
                    <th className="px-5 py-3 font-semibold">Min. belanja</th>
                    <th className="px-5 py-3 font-semibold">Periode</th>
                    <th className="px-5 py-3 font-semibold">Pemakaian</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discounts.map((discount) => {
                    const status = getStatus(discount);

                    return (
                      <tr key={discount.id} className="align-middle">
                        <td className="px-5 py-4">
                          <p className="font-mono text-sm font-bold tracking-wide">
                            {discount.code}
                          </p>
                          {discount.description && (
                            <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                              {discount.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {formatDiscountValue(discount)}
                          </p>
                          {discount.maxDiscount ? (
                            <p className="text-xs text-slate-400">
                              Maks. {formatRupiah(discount.maxDiscount)}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {discount.minSubtotal > 0
                            ? formatRupiah(discount.minSubtotal)
                            : "Tanpa minimum"}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          {formatPeriod(discount)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {discount.usedCount}
                          {discount.usageLimit
                            ? ` / ${discount.usageLimit}`
                            : " / ∞"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/discounts/${discount.id}/edit`}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === discount.id}
                              onClick={() => void handleDelete(discount)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === discount.id
                                ? "Menghapus..."
                                : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="pb-4 text-xs text-slate-500">
          Kode diskon diperiksa ulang di server saat checkout. Kuota pemakaian
          bertambah hanya setelah pesanan berhasil dibuat.
        </footer>
      </div>
    </main>
  );
}
