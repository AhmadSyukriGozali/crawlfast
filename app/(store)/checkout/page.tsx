"use client";

import {
  useEffect,
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

type AppliedDiscount = {
  code: string;
  amount: number;
  label: string;
  description?: string | null;
  subtotal: number;
};

type CheckoutPaymentMethod = "midtrans" | "whatsapp";

type PaymentMethods = {
  midtransEnabled: boolean;
  whatsappEnabled: boolean;
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

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [checkingDiscount, setCheckingDiscount] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    midtransEnabled: true,
    whatsappEnabled: false,
  });
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("midtrans");
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPaymentMethods() {
      try {
        const response = await fetch("/api/payment-methods", {
          cache: "no-store",
        });
        const result = (await response.json().catch(() => null)) as
          | (PaymentMethods & { error?: string })
          | null;

        if (!response.ok || !result) {
          throw new Error(result?.error || "Metode pembayaran gagal dimuat.");
        }

        if (cancelled) return;

        const methods = {
          midtransEnabled: result.midtransEnabled === true,
          whatsappEnabled: result.whatsappEnabled === true,
        };

        setPaymentMethods(methods);

        if (!methods.midtransEnabled && methods.whatsappEnabled) {
          setPaymentMethod("whatsapp");
        }

        if (!methods.midtransEnabled && !methods.whatsappEnabled) {
          setPaymentMethodsError(
            "Belum ada metode pembayaran yang aktif. Hubungi admin CRAWLFAST.",
          );
        }
      } catch (loadError) {
        if (cancelled) return;

        setPaymentMethodsError(
          loadError instanceof Error
            ? loadError.message
            : "Metode pembayaran gagal dimuat.",
        );
      } finally {
        if (!cancelled) setPaymentMethodsLoading(false);
      }
    }

    void loadPaymentMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPaymentMethod =
    paymentMethods.midtransEnabled || paymentMethods.whatsappEnabled;

  const shipping = useMemo(() => calculateShipping(subtotal), [subtotal]);
  const activeDiscount =
    appliedDiscount?.subtotal === subtotal ? appliedDiscount : null;
  const discountAmount = activeDiscount?.amount ?? 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  async function applyDiscount() {
    const code = discountCode.trim().toUpperCase();

    if (!code) {
      setDiscountError("Masukkan kode promo terlebih dahulu.");
      return;
    }

    setCheckingDiscount(true);
    setDiscountError("");

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });

      const result = (await response.json().catch(() => null)) as
        | (AppliedDiscount & { error?: string })
        | null;

      if (!response.ok || !result || !result.code) {
        throw new Error(result?.error || "Kode promo tidak valid.");
      }

      setAppliedDiscount({
        code: result.code,
        amount: result.amount,
        label: result.label,
        description: result.description,
        subtotal,
      });
      setDiscountCode(result.code);
    } catch (discountFailure) {
      setAppliedDiscount(null);
      setDiscountError(
        discountFailure instanceof Error
          ? discountFailure.message
          : "Kode promo gagal diperiksa.",
      );
    } finally {
      setCheckingDiscount(false);
    }
  }

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

    if (!hasPaymentMethod) {
      setError("Belum ada metode pembayaran yang aktif. Hubungi admin.");
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
          discountCode: activeDiscount?.code ?? "",
          paymentMethod,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        redirectUrl?: string;
        orderNumber?: string;
        paymentMethod?: CheckoutPaymentMethod;
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

      if (result.paymentMethod === "whatsapp") {
        if (
          redirect.protocol !== "https:" ||
          (redirect.hostname !== "wa.me" &&
            redirect.hostname !== "api.whatsapp.com")
        ) {
          throw new Error("Tautan WhatsApp tidak valid.");
        }
      } else if (
        result.paymentMethod === "midtrans" &&
        (redirect.protocol !== "https:" ||
          (redirect.hostname !== "midtrans.com" &&
            !redirect.hostname.endsWith(".midtrans.com")))
      ) {
        throw new Error("Tautan pembayaran tidak valid.");
      } else if (result.paymentMethod !== "midtrans") {
        throw new Error("Metode pembayaran tidak dikenali.");
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
          Lengkapi informasi pengiriman, lalu pilih metode pembayaran. Kamu
          akan diarahkan ke Midtrans atau WhatsApp admin untuk menyelesaikan
          pesanan.
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

            <section>
              <div className="mb-5 border-b border-line pb-3">
                <h2 className="text-lg font-medium">Metode pembayaran</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Pilih cara pembayaran yang paling nyaman. Total akhir tetap
                  dihitung ulang di server.
                </p>
              </div>

              {paymentMethodsLoading ? (
                <div className="flex items-center gap-2 border border-line px-4 py-5 text-sm text-ink-soft">
                  <LoaderCircle size={16} className="animate-spin" />
                  Memuat metode pembayaran...
                </div>
              ) : paymentMethodsError ? (
                <div className="border border-red-900/20 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  <p>{paymentMethodsError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] underline underline-offset-4"
                  >
                    Muat ulang halaman
                  </button>
                </div>
              ) : !hasPaymentMethod ? (
                <div className="border border-line px-4 py-5 text-sm leading-6 text-ink-soft">
                  Belum ada metode pembayaran yang aktif. Hubungi admin
                  CRAWLFAST melalui halaman kontak.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.midtransEnabled && (
                    <label
                      className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                        paymentMethod === "midtrans"
                          ? "border-sage bg-sage/5"
                          : "border-line hover:border-ink-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="midtrans"
                        checked={paymentMethod === "midtrans"}
                        onChange={() => setPaymentMethod("midtrans")}
                        className="mt-1 h-4 w-4 accent-[#5b6650]"
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          Midtrans
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-ink-soft">
                          Kartu, QRIS, virtual account, dan kanal pembayaran
                          lain. Kamu akan diarahkan ke halaman aman Midtrans.
                        </span>
                      </span>
                    </label>
                  )}

                  {paymentMethods.whatsappEnabled && (
                    <label
                      className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                        paymentMethod === "whatsapp"
                          ? "border-sage bg-sage/5"
                          : "border-line hover:border-ink-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={paymentMethod === "whatsapp"}
                        onChange={() => setPaymentMethod("whatsapp")}
                        className="mt-1 h-4 w-4 accent-[#5b6650]"
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          WhatsApp admin
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-ink-soft">
                          Pesanan disimpan, lalu kamu diarahkan ke WhatsApp
                          admin dengan detail pesanan yang sudah terisi.
                          Pembayaran dikonfirmasi manual oleh admin.
                        </span>
                      </span>
                    </label>
                  )}
                </div>
              )}
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
                {paymentMethod === "whatsapp"
                  ? "Pesanan dan ringkasan pembayaran diteruskan ke WhatsApp admin. Konfirmasi pembayaran dilakukan manual. Jangan kirim data kartu atau kredensial pembayaran melalui chat."
                  : "Data dikirim melalui koneksi terenkripsi dan pembayaran diproses oleh Midtrans. CRAWLFAST tidak menyimpan nomor kartu atau kredensial pembayaran kamu."}
              </p>
            </div>
          </div>

          <aside className="border border-line p-5 sm:p-7 lg:sticky lg:top-28">
            <h2 className="text-lg font-medium tracking-tight">
              Ringkasan pesanan
            </h2>

            <div className="mt-4 border border-line p-3">
              <label
                htmlFor="discount-code"
                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft"
              >
                Kode promo
              </label>

              {activeDiscount ? (
                <div className="mt-2 flex items-center justify-between gap-3 bg-sage/10 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-sage">
                      {activeDiscount.code}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-soft">
                      {activeDiscount.label} ·{" "}
                      {formatRupiah(activeDiscount.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedDiscount(null);
                      setDiscountCode("");
                      setDiscountError("");
                    }}
                    className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted underline underline-offset-4 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                    id="discount-code"
                    value={discountCode}
                    onChange={(event) =>
                      setDiscountCode(event.target.value.toUpperCase())
                    }
                    maxLength={32}
                    placeholder="Contoh: WELCOME10"
                    className="field min-h-10 min-w-0 flex-1 py-2 text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => void applyDiscount()}
                    disabled={
                      checkingDiscount ||
                      subtotal <= 0 ||
                      discountCode.trim().length === 0
                    }
                    className="shrink-0 border border-ink px-3 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {checkingDiscount ? "Cek..." : "Terapkan"}
                  </button>
                </div>
              )}

              {discountError && (
                <p role="alert" className="mt-2 text-[10px] leading-4 text-red-700">
                  {discountError}
                </p>
              )}
            </div>

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
              {activeDiscount && (
                <div className="flex items-center justify-between gap-3 text-sage">
                  <span>Diskon ({activeDiscount.code})</span>
                  <span className="font-medium">
                    -{formatRupiah(activeDiscount.amount)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 py-5">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-semibold tracking-tight">
                {formatRupiah(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                items.length === 0 ||
                paymentMethodsLoading ||
                !hasPaymentMethod
              }
              className="btn btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  {paymentMethod === "whatsapp"
                    ? "Menyiapkan WhatsApp..."
                    : "Memproses pesanan..."}
                </>
              ) : paymentMethod === "whatsapp" ? (
                "Lanjutkan via WhatsApp"
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
