"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminPaymentSettings } from "@/features/payments/hooks/useAdminPaymentSettings";
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  WHATSAPP_TEMPLATE_PLACEHOLDERS,
} from "@/lib/payments/constants";
import type { PaymentSettings } from "@/lib/payments/types";
import { renderWhatsAppTemplate } from "@/lib/payments/whatsapp";

const EMPTY_SETTINGS: PaymentSettings = {
  midtransEnabled: true,
  whatsappEnabled: false,
  whatsappNumber: "",
  whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
  updatedAt: "",
};

const PREVIEW_VALUES = {
  order_number: "CF-1750000000000-abcd1234",
  customer_name: "Nama Pelanggan",
  customer_phone: "081234567890",
  customer_email: "pelanggan@email.com",
  items:
    "- Essential Boxy Tee (L) x1 = Rp189.000\n- Hoodie Bit Red (M) x2 = Rp698.000",
  subtotal: "Rp887.000",
  shipping: "Rp0",
  discount: "-Rp50.000",
  total: "Rp837.000",
  shipping_address:
    "Jl. Contoh No. 10, Jakarta Selatan, DKI Jakarta 12345",
  notes: "Tolong dikirim setelah jam 15.00.",
};

export default function PaymentSettingsForm() {
  const state = useAdminPaymentSettings();

  return (
    <PaymentSettingsView
      key={
        state.settings?.updatedAt ||
        (state.loading ? "loading" : "empty")
      }
      {...state}
    />
  );
}

function PaymentSettingsView({
  email,
  settings,
  midtransConfigured,
  loading,
  error,
  logout,
  loadSettings,
  saveSettings,
}: ReturnType<typeof useAdminPaymentSettings>) {
  const [form, setForm] = useState<PaymentSettings>(
    settings ?? EMPTY_SETTINGS,
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const templateRef = useRef<HTMLTextAreaElement>(null);

  function setField<K extends keyof PaymentSettings>(
    key: K,
    value: PaymentSettings[K],
  ) {
    setSuccess("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  function insertPlaceholder(placeholder: string) {
    const textarea = templateRef.current;
    const current = form.whatsappTemplate;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${placeholder}${current.slice(end)}`;

    setField("whatsappTemplate", next);

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(
        start + placeholder.length,
        start + placeholder.length,
      );
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    if (!form.midtransEnabled && !form.whatsappEnabled) {
      setFormError("Aktifkan minimal satu metode pembayaran.");
      return;
    }

    setSaving(true);

    try {
      const saved = await saveSettings(form);

      if (saved) {
        setSuccess("Pengaturan pembayaran berhasil disimpan.");
      }
    } finally {
      setSaving(false);
    }
  }

  const preview = renderWhatsAppTemplate(
    form.whatsappTemplate,
    PREVIEW_VALUES,
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader
        email={email}
        loading={loading}
        active="payments"
        onRefresh={() => void loadSettings()}
        onLogout={() => void logout()}
      />

      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-7 sm:px-6 sm:py-9">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              CHECKOUT
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Metode Pembayaran
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Aktifkan Midtrans, WhatsApp manual, atau keduanya. Pelanggan
              memilih metode saat checkout.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Lihat pesanan
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-bold">Pengaturan bermasalah</p>
            <p className="mt-1 whitespace-pre-line">{error}</p>
          </section>
        )}

        {(formError || success) && (
          <section
            role="alert"
            className={`rounded-2xl border p-4 text-sm ${
              formError
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {formError || success}
          </section>
        )}

        {loading && !settings ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Memuat pengaturan pembayaran...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold">Metode aktif</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Minimal satu metode harus aktif agar checkout bisa dipakai.
                </p>

                <div className="mt-5 space-y-4">
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={form.midtransEnabled}
                      onChange={(event) =>
                        setField("midtransEnabled", event.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-emerald-700"
                    />
                    <span>
                      <span className="block text-sm font-bold">
                        Midtrans
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Pelanggan diarahkan ke halaman pembayaran Midtrans
                        (kartu, QRIS, virtual account, dan kanal lain sesuai
                        pengaturan Midtrans).
                      </span>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          midtransConfigured
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {midtransConfigured
                          ? "Server key terkonfigurasi"
                          : "Server key belum diisi di .env.local"}
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={form.whatsappEnabled}
                      onChange={(event) =>
                        setField("whatsappEnabled", event.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-emerald-700"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        WhatsApp manual
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Pesanan tetap disimpan, lalu pelanggan diarahkan ke
                        WhatsApp admin dengan pesan yang sudah terisi template.
                      </span>

                      <span className="mt-4 block text-xs font-semibold text-slate-700">
                        Nomor WhatsApp admin
                      </span>
                      <input
                        value={form.whatsappNumber}
                        onChange={(event) =>
                          setField("whatsappNumber", event.target.value)
                        }
                        inputMode="tel"
                        maxLength={20}
                        placeholder="Contoh: 081234567890 atau 6281234567890"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <span className="mt-1.5 block text-[11px] text-slate-500">
                        Nomor akan dinormalisasi ke format internasional
                        (62...).
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold">Template WhatsApp</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Gunakan placeholder di bawah. Placeholder yang tidak dikenal
                  akan dibiarkan apa adanya.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {WHATSAPP_TEMPLATE_PLACEHOLDERS.map((placeholder) => (
                    <button
                      key={placeholder}
                      type="button"
                      onClick={() => insertPlaceholder(placeholder)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      {placeholder}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={templateRef}
                  value={form.whatsappTemplate}
                  onChange={(event) =>
                    setField("whatsappTemplate", event.target.value)
                  }
                  rows={14}
                  maxLength={2000}
                  className="mt-4 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="mt-2 text-right text-[11px] text-slate-400">
                  {form.whatsappTemplate.length}/2000 karakter
                </p>
              </section>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan pengaturan"}
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pratinjau pesan WhatsApp
                </p>
                <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-sans text-xs leading-6 text-white/85">
                  {preview}
                </pre>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                <p className="font-bold">Catatan</p>
                <p className="mt-1">
                  Pesanan WhatsApp berstatus <strong>pending</strong>. Admin
                  perlu memverifikasi pembayaran lalu mengubah status dari
                  halaman detail pesanan.
                </p>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
