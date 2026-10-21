"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Lock, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useMounted } from "@/lib/hooks/useMounted";
import { formatRupiah } from "@/lib/format";
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

type CheckoutForm = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  customer_notes: string;
  company: string;
};

const initialForm: CheckoutForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  shipping_address: "",
  shipping_city: "",
  shipping_province: "",
  shipping_postal_code: "",
  customer_notes: "",
  company: "",
};

const inputClass = "field mt-2";
const labelClass = "field-label";

export default function CheckoutPage() {
  const mounted = useMounted();
  const { items, totalItems, subtotal } = useCart();

  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const shipping = useMemo(() => calculateShipping(subtotal), [subtotal]);
  const total = subtotal + shipping;

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");

    if (items.length === 0) {
      setError("Keranjang kamu kosong. Tambahkan produk sebelum checkout.");
      return;
    }

    if (!termsAccepted) {
      setError("Setujui syarat & ketentuan serta kebijakan privasi.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            customer_name: form.customer_name,
            customer_email: form.customer_email,
            customer_phone: form.customer_phone,
            shipping_address: form.shipping_address,
            shipping_city: form.shipping_city,
            shipping_province: form.shipping_province,
            shipping_postal_code: form.shipping_postal_code,
            customer_notes: form.customer_notes,
            company: form.company,
          },
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        redirectUrl?: string;
        orderNumber?: string;
      } | null;

      if (!response.ok || !result) {
        throw new Error(
          result?.error || "Pesanan belum dapat diproses. Silakan coba lagi.",
        );
      }

      if (!result.redirectUrl) {
        throw new Error(
          result.orderNumber
            ? `Pesanan ${result.orderNumber} tersimpan, tetapi tautan pembayaran belum tersedia. Hubungi admin dengan nomor pesanan tersebut.`
            : "Tautan pembayaran belum tersedia. Silakan coba lagi.",
        );
      }

      const redirect = new URL(result.redirectUrl);

      if (
        redirect.protocol !== "https:" ||
        (redirect.hostname !== "midtrans.com" &&
          !redirect.hostname.endsWith(".midtrans.com"))
      ) {
        throw new Error("Tautan pembayaran tidak valid.");
      }

      window.location.assign(redirect.toString());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan. Periksa koneksi lalu coba lagi.",
      );
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (!mounted) {
    return (
      <div className="container-page py-24 text-center text-sm text-ink-muted">
        Memuat checkout...
      </div>
    );
  }

  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-sage"
      >
        <ArrowLeft size={14} />
        Kembali ke keranjang
      </Link>

      <header className="mt-6 border-b border-line pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Almost yours</p>
            <h1 className="display mt-3 text-4xl sm:text-5xl">
              Checkout<span className="serif-accent">.</span>
            </h1>
          </div>
          <ol className="flex items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-ink-muted">
            <li className="text-sage">01 Keranjang</li>
            <li aria-hidden="true">—</li>
            <li className="font-semibold text-ink">02 Checkout</li>
            <li aria-hidden="true">—</li>
            <li>03 Pembayaran</li>
          </ol>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
          Lengkapi informasi pengiriman. Setelah pesanan diproses, kamu akan
          diarahkan ke halaman pembayaran Midtrans.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mt-10 border border-dashed border-line px-5 py-16 text-center">
          <h2 className="text-xl font-medium">Keranjangmu masih kosong</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
            Tambahkan produk terlebih dahulu sebelum melanjutkan checkout.
          </p>
          <Link href="/products" className="btn btn-primary mt-7">
            Mulai belanja
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-14"
          noValidate={false}
        >
          <div className="space-y-10">
            <section>
              <div className="mb-5 border-b border-line pb-3">
                <h2 className="text-lg font-medium">Informasi pelanggan</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Kami menggunakan data ini untuk mengonfirmasi pesanan.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Nama lengkap *
                  <input
                    className={inputClass}
                    name="customer_name"
                    autoComplete="name"
                    value={form.customer_name}
                    onChange={(event) =>
                      updateField("customer_name", event.target.value)
                    }
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Nama penerima"
                  />
                </label>

                <label className={labelClass}>
                  Email *
                  <input
                    className={inputClass}
                    type="email"
                    name="customer_email"
                    autoComplete="email"
                    value={form.customer_email}
                    onChange={(event) =>
                      updateField("customer_email", event.target.value)
                    }
                    required
                    maxLength={254}
                    placeholder="nama@email.com"
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  Nomor telepon *
                  <input
                    className={inputClass}
                    type="tel"
                    name="customer_phone"
                    autoComplete="tel"
                    value={form.customer_phone}
                    onChange={(event) =>
                      updateField("customer_phone", event.target.value)
                    }
                    required
                    minLength={8}
                    maxLength={20}
                    pattern="[0-9+() .-]{8,20}"
                    placeholder="Contoh: 081234567890"
                  />
                </label>
              </div>
            </section>

            <section>
              <div className="mb-5 border-b border-line pb-3">
                <h2 className="text-lg font-medium">Alamat pengiriman</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Pastikan alamat lengkap agar pesanan mudah dikirim.
                </p>
              </div>

              <div className="space-y-5">
                <label className={labelClass}>
                  Alamat lengkap *
                  <textarea
                    className={`${inputClass} min-h-28 resize-y py-3`}
                    name="shipping_address"
                    autoComplete="street-address"
                    value={form.shipping_address}
                    onChange={(event) =>
                      updateField("shipping_address", event.target.value)
                    }
                    required
                    minLength={8}
                    maxLength={500}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  />
                </label>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    Kota / kabupaten *
                    <input
                      className={inputClass}
                      name="shipping_city"
                      autoComplete="address-level2"
                      value={form.shipping_city}
                      onChange={(event) =>
                        updateField("shipping_city", event.target.value)
                      }
                      required
                      minLength={2}
                      maxLength={100}
                      placeholder="Nama kota"
                    />
                  </label>

                  <label className={labelClass}>
                    Provinsi *
                    <input
                      className={inputClass}
                      name="shipping_province"
                      autoComplete="address-level1"
                      value={form.shipping_province}
                      onChange={(event) =>
                        updateField("shipping_province", event.target.value)
                      }
                      required
                      minLength={2}
                      maxLength={100}
                      placeholder="Nama provinsi"
                    />
                  </label>

                  <label className={labelClass}>
                    Kode pos *
                    <input
                      className={inputClass}
                      name="shipping_postal_code"
                      autoComplete="postal-code"
                      value={form.shipping_postal_code}
                      onChange={(event) =>
                        updateField("shipping_postal_code", event.target.value)
                      }
                      required
                      inputMode="numeric"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      placeholder="12345"
                    />
                  </label>
                </div>

                <label className={labelClass}>
                  Catatan pesanan (opsional)
                  <textarea
                    className={`${inputClass} min-h-24 resize-y py-3`}
                    name="customer_notes"
                    value={form.customer_notes}
                    onChange={(event) =>
                      updateField("customer_notes", event.target.value)
                    }
                    maxLength={500}
                    placeholder="Petunjuk pengiriman atau catatan tambahan"
                  />
                </label>
              </div>
            </section>

            {/* Honeypot: hanya terisi oleh bot. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
              <label>
                Company
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  name="company"
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                />
              </label>
            </div>

            <label className="flex items-start gap-3 text-xs leading-6 text-ink-soft">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                required
                className="mt-1 h-4 w-4 accent-[#5b6650]"
              />
              <span>
                Saya menyetujui{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-sage underline underline-offset-4"
                >
                  syarat & ketentuan
                </Link>{" "}
                serta{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-sage underline underline-offset-4"
                >
                  kebijakan privasi
                </Link>{" "}
                CRAWLFAST.
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="border border-red-900/20 bg-red-50 p-4 text-sm leading-6 text-red-800"
              >
                {error}
              </p>
            )}

            <div className="flex items-start gap-3 border border-line p-4">
              <Lock size={18} className="mt-0.5 shrink-0 text-sage" />
              <p className="text-xs leading-5 text-ink-soft">
                Data dikirim melalui koneksi terenkripsi dan pembayaran diproses
                oleh Midtrans. CRAWLFAST tidak menyimpan nomor kartu atau
                kredensial pembayaran kamu.
              </p>
            </div>
          </div>

          <aside className="border border-line p-5 sm:p-7 lg:sticky lg:top-28">
            <h2 className="text-lg font-medium tracking-tight">
              Ringkasan pesanan
            </h2>

            <div className="mt-5 max-h-80 divide-y divide-line overflow-y-auto border-y border-line pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3 py-4"
                >
                  <div className="relative aspect-[4/5] w-[64px] shrink-0 overflow-hidden bg-sand">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[10px] text-white">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-5">{item.name}</p>
                    <p className="mt-1 text-[10px] text-ink-muted">
                      Ukuran: {item.size}
                    </p>
                    <p className="mt-2 text-xs font-semibold">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3.5 border-b border-line pb-5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">Subtotal ({totalItems})</span>
                <span className="font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">Pengiriman</span>
                <span className="font-medium">
                  {shipping === 0 ? "Gratis" : formatRupiah(shipping)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 py-5">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-semibold tracking-tight">
                {formatRupiah(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Memproses pesanan...
                </>
              ) : (
                "Lanjutkan ke pembayaran"
              )}
            </button>

            <div className="mt-4 space-y-2 text-[10px] leading-5 text-ink-muted">
              <p className="flex items-start gap-2">
                <Truck size={13} className="mt-0.5 shrink-0 text-sage" />
                Gratis ongkir untuk pesanan di atas{" "}
                {formatRupiah(FREE_SHIPPING_THRESHOLD)}.
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-sage" />
                Total akhir dihitung ulang di server sebelum pembayaran.
              </p>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}
