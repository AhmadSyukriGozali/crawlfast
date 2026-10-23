"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email belum diverifikasi. Periksa inbox kamu.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  }

  if (normalized.includes("password should be")) {
    return "Password tidak memenuhi persyaratan keamanan.";
  }

  if (normalized.includes("fetch") || normalized.includes("network")) {
    return "Koneksi ke server gagal. Periksa jaringan lalu coba lagi.";
  }

  return "Login gagal. Periksa kembali data kamu atau hubungi administrator.";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(
    resetSuccess ? "Password berhasil diperbarui. Silakan login kembali." : "",
  );
  const [messageType, setMessageType] = useState<"error" | "success">(
    resetSuccess ? "success" : "error",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessageType("error");
      setMessage("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessageType("error");
      setMessage(
        translateAuthError(
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setMessage("");

    if (!email.trim()) {
      setMessageType("error");
      setMessage("Isi email terlebih dahulu untuk menerima tautan reset.");
      return;
    }

    setResetting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/login/reset`,
        },
      );

      if (error) throw error;

      setMessageType("success");
      setMessage(
        "Jika email terdaftar, tautan reset password sudah dikirim. Periksa inbox dan folder spam.",
      );
    } catch {
      setMessageType("error");
      setMessage("Tautan reset belum dapat dikirim. Coba lagi nanti.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div>
        <label htmlFor="email" className="admin-label">
          Email admin
        </label>
        <div className="relative">
          <Mail
            size={15}
            strokeWidth={1.7}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#96968a]"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@crawlfast.store"
            className="admin-input admin-input--icon-left"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="admin-label">
            Password
          </label>
          <button
            type="button"
            onClick={() => void handleForgotPassword()}
            disabled={resetting}
            className="-mt-1 text-[10px] font-semibold text-[#8a6a3a] underline decoration-[#b08d57]/35 underline-offset-4 transition hover:text-[#171814] disabled:opacity-50"
          >
            {resetting ? "Mengirim..." : "Lupa password?"}
          </button>
        </div>

        <div className="relative">
          <LockKeyhole
            size={15}
            strokeWidth={1.7}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#96968a]"
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            minLength={8}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="admin-input admin-input--icon-left admin-input--icon-right"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#76776b] transition hover:bg-[#f2e8d5] hover:text-[#171814]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {message && (
        <div
          role={messageType === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11px] leading-5 ${
            messageType === "error"
              ? "border-[#a95f3d]/25 bg-[#fdf4ee] text-[#8f4a2c]"
              : "border-[#5b6650]/25 bg-[#eef0e7] text-[#4b5741]"
          }`}
        >
          {messageType === "error" ? (
            <AlertCircle
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
          ) : (
            <CheckCircle2
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
          )}
          <span>{message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || resetting}
        className="admin-btn admin-btn-primary admin-btn-lg w-full"
      >
        {loading ? (
          <>
            <LoaderCircle
              size={15}
              className="animate-spin"
              aria-hidden="true"
            />
            Memverifikasi...
          </>
        ) : (
          <>
            <LockKeyhole size={14} strokeWidth={1.9} aria-hidden="true" />
            Masuk ke panel admin
          </>
        )}
      </button>
    </form>
  );
}
