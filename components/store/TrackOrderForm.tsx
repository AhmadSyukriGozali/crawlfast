"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock3,
  LoaderCircle,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { formatDate, formatRupiah, formatStatus } from "@/lib/format";

type TrackedOrder = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  city: string;
  province: string;
  createdAt: string;
  paidAt: string | null;
  items: {
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

const STEPS = [
  { key: "placed", label: "Pesanan dibuat", description: "Kami menerima pesananmu." },
  { key: "paid", label: "Pembayaran", description: "Menunggu konfirmasi pembayaran." },
  { key: "processing", label: "Diproses", description: "Pesanan sedang disiapkan." },
  { key: "shipped", label: "Dikirim", description: "Paket dalam perjalanan." },
  { key: "completed", label: "Selesai", description: "Pesanan telah diterima." },
] as const;

function paymentIsSuccessful(status: string) {
  return ["settlement", "capture"].includes(status.toLowerCase());
}

function paymentIsFailed(status: string) {
  return ["deny", "cancel", "expire", "failure"].includes(status.toLowerCase());
}

function stepIndex(order: TrackedOrder) {
  const orderStatus = order.orderStatus.toLowerCase();
  const paid = paymentIsSuccessful(order.paymentStatus);

  if (orderStatus === "completed") return 4;
  if (orderStatus === "shipped") return 3;
  if (orderStatus === "processing") return 2;
  if (paid) return 2;
  return orderStatus === "pending_payment" ? 0 : 1;
}

export default function TrackOrderForm() {
  const searchParams = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(
    (searchParams.get("order") ?? "").slice(0, 80),
  );
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });

      const result = (await response.json().catch(() => null)) as {
        order?: TrackedOrder;
        error?: string;
      } | null;

      if (!response.ok || !result?.order) {
        throw new Error(
          result?.error || "Status pesanan tidak dapat dimuat.",
        );
      }

      setOrder(result.order);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const activeStep = order ? stepIndex(order) : -1;
  const failed = order ? paymentIsFailed(order.paymentStatus) : false;
  const cancelled = order
    ? ["cancelled", "cancel"].includes(order.orderStatus.toLowerCase())
    : false;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div>
        <form onSubmit={handleSubmit} className="border border-line p-5 sm:p-7">
          <h2 className="text-lg font-medium">Cari pesanan</h2>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Masukkan nomor pesanan dan email yang digunakan saat checkout.
          </p>

          <div className="mt-6 space-y-4">
            <label className="field-label">
              Nomor pesanan
              <input
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                required
                maxLength={80}
                placeholder="CF-1750000000000-a1b2c3d4"
                autoComplete="off"
                className="field mt-2 font-mono text-xs"
              />
            </label>

            <label className="field-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                placeholder="nama@email.com"
                autoComplete="email"
                className="field mt-2"
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 border border-red-900/20 bg-red-50 p-3 text-xs leading-5 text-red-800"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary mt-5 w-full">
            {loading ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Mencari pesanan...
              </>
            ) : (
              <>
                <Search size={15} />
                Lacak pesanan
              </>
            )}
          </button>

          <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-ink-muted">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-sage" />
            Demi privasi, hanya nomor pesanan dan email yang cocok yang dapat
            melihat status. Data alamat dan telepon tidak ditampilkan.
          </p>
        </form>

        <div className="mt-5 border border-line p-5 text-xs leading-6 text-ink-soft">
          <p className="font-semibold text-ink">Belum menerima email?</p>
          <p className="mt-1">
            Konfirmasi pembayaran diproses otomatis oleh Midtrans. Jika status
            belum berubah setelah 10 menit, hubungi{" "}
            <Link href="/contact" className="text-sage underline underline-offset-4">
              tim kami
            </Link>
            .
          </p>
        </div>
      </div>

      <div aria-live="polite">
        {!order ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center border border-dashed border-line px-6 py-12 text-center">
            <Package size={30} strokeWidth={1.3} className="text-sage" />
            <p className="mt-4 text-lg tracking-tight">Status akan tampil di sini</p>
            <p className="mt-2 max-w-xs text-xs leading-5 text-ink-soft">
              Setelah pesanan ditemukan, kamu dapat melihat progres dan rincian
              produk.
            </p>
          </div>
        ) : (
          <div className="border border-line">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {order.orderNumber}
                </p>
                <h2 className="mt-2 text-2xl tracking-tight">
                  {formatStatus(order.orderStatus)}
                </h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Dibuat {formatDate(order.createdAt)}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  failed || cancelled
                    ? "bg-red-50 text-red-700"
                    : paymentIsSuccessful(order.paymentStatus)
                      ? "bg-sage/10 text-sage"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {failed || cancelled ? (
                  <XCircle size={13} />
                ) : paymentIsSuccessful(order.paymentStatus) ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <Clock3 size={13} />
                )}
                {formatStatus(order.paymentStatus)}
              </span>
            </div>

            <ol className="space-y-0 p-5 sm:p-6">
              {STEPS.map((step, index) => {
                const done = !failed && !cancelled && index <= activeStep;
                const current = !failed && !cancelled && index === activeStep;

                return (
                  <li key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <CheckCircle2 size={18} className="text-sage" />
                      ) : (
                        <Circle size={18} className="text-ink-muted/40" />
                      )}
                      {index < STEPS.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={`my-1 w-px flex-1 ${done ? "bg-sage/40" : "bg-line"}`}
                        />
                      )}
                    </div>

                    <div className={`pb-5 ${current ? "" : "opacity-70"}`}>
                      <p className={`text-xs font-semibold ${current ? "text-sage" : ""}`}>
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-5 text-ink-soft">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="border-t border-line p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                Rincian pesanan
              </p>

              <ul className="mt-3 divide-y divide-line">
                {order.items.map((item, index) => (
                  <li key={`${item.product_name}-${index}`} className="flex items-start justify-between gap-4 py-3 text-xs">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="mt-0.5 text-[10px] text-ink-muted">
                        {item.size ? `Ukuran ${item.size} · ` : ""}
                        {item.quantity} pcs
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">
                      {formatRupiah(Number(item.line_total) || 0)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
                <span className="text-xs text-ink-soft">Total</span>
                <span className="text-sm font-semibold">
                  {formatRupiah(Number(order.totalAmount) || 0)}
                </span>
              </div>

              <p className="mt-3 flex items-center gap-2 text-[10px] text-ink-muted">
                <PackageCheck size={13} />
                Dikirim ke {order.city}, {order.province}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
