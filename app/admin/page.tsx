
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import RevenueChart from "@/components/admin/RevenueChart";
import StatusChart from "@/components/admin/StatusChart";
import OrdersTable from "@/components/admin/OrdersTable";
import { useAdminOrders } from "@/features/orders/hooks/useAdminOrders";
import { isPaid, money } from "@/features/orders/utils";

export default function AdminPage() {
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

  const invalidDateRange = Boolean(
    dateFrom && dateTo && dateFrom > dateTo,
  );

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
    invalidDateRange || totalCount === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastResult = invalidDateRange
    ? 0
    : Math.min(page * pageSize, totalCount);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={email}
        loading={loading}
        onRefresh={() => void loadOrders()}
        onLogout={() => void logout()}
      />

      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <header>
          <p className="text-sm font-semibold text-emerald-700">
            OVERVIEW
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Pantau aktivitas dan performa pesanan CrawlFast.
          </p>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-bold">Data gagal dimuat</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-3 font-semibold underline"
            >
              Coba lagi
            </button>
          </section>
        )}

        {loading && orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            Memeriksa akses admin dan memuat data pesanan...
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Pesanan di halaman"
                value={String(orders.length)}
                description={`Maksimal ${pageSize} pesanan per halaman`}
                icon="▤"
              />
              <MetricCard
                title="Pembayaran berhasil"
                value={String(paidOrders.length)}
                description="Status settlement atau capture"
                icon="✓"
              />
              <MetricCard
                title="Menunggu pembayaran"
                value={String(pendingCount)}
                description="Status pending"
                icon="◷"
              />
              <MetricCard
                title="Omzet halaman ini"
                value={money.format(paidRevenue)}
                description="Hanya pembayaran terkonfirmasi"
                icon="↗"
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <RevenueChart orders={orders} />
              <StatusChart orders={orders} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Manajemen pesanan
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Cari pelanggan dan saring pesanan berdasarkan status
                    pembayaran, status pesanan, serta tanggal.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  Rata-rata pembayaran berhasil:{" "}
                  <span className="font-bold text-slate-900">
                    {money.format(averageOrder)}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-5">
                <input
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  placeholder="Cari nomor, nama, email..."
                  aria-label="Cari pesanan"
                  className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <select
                  value={paymentFilter}
                  onChange={(event) =>
                    handlePaymentFilterChange(event.target.value)
                  }
                  aria-label="Filter status pembayaran"
                  className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua pembayaran</option>
                  <option value="pending">Pending</option>
                  <option value="settlement">Settlement</option>
                  <option value="capture">Capture</option>
                  <option value="expire">Expire</option>
                  <option value="cancel">Cancel</option>
                  <option value="deny">Deny</option>
                </select>

                <select
                  value={orderFilter}
                  onChange={(event) =>
                    handleOrderFilterChange(event.target.value)
                  }
                  aria-label="Filter status pesanan"
                  className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua status pesanan</option>
                  <option value="pending_payment">Menunggu pembayaran</option>
                  <option value="pending">Pending (lama)</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <label className="min-w-0 text-xs font-medium text-slate-500">
                  Dari tanggal
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(event) =>
                      handleDateFromChange(event.target.value)
                    }
                    aria-label="Tanggal awal pesanan"
                    className="mt-1 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                </label>

                <label className="min-w-0 text-xs font-medium text-slate-500">
                  Sampai tanggal
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(event) =>
                      handleDateToChange(event.target.value)
                    }
                    aria-label="Tanggal akhir pesanan"
                    className="mt-1 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                </label>
              </div>

              {invalidDateRange && (
                <p
                  role="alert"
                  className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
                >
                  Tanggal awal tidak boleh melewati tanggal akhir.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-slate-500">
                <span>
                  Menampilkan {firstResult}–{lastResult} dari{" "}
                  {invalidDateRange ? 0 : totalCount} pesanan
                </span>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Reset filter
                </button>
              </div>

              {invalidDateRange ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Periksa kembali rentang tanggal yang dipilih.
                </div>
              ) : (
                <OrdersTable orders={orders} />
              )}

              <div className="flex flex-col gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Halaman {page} dari {Math.max(totalPages, 1)}
                  {" · "}
                  Total {totalCount} pesanan
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loading || page <= 1}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  <span className="px-2 text-sm font-semibold text-slate-700">
                    {page}
                  </span>

                  <button
                    type="button"
                    disabled={
                      loading ||
                      page >= totalPages ||
                      totalPages === 0
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 p-5 text-xs leading-5 text-slate-500">
                Pencarian dan filter berlaku untuk seluruh riwayat
                pesanan. Statistik dan grafik hanya menghitung pesanan
                pada halaman aktif (maksimal {pageSize} pesanan).
              </div>
            </section>
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 pb-4 text-xs text-slate-500">
          <span>CrawlFast Admin · Internal management</span>
          <span>Status pembayaran bersumber dari database.</span>
        </footer>
      </div>
    </main>
  );
}
