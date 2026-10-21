
"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAdminOrderDetail } from "@/features/orders/hooks/useAdminOrderDetail";
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
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold">Ubah status manual</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Gunakan bagian ini untuk mengonfirmasi pembayaran WhatsApp atau
        memperbarui proses pesanan. Status lunas akan mengisi tanggal
        pembayaran otomatis.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Status pembayaran
          <select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setStatusMessage("");
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Status pesanan
          <select
            value={orderStatus}
            onChange={(event) => {
              setOrderStatus(event.target.value);
              setStatusMessage("");
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
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
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {statusError}
        </p>
      )}

      {statusMessage && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleStatusUpdate()}
        disabled={savingStatus}
        className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
      >
        {savingStatus ? "Menyimpan..." : "Simpan status"}
      </button>
    </div>
  );
}

export default function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  const { order, loading, error, loadOrder, updateStatus } =
    useAdminOrderDetail(id);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-64 rounded-xl bg-slate-200" />
          <div className="h-48 rounded-xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-bold text-slate-900">
            Detail Pesanan Tidak Tersedia
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {error || "Pesanan tidak ditemukan."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadOrder()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Coba Lagi
            </button>
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              &larr; Kembali ke Dashboard
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
              Detail Pesanan
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Nomor pesanan: {order.order_number}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadOrder()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Muat Ulang
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Informasi Pelanggan</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Nama</dt>
                <dd className="font-medium">{order.customer_name || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="break-words font-medium">
                  {order.customer_email || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Nomor Telepon</dt>
                <dd className="font-medium">{order.customer_phone || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Catatan Pelanggan</dt>
                <dd className="whitespace-pre-line font-medium">
                  {order.customer_notes || "-"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Informasi Pembayaran & Pengiriman</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Alamat Pengiriman</dt>
                <dd className="whitespace-pre-line font-medium">
                  {order.shipping_address || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Kota</dt>
                <dd className="font-medium">{order.shipping_city || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Provinsi</dt>
                <dd className="font-medium">
                  {order.shipping_province || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Kode Pos</dt>
                <dd className="font-medium">
                  {order.shipping_postal_code || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Metode Pembayaran</dt>
                <dd className="font-medium">
                  {order.payment_gateway || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tanggal Pesanan</dt>
                <dd className="font-medium">{formatDate(order.created_at)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Tanggal Pembayaran Berhasil</dt>
                <dd className="font-medium">
                  {order.paid_at ? formatDate(order.paid_at) : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Status Pesanan</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <p className="mb-2 text-sm text-slate-500">Status pesanan</p>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {formatStatus(order.order_status)}
              </span>
            </div>
            <div>
              <p className="mb-2 text-sm text-slate-500">Status pembayaran</p>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {formatStatus(order.payment_status)}
              </span>
            </div>
          </div>

          <OrderStatusForm
            key={order.id}
            order={order}
            updateStatus={updateStatus}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Item Pesanan</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Ukuran</th>
                  <th className="px-5 py-3 text-right">Harga</th>
                  <th className="px-5 py-3 text-right">Jumlah</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.order_items?.length ? (
                  order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 font-medium">
                        {item.product_name}
                      </td>
                      <td className="px-5 py-4">{item.size || "-"}</td>
                      <td className="px-5 py-4 text-right">
                        {money.format(Number(item.unit_price) || 0)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {money.format(Number(item.line_total) || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      Tidak ada item pesanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 p-5">
            <div className="ml-auto max-w-sm space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Subtotal produk</span>
                <span>{money.format(Number(order.subtotal) || 0)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Ongkos kirim</span>
                <span>{money.format(Number(order.shipping_cost) || 0)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between gap-4 text-emerald-700">
                  <span>
                    Diskon
                    {order.discount_code ? ` (${order.discount_code})` : ""}
                  </span>
                  <span>
                    -{money.format(Number(order.discount_amount) || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold">
                <span>Total</span>
                <span>
                  {money.format(Number(order.total_amount) || 0)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
