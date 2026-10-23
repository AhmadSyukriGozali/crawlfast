"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Terminal,
  TriangleAlert,
} from "lucide-react";
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
    <main className="admin-shell admin-main">
      <AdminHeader
        email={email}
        loading={loading}
        active="payments"
        onRefresh={() => void loadSettings()}
        onLogout={() => void logout()}
      />

      <div className="admin-container max-w-[1280px] space-y-6">
        <header className="admin-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="admin-eyebrow">Checkout</p>
            <h1 className="admin-title">
              Metode{" "}
              <span className="serif-accent text-[#8a6a3a]">pembayaran.</span>
            </h1>
            <p className="admin-subtitle">
              Aktifkan Midtrans, WhatsApp manual, atau keduanya. Pelanggan
              memilih metode saat checkout.
            </p>
          </div>

          <Link href="/admin" className="admin-btn admin-btn-ghost self-start sm:self-auto">
            Lihat pesanan
            <ArrowUpRight size={13} strokeWidth={1.9} aria-hidden="true" />
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-[#a95f3d]/25 bg-[#fdf4ee] p-4 text-sm text-[#8f4a2c] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Pengaturan bermasalah</p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-[#a06a52]">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="admin-btn admin-btn-danger admin-btn-sm self-start sm:self-auto"
            >
              Coba lagi
            </button>
          </section>
        )}

        {(formError || success) && (
          <section
            role="alert"
            className={`flex items-center gap-2.5 rounded-xl border p-4 text-sm ${
              formError
                ? "border-[#a95f3d]/25 bg-[#fdf4ee] text-[#8f4a2c]"
                : "border-[#7d8a6d]/30 bg-[#eef0e7] text-[#4b5741]"
            }`}
          >
            {formError ? (
              <TriangleAlert size={16} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
            )}
            {formError || success}
          </section>
        )}

        {loading && !settings ? (
          <div className="admin-card space-y-4 p-6" aria-busy="true">
            <div className="h-4 w-40 animate-pulse rounded bg-[#f0ece2]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#f6f2e9]" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="space-y-5">
              <section className="admin-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="admin-step" data-step="01">
                      Channels
                    </span>
                    <h2 className="admin-section-title mt-3">Metode aktif</h2>
                    <p className="mt-1 text-xs leading-5 text-[#6f7064]">
                      Minimal satu metode harus aktif agar checkout bisa
                      dipakai.
                    </p>
                  </div>
                  <span className="admin-icon-tile" data-tone="ink">
                    <CreditCard size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="admin-option flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.midtransEnabled}
                      onChange={(event) =>
                        setField("midtransEnabled", event.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span className="admin-switch" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#2f302a]">
                          Midtrans
                        </span>
                        <span
                          className="admin-chip"
                          data-tone={midtransConfigured ? "success" : "warn"}
                        >
                          {midtransConfigured ? "Terkonfigurasi" : "Belum diisi"}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-[11.5px] leading-5 text-[#6f7064]">
                        Pelanggan diarahkan ke halaman pembayaran Midtrans
                        (kartu, QRIS, virtual account, dan kanal lain sesuai
                        pengaturan Midtrans).
                      </span>
                      {!midtransConfigured && (
                        <span className="mt-2 flex items-center gap-1.5 text-[10.5px] font-medium text-[#8a6a3a]">
                          <TriangleAlert
                            size={12}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                          Server key belum diisi di .env.local
                        </span>
                      )}
                    </span>
                  </label>

                  <label className="admin-option flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.whatsappEnabled}
                      onChange={(event) =>
                        setField("whatsappEnabled", event.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span className="admin-switch" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#2f302a]">
                          WhatsApp manual
                        </span>
                        <span className="admin-chip" data-tone="info">
                          Manual
                        </span>
                      </span>
                      <span className="mt-1.5 block text-[11.5px] leading-5 text-[#6f7064]">
                        Pesanan tetap disimpan, lalu pelanggan diarahkan ke
                        WhatsApp admin dengan pesan yang sudah terisi template.
                      </span>

                      <span className="mt-4 block">
                        <span className="admin-label">
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
                          className="admin-input"
                        />
                        <span className="admin-hint">
                          Nomor akan dinormalisasi ke format internasional
                          (62…).
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="admin-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="admin-step" data-step="02">
                      Message
                    </span>
                    <h2 className="admin-section-title mt-3">
                      Template WhatsApp
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[#6f7064]">
                      Gunakan placeholder di bawah. Placeholder yang tidak
                      dikenal akan dibiarkan apa adanya.
                    </p>
                  </div>
                  <span className="admin-icon-tile" data-tone="sage">
                    <MessageCircle
                      size={16}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {WHATSAPP_TEMPLATE_PLACEHOLDERS.map((placeholder) => (
                    <button
                      key={placeholder}
                      type="button"
                      onClick={() => insertPlaceholder(placeholder)}
                      className="rounded-md border border-[#e4dfd2] bg-[#faf7f0] px-2 py-1.5 font-mono text-[10px] text-[#6b6c61] transition hover:border-[#b08d57]/45 hover:bg-[#f2e8d5] hover:text-[#7d5d2f]"
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
                  className="admin-textarea mt-4 font-mono text-[11px] leading-6"
                />
                <p className="mt-2 text-right font-mono text-[10px] text-[#b0b0a5]">
                  {form.whatsappTemplate.length}/2000 karakter
                </p>
              </section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#76776b]">
                  Perubahan berlaku untuk checkout berikutnya
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary w-full sm:w-auto"
                >
                  <Save size={14} strokeWidth={1.9} aria-hidden="true" />
                  {saving ? "Menyimpan…" : "Simpan pengaturan"}
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="admin-card admin-card--flush admin-card--ink overflow-hidden text-white">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c9a86a]">
                      Pratinjau
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/90">
                      Pesan WhatsApp
                    </p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-[#c9a86a]">
                    <Sparkles
                      size={15}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap break-words px-5 py-4 font-sans text-[11px] leading-6 text-white/70">
                  {preview}
                </pre>

                <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.14em] text-white/30">
                  <Terminal size={11} strokeWidth={1.8} aria-hidden="true" />
                  Live preview · placeholder terisi
                </div>
              </div>

              <div className="admin-card admin-card--soft p-4">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#b08d57]/25 bg-[#f2e8d5] text-[#7d5d2f]">
                    <ShieldCheck
                      size={13}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-[#3c3d34]">
                      Catatan operasional
                    </p>
                    <p className="mt-1 text-[10.5px] leading-5 text-[#6b6c61]">
                      Pesanan WhatsApp berstatus{" "}
                      <strong className="font-semibold text-[#3c3d34]">
                        pending
                      </strong>
                      . Admin perlu memverifikasi pembayaran lalu mengubah
                      status dari halaman detail pesanan.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
