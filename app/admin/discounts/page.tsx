"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgePercent,
  CalendarRange,
  Pencil,
  Plus,
  TicketPercent,
  Trash2,
  Zap,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAdminDiscounts } from "@/features/discounts/hooks/useAdminDiscounts";
import type { AdminDiscount } from "@/features/discounts/types";
import {
  formatDiscountValue,
  todayInJakarta,
} from "@/lib/discounts/calculate";
import { formatRupiah } from "@/lib/format";

type StatusTone = "success" | "warn" | "danger" | "neutral";

type Status = {
  label: string;
  tone: StatusTone;
};

function getStatus(discount: AdminDiscount): Status {
  const today = todayInJakarta();

  if (!discount.isActive) {
    return { label: "Nonaktif", tone: "neutral" };
  }

  if (discount.startsOn && today < discount.startsOn) {
    return { label: "Terjadwal", tone: "warn" };
  }

  if (discount.endsOn && today > discount.endsOn) {
    return { label: "Kedaluwarsa", tone: "danger" };
  }

  if (
    discount.usageLimit !== null &&
    discount.usageLimit !== undefined &&
    discount.usedCount >= discount.usageLimit
  ) {
    return { label: "Kuota habis", tone: "danger" };
  }

  return { label: "Aktif", tone: "success" };
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
  const [pendingDelete, setPendingDelete] = useState<AdminDiscount | null>(
    null,
  );

  const activeCount = discounts.filter(
    (discount) => getStatus(discount).label === "Aktif",
  ).length;

  const totalUsage = discounts.reduce(
    (sum, discount) => sum + discount.usedCount,
    0,
  );

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    await deleteDiscount(pendingDelete.id);
    setDeletingId(null);
    setPendingDelete(null);
  }

  const stats = [
    {
      label: "Total kode",
      value: discounts.length,
      hint: "Seluruh kampanye",
      icon: TicketPercent,
      tone: "ink" as const,
    },
    {
      label: "Kode aktif",
      value: activeCount,
      hint: "Siap dipakai checkout",
      icon: Zap,
      tone: "sage" as const,
    },
    {
      label: "Total pemakaian",
      value: totalUsage,
      hint: "Akumulasi seluruh kode",
      icon: BadgePercent,
      tone: "brass" as const,
    },
  ];

  return (
    <main id="main" className="admin-shell admin-main">
      <AdminHeader
        email={email}
        loading={loading}
        active="discounts"
        onRefresh={() => void loadDiscounts()}
        onLogout={() => void logout()}
      />

      <div className="admin-container space-y-6">
        <header className="admin-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Promo</p>
            <h1 className="admin-title">
              Diskon{" "}
              <span className="serif-accent text-[#8a6a3a]">musiman.</span>
            </h1>
            <p className="admin-subtitle">
              Buat kode promo persen atau nominal, atur minimal belanja, masa
              berlaku, dan kuota pemakaian.
            </p>
          </div>

          <Link
            href="/admin/discounts/new"
            className="admin-btn admin-btn-accent self-start sm:self-auto"
          >
            <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
            Tambah diskon
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-[#a95f3d]/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Data diskon bermasalah</p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-[#a06a52]">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadDiscounts()}
              className="admin-btn admin-btn-danger admin-btn-sm self-start sm:self-auto"
            >
              Coba lagi
            </button>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="admin-card admin-hover-lift flex items-center gap-4 p-5"
              >
                <span className="admin-icon-tile" data-tone={stat.tone}>
                  <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                    {stat.label}
                  </p>
                  <p className="admin-stat-value mt-1.5 text-[2rem]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10.5px] text-[#76776b]">
                    {stat.hint}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="admin-card admin-card--flush">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee9de] px-5 py-5 sm:px-6">
            <div>
              <p className="admin-eyebrow">Kampanye</p>
              <h2 className="admin-section-title mt-2">Daftar kode diskon</h2>
            </div>
            <span className="admin-chip" data-tone="neutral">
              <CalendarRange size={10} strokeWidth={2} aria-hidden="true" />
              {discounts.length} kode
            </span>
          </div>

          {loading && discounts.length === 0 ? (
            <div className="space-y-3 p-6" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-[#f6f2e9]"
                />
              ))}
            </div>
          ) : discounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[#e4dfd2] bg-[#f8f5ed] text-[#6f7064]">
                <TicketPercent size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#3c3d34]">
                Belum ada kode diskon
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[#6f7064]">
                Tambahkan kode promo pertama untuk mulai memberikan potongan
                harga di checkout.
              </p>
              <Link
                href="/admin/discounts/new"
                className="admin-btn admin-btn-primary admin-btn-sm mt-5"
              >
                <Plus size={13} strokeWidth={2.2} aria-hidden="true" />
                Buat kode diskon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <caption className="sr-only">Daftar kode diskon</caption>
                <thead>
                  <tr>
                    <th scope="col">Kode</th>
                    <th scope="col">Potongan</th>
                    <th scope="col">Min. belanja</th>
                    <th scope="col">Periode</th>
                    <th scope="col">Pemakaian</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => {
                    const status = getStatus(discount);
                    const usagePercent =
                      discount.usageLimit && discount.usageLimit > 0
                        ? Math.min(
                            (discount.usedCount / discount.usageLimit) * 100,
                            100,
                          )
                        : 0;

                    return (
                      <tr key={discount.id}>
                        <td>
                          <span className="inline-flex rounded-md border border-[#e4dfd2] bg-[#faf7f0] px-2 py-1 font-mono text-[11px] font-bold tracking-[0.08em] text-[#3c3d34]">
                            {discount.code}
                          </span>
                          {discount.description && (
                            <p className="mt-1.5 max-w-[240px] truncate text-[10.5px] text-[#76776b]">
                              {discount.description}
                            </p>
                          )}
                        </td>
                        <td>
                          <p className="text-[12.5px] font-semibold text-[#2f302a]">
                            {formatDiscountValue(discount)}
                          </p>
                          {discount.maxDiscount ? (
                            <p className="mt-0.5 text-[10px] text-[#76776b]">
                              Maks. {formatRupiah(discount.maxDiscount)}
                            </p>
                          ) : null}
                        </td>
                        <td className="text-[11.5px] text-[#6b6c61]">
                          {discount.minSubtotal > 0
                            ? formatRupiah(discount.minSubtotal)
                            : "Tanpa minimum"}
                        </td>
                        <td className="whitespace-nowrap font-mono text-[10.5px] text-[#6b6c61]">
                          {formatPeriod(discount)}
                        </td>
                        <td>
                          <p className="font-mono text-[11px] text-[#56584d]">
                            {discount.usedCount}
                            <span className="text-[#76776b]">
                              {discount.usageLimit
                                ? ` / ${discount.usageLimit}`
                                : " / ∞"}
                            </span>
                          </p>
                          {discount.usageLimit ? (
                            <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-[#f0ece2]">
                              <div
                                className="admin-bar h-full rounded-full bg-gradient-to-r from-[#8d9a7d] to-[#5b6650]"
                                style={{ width: `${Math.max(usagePercent, 2)}%` }}
                              />
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <span className="admin-chip" data-tone={status.tone}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/discounts/${discount.id}/edit`}
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                            >
                              <Pencil
                                size={12}
                                strokeWidth={1.9}
                                aria-hidden="true"
                              />
                              Edit
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === discount.id}
                              onClick={() => setPendingDelete(discount)}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                            >
                              <Trash2
                                size={12}
                                strokeWidth={1.9}
                                aria-hidden="true"
                              />
                              {deletingId === discount.id ? "…" : "Hapus"}
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

        <footer className="border-t border-[#e4dfd2] pb-4 pt-5 text-[10px] uppercase tracking-[0.12em] text-[#76776b]">
          Kode diskon diperiksa ulang di server saat checkout · kuota bertambah
          setelah pesanan berhasil dibuat
        </footer>
      </div>

      <ConfirmDialog
        variant="admin"
        open={pendingDelete !== null}
        title="Hapus kode diskon?"
        description={
          pendingDelete
            ? `Kode "${pendingDelete.code}" akan dihapus dan tidak bisa dipakai lagi oleh pelanggan.`
            : ""
        }
        busy={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  );
}
