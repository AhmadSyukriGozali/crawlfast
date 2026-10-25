"use client";

import { use, useEffect, useMemo, useState } from "react";
import { io } from "next/cache";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import RevenueChart from "@/components/admin/RevenueChart";
import StatusChart from "@/components/admin/StatusChart";
import OrdersTable from "@/components/admin/OrdersTable";
import { useAdminOrders } from "@/features/orders/hooks/useAdminOrders";
import { isPaid, money } from "@/features/orders/utils";

function todayLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export default function AdminPage() {
  use(io());

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      paymentStatus: paymentFilter,
      orderStatus: orderFilter,
      dateFrom: invalidDateRange ? "" : dateFrom,
      dateTo: invalidDateRange ? "" : dateTo,
    }),
    [
      debouncedSearch,
      paymentFilter,
      orderFilter,
      dateFrom,
      dateTo,
      invalidDateRange,
    ],
  );

  const {
    email,
    orders,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    loadOrders,
    logout,
  } = useAdminOrders(filters);

  const paidOrders = useMemo(
    () => orders.filter((order) => isPaid(order.payment_status)),
    [orders],
  );

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (order) => order.payment_status?.toLowerCase() === "pending",
      ).length,
    [orders],
  );

  const paidRevenue = useMemo(
    () =>
      paidOrders.reduce(
        (sum, order) => sum + (Number(order.total_amount) || 0),
        0,
      ),
    [paidOrders],
  );

  const averageOrder = paidOrders.length
    ? paidRevenue / paidOrders.length
    : 0;

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setPaymentFilter("all");
    setOrderFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const handlePaymentFilterChange = (value: string) => {
    setPage(1);
    setPaymentFilter(value);
  };

  const handleOrderFilterChange = (value: string) => {
    setPage(1);
    setOrderFilter(value);
  };

  const handleDateFromChange = (value: string) => {
    setPage(1);
    setDateFrom(value);
  };

  const handleDateToChange = (value: string) => {
    setPage(1);
    setDateTo(value);
  };

  const firstResult =
    invalidDateRange || totalCount === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastResult = invalidDateRange
    ? 0
    : Math.min(page * pageSize, totalCount);

  return (
    <main id="main" className="admin-shell admin-main">
      <AdminHeader
        email={email}
        loading={loading}
        onRefresh={() => void loadOrders()}
        onLogout={() => void logout()}
      />

      <div className="admin-container space-y-6">
        <header className="admin-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Overview</p>
            <h1 className="admin-title">
              Dasbor <span className="serif-accent text-[#8a6a3a]">harian.</span>
            </h1>
            <p className="admin-subtitle">
              Pantau arus pesanan, konfirmasi pembayaran, dan performa
              CrawlFast dalam satu layar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4dfd2] bg-[#fffdf8]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f7064]">
              <CalendarDays size={13} strokeWidth={1.7} aria-hidden="true" />
              {todayLabel()}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7d8a6d]/25 bg-[#eef0e7] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4b5741]">
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-[#7d8a6d]" />
              Live data
            </span>
          </div>
        </header>

        {error && (
          <section
            role="alert"
            className="admin-rise flex flex-col gap-2 rounded-xl border border-[#a95f3d]/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Data gagal dimuat</p>
              <p className="mt-0.5 text-xs text-[#a06a52]">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="admin-btn admin-btn-danger admin-btn-sm self-start sm:self-auto"
            >
              Coba lagi
            </button>
          </section>
        )}

        {loading && orders.length === 0 ? (
          <div
            className="space-y-6"
            aria-busy="true"
            aria-label="Memuat data pesanan"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="admin-card h-36 animate-pulse bg-[#faf7f0]"
                />
              ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <div className="admin-card h-80 animate-pulse bg-[#faf7f0]" />
              <div className="admin-card h-80 animate-pulse bg-[#faf7f0]" />
            </div>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Pesanan di halaman"
                value={String(orders.length)}
                description={`Maksimal ${pageSize} pesanan per halaman`}
                icon="orders"
                tone="ink"
              />
              <MetricCard
                title="Pembayaran berhasil"
                value={String(paidOrders.length)}
                description="Status settlement atau capture"
                icon="paid"
                tone="sage"
              />
              <MetricCard
                title="Menunggu pembayaran"
                value={String(pendingCount)}
                description="Perlu konfirmasi admin"
                icon="pending"
                tone="brass"
              />
              <MetricCard
                title="Omzet halaman ini"
                value={money.format(paidRevenue)}
                description="Hanya pembayaran terkonfirmasi"
                icon="revenue"
                tone="clay"
                emphasis="Verified"
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <RevenueChart orders={orders} />
              <StatusChart orders={orders} />
            </section>

            <section className="admin-card admin-card--flush">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eee9de] px-5 py-5 sm:px-6">
                <div>
                  <p className="admin-eyebrow">Transaksi</p>
                  <h2 className="admin-section-title mt-2">
                    Manajemen pesanan
                  </h2>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-[#6f7064]">
                    Cari pelanggan dan saring pesanan berdasarkan status
                    pembayaran, status pesanan, serta tanggal.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#ece7db] bg-[#faf7f0] px-3.5 py-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#8a6a3a] shadow-sm">
                    <ShieldCheck
                      size={15}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <span>
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#747569]">
                      Rata-rata lunas
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-[#2f302a]">
                      {money.format(averageOrder)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid items-end gap-3 border-b border-[#eee9de] bg-[#fdfbf6] px-5 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-5">
                <label className="relative block">
                  <span className="sr-only">Cari pesanan</span>
                  <Search
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#76776b]"
                  />
                  <input
                    value={search}
                    onChange={(event) =>
                      handleSearchChange(event.target.value)
                    }
                    placeholder="Cari nomor, nama, email…"
                    aria-label="Cari pesanan"
                    className="admin-input admin-input--icon-left"
                  />
                </label>

                <label className="block">
                  <span className="sr-only">Filter status pembayaran</span>
                  <select
                    value={paymentFilter}
                    onChange={(event) =>
                      handlePaymentFilterChange(event.target.value)
                    }
                    aria-label="Filter status pembayaran"
                    className="admin-select"
                  >
                    <option value="all">Semua pembayaran</option>
                    <option value="pending">Pending</option>
                    <option value="settlement">Settlement</option>
                    <option value="capture">Capture</option>
                    <option value="expire">Expire</option>
                    <option value="cancel">Cancel</option>
                    <option value="deny">Deny</option>
                  </select>
                </label>

                <label className="block">
                  <span className="sr-only">Filter status pesanan</span>
                  <select
                    value={orderFilter}
                    onChange={(event) =>
                      handleOrderFilterChange(event.target.value)
                    }
                    aria-label="Filter status pesanan"
                    className="admin-select"
                  >
                    <option value="all">Semua status pesanan</option>
                    <option value="pending_payment">Menunggu pembayaran</option>
                    <option value="pending">Pending (lama)</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#747569]">
                    Dari tanggal
                  </span>
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(event) =>
                      handleDateFromChange(event.target.value)
                    }
                    aria-label="Tanggal awal pesanan"
                    className="admin-input"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#747569]">
                    Sampai tanggal
                  </span>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(event) =>
                      handleDateToChange(event.target.value)
                    }
                    aria-label="Tanggal akhir pesanan"
                    className="admin-input"
                  />
                </label>
              </div>

              {invalidDateRange && (
                <p
                  role="alert"
                  className="border-b border-[#a95f3d]/20 bg-[#fdf4ee] px-5 py-3 text-xs text-[#8f4a2c] sm:px-6"
                >
                  Tanggal awal tidak boleh melewati tanggal akhir.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[11px] text-[#6f7064] sm:px-6">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal
                    size={13}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  Menampilkan{" "}
                  <strong className="font-semibold text-[#3c3d34]">
                    {firstResult}–{lastResult}
                  </strong>{" "}
                  dari {invalidDateRange ? 0 : totalCount} pesanan
                </span>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8a6a3a] transition hover:text-[#171814]"
                >
                  <RotateCcw size={11} strokeWidth={1.9} aria-hidden="true" />
                  Reset filter
                </button>
              </div>

              {invalidDateRange ? (
                <div className="px-6 py-14 text-center text-sm text-[#6f7064]">
                  Periksa kembali rentang tanggal yang dipilih.
                </div>
              ) : (
                <OrdersTable orders={orders} />
              )}

              <div className="flex flex-col gap-4 border-t border-[#eee9de] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-[11px] text-[#6f7064]">
                  Halaman{" "}
                  <strong className="font-semibold text-[#3c3d34]">
                    {page}
                  </strong>{" "}
                  dari {Math.max(totalPages, 1)}
                  <span className="mx-2 text-[#c9c3b6]">·</span>
                  Total {totalCount} pesanan
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loading || page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                  >
                    <ChevronLeft size={13} strokeWidth={2} aria-hidden="true" />
                    Sebelumnya
                  </button>

                  <span className="grid h-8 min-w-8 place-items-center rounded-lg border border-[#e4dfd2] bg-white px-2 font-mono text-[11px] font-semibold text-[#3c3d34]">
                    {page}
                  </span>

                  <button
                    type="button"
                    disabled={
                      loading || page >= totalPages || totalPages === 0
                    }
                    onClick={() => setPage((current) => current + 1)}
                    className="admin-btn admin-btn-primary admin-btn-sm"
                  >
                    Berikutnya
                    <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <p className="border-t border-[#eee9de] px-5 py-3 text-[10px] leading-5 text-[#76776b] sm:px-6">
                Pencarian dan filter berlaku untuk seluruh riwayat pesanan.
                Statistik dan grafik hanya menghitung pesanan pada halaman
                aktif (maksimal {pageSize} pesanan).
              </p>
            </section>
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4dfd2] pb-4 pt-5 text-[10px] uppercase tracking-[0.12em] text-[#76776b]">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#b08d57]" />
            CrawlFast Admin · Internal management
          </span>
          <span>Status pembayaran bersumber dari database</span>
        </footer>
      </div>
    </main>
  );
}
