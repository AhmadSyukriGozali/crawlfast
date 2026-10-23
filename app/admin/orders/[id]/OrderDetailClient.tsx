"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminOrderDetail } from "@/features/orders/hooks/useAdminOrderDetail";
import { useAdminSession } from "@/features/admin/useAdminSession";
import type { Order } from "@/features/orders/types";
import { formatDate, formatStatus, money } from "@/features/orders/utils";

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu pembayaran" },
  { value: "settlement", label: "Lunas (settlement)" },
  { value: "capture", label: "Lunas (capture)" },
  { value: "expire", label: "Kedaluwarsa" },
  { value: "cancel", label: "Dibatalkan" },
  { value: "deny", label: "Ditolak" },
] as const;

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "pending_payment", label: "Menunggu pembayaran" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-[#f0ece2] py-2.5 first:border-t-0 first:pt-0">
      <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#76776b]">
        {label}
      </dt>
      <dd className="whitespace-pre-line text-[12px] font-medium text-[#3c3d34]">
        {children || "—"}
      </dd>
    </div>
  );
}

function OrderStatusForm({
  order,
  updateStatus,
}: {
  order: Order;
  updateStatus: (
    paymentStatus: string,
    orderStatus: string,
  ) => Promise<void>;
}) {
  const [paymentStatus, setPaymentStatus] = useState(
    order.payment_status || "pending",
  );
  const [orderStatus, setOrderStatus] = useState(
    order.order_status || "pending_payment",
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleStatusUpdate() {
    setSavingStatus(true);
    setStatusError("");
    setStatusMessage("");

    try {
      await updateStatus(paymentStatus, orderStatus);
      setStatusMessage("Status pesanan berhasil diperbarui.");
    } catch (updateError) {
      setStatusError(
        updateError instanceof Error
          ? updateError.message
          : "Status pesanan gagal diperbarui.",
      );
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="mt-5 border-t border-[#eee9de] pt-5">
      <h3 className="text-[12px] font-semibold text-[#2f302a]">
        Ubah status manual
      </h3>
      <p className="mt-1 text-[10.5px] leading-5 text-[#6f7064]">
        Gunakan bagian ini untuk mengonfirmasi pembayaran WhatsApp atau
        memperbarui proses pesanan. Status lunas akan mengisi tanggal
        pembayaran otomatis.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="admin-label">Status pembayaran</span>
          <select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setStatusMessage("");
            }}
            className="admin-select"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="admin-label">Status pesanan</span>
          <select
            value={orderStatus}
            onChange={(event) => {
              setOrderStatus(event.target.value);
              setStatusMessage("");
            }}
            className="admin-select"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {statusError && (
        <p className="mt-3 rounded-lg border border-[#a95f3d]/25 bg-[#fdf4ee] px-3 py-2 text-[11px] text-[#8f4a2c]">
          {statusError}
        </p>
      )}

      {statusMessage && (
        <p className="mt-3 rounded-lg border border-[#7d8a6d]/30 bg-[#eef0e7] px-3 py-2 text-[11px] text-[#4b5741]">
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleStatusUpdate()}
        disabled={savingStatus}
        className="admin-btn admin-btn-primary mt-4 w-full"
      >
        <Save size={13} strokeWidth={1.9} aria-hidden="true" />
        {savingStatus ? "Menyimpan..." : "Simpan status"}
      </button>
    </div>
  );
}

export default function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  const session = useAdminSession();
  const { order, loading, error, loadOrder, updateStatus } =
    useAdminOrderDetail(id);

  return (
    <main className="admin-shell admin-main">
      <AdminHeader
        email={session.email}
        loading={loading || session.loading}
        active="orders"
        onRefresh={() => void loadOrder()}
        onLogout={() => void session.logout()}
      />

      {loading && !order ? (
        <div className="admin-container max-w-[1200px] space-y-4">
          <div className="h-4 w-40 animate-pulse rounded bg-[#e9e4d8]" />
          <div className="h-24 animate-pulse rounded-xl bg-[#e9e4d8]" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-56 animate-pulse rounded-xl bg-[#e9e4d8]" />
            <div className="h-56 animate-pulse rounded-xl bg-[#e9e4d8]" />
          </div>
        </div>
      ) : error || !order ? (
        <div className="admin-container max-w-[900px]">
          <div className="admin-card p-6">
            <p className="admin-eyebrow">Order detail</p>
            <h1 className="admin-title text-2xl">
              Pesanan tidak tersedia.
            </h1>
            <p className="mt-2 text-sm text-[#8f4a2c]">
              {error || "Pesanan tidak ditemukan."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadOrder()}
                className="admin-btn admin-btn-primary"
              >
                <RefreshCw size={13} strokeWidth={1.9} aria-hidden="true" />
                Coba lagi
              </button>
              <Link href="/admin" className="admin-btn admin-btn-ghost">
                Kembali ke dasbor
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-container max-w-[1200px] space-y-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f7064] transition hover:text-[#171814]"
          >
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
            Kembali ke dasbor
          </Link>

          <header className="admin-rise flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="admin-eyebrow">Order detail</p>
              <h1 className="admin-title font-mono text-[clamp(1.4rem,2.2vw,2.1rem)]">
                {order.order_number}
              </h1>
              <p className="admin-subtitle inline-flex items-center gap-1.5">
                <CalendarDays
                  size={12}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {formatDate(order.created_at)} · {order.customer_name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={order.payment_status} />
              <StatusBadge value={order.order_status} />
              <button
                type="button"
                onClick={() => void loadOrder()}
                className="admin-btn admin-btn-ghost admin-btn-sm"
              >
                <RefreshCw size={12} strokeWidth={1.9} aria-hidden="true" />
                Muat ulang
              </button>
            </div>
          </header>

          <section className="admin-card admin-card--flush">
            <div className="grid grid-cols-2 divide-[#eee9de] sm:grid-cols-4 sm:divide-x">
              <div className="px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                  Total pesanan
                </p>
                <p className="admin-stat-value mt-2 text-[1.65rem]">
                  {money.format(Number(order.total_amount) || 0)}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                  Pembayaran
                </p>
                <p className="mt-2.5">
                  <StatusBadge value={order.payment_status} />
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                  Status pesanan
                </p>
                <p className="mt-2.5">
                  <StatusBadge value={order.order_status} />
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
                  Gateway
                </p>
                <p className="mt-2.5 text-[12px] font-semibold text-[#2f302a]">
                  {order.payment_gateway || "—"}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="space-y-5">
              <section className="grid gap-5 sm:grid-cols-2">
                <div className="admin-card p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="admin-icon-tile" data-tone="ink">
                      <User size={15} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h2 className="admin-section-title">Pelanggan</h2>
                  </div>
                  <dl className="mt-4">
                    <InfoRow label="Nama">
                      {order.customer_name || "-"}
                    </InfoRow>
                    <InfoRow label="Email">
                      <span className="break-all">
                        {order.customer_email || "-"}
                      </span>
                    </InfoRow>
                    <InfoRow label="Telepon">
                      {order.customer_phone || "-"}
                    </InfoRow>
                    <InfoRow label="Catatan">
                      {order.customer_notes || "-"}
                    </InfoRow>
                  </dl>
                </div>

                <div className="admin-card p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="admin-icon-tile" data-tone="sage">
                      <MapPin size={15} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h2 className="admin-section-title">Pengiriman</h2>
                  </div>
                  <dl className="mt-4">
                    <InfoRow label="Alamat">
                      {order.shipping_address || "-"}
                    </InfoRow>
                    <InfoRow label="Kota / Provinsi">
                      {[order.shipping_city, order.shipping_province]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </InfoRow>
                    <InfoRow label="Kode pos">
                      {order.shipping_postal_code || "-"}
                    </InfoRow>
                    <InfoRow label="Dibayar pada">
                      {order.paid_at ? formatDate(order.paid_at) : "-"}
                    </InfoRow>
                  </dl>
                </div>
              </section>

              <section className="admin-card admin-card--flush">
                <div className="flex items-center justify-between gap-3 border-b border-[#eee9de] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="admin-icon-tile" data-tone="brass">
                      <Package size={15} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h2 className="admin-section-title">Item pesanan</h2>
                  </div>
                  <span className="admin-chip" data-tone="neutral">
                    {order.order_items?.length ?? 0} item
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="admin-table min-w-[520px]">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Ukuran</th>
                        <th className="text-right">Harga</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items?.length ? (
                        order.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="font-medium text-[#2f302a]">
                              {item.product_name}
                            </td>
                            <td>
                              {item.size ? (
                                <span className="inline-flex min-w-7 items-center justify-center rounded-md border border-[#e4dfd2] bg-[#faf7f0] px-1.5 py-0.5 font-mono text-[10px] text-[#6b6c61]">
                                  {item.size}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="text-right text-[11.5px] text-[#6b6c61]">
                              {money.format(Number(item.unit_price) || 0)}
                            </td>
                            <td className="text-right font-mono text-[11px] text-[#6b6c61]">
                              {item.quantity}
                            </td>
                            <td className="text-right font-semibold text-[#2f302a]">
                              {money.format(Number(item.line_total) || 0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-8 text-center text-[#6f7064]"
                          >
                            Tidak ada item pesanan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[#eee9de] bg-[#fdfbf6] px-5 py-4">
                  <div className="ml-auto max-w-sm space-y-2 text-[11.5px]">
                    <div className="flex justify-between gap-4 text-[#6b6c61]">
                      <span>Subtotal produk</span>
                      <span className="font-mono">
                        {money.format(Number(order.subtotal) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-[#6b6c61]">
                      <span>Ongkos kirim</span>
                      <span className="font-mono">
                        {money.format(Number(order.shipping_cost) || 0)}
                      </span>
                    </div>
                    {Number(order.discount_amount) > 0 && (
                      <div className="flex justify-between gap-4 text-[#4b5741]">
                        <span>
                          Diskon
                          {order.discount_code
                            ? ` (${order.discount_code})`
                            : ""}
                        </span>
                        <span className="font-mono">
                          -{money.format(Number(order.discount_amount) || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 border-t border-[#e4dfd2] pt-2.5 text-[13px] font-semibold text-[#171814]">
                      <span>Total</span>
                      <span className="font-mono">
                        {money.format(Number(order.total_amount) || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="admin-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="admin-icon-tile" data-tone="clay">
                    <ShieldCheck
                      size={15}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h2 className="admin-section-title">Status pesanan</h2>
                    <p className="mt-0.5 text-[10.5px] text-[#76776b]">
                      {formatStatus(order.order_status)}
                    </p>
                  </div>
                </div>

                <OrderStatusForm
                  key={order.id}
                  order={order}
                  updateStatus={updateStatus}
                />
              </section>

              <section className="admin-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="admin-icon-tile" data-tone="brass">
                    <CreditCard
                      size={15}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <h2 className="admin-section-title">Pembayaran</h2>
                </div>
                <dl className="mt-4">
                  <InfoRow label="Gateway">
                    {order.payment_gateway || "-"}
                  </InfoRow>
                  <InfoRow label="Status pembayaran">
                    <StatusBadge value={order.payment_status} />
                  </InfoRow>
                  <InfoRow label="Tanggal pesanan">
                    {formatDate(order.created_at)}
                  </InfoRow>
                  <InfoRow label="Dibayar pada">
                    {order.paid_at ? formatDate(order.paid_at) : "-"}
                  </InfoRow>
                </dl>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
