"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="space-y-2">
        <label htmlFor="email" className="field-label">
          Email admin
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@crawlfast.store"
          className="field"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <button
            type="button"
            onClick={() => void handleForgotPassword()}
            disabled={resetting}
            className="text-[10px] text-sage underline underline-offset-4 hover:text-ink disabled:opacity-50"
          >
            {resetting ? "Mengirim..." : "Lupa password?"}
          </button>
        </div>

        <div className="relative">
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
            className="field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {message && (
        <p
          role={messageType === "error" ? "alert" : "status"}
          className={`p-3 text-xs leading-5 ${
            messageType === "error"
              ? "border border-red-900/20 bg-red-50 text-red-800"
              : "border border-sage/30 bg-sage/10 text-sage"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || resetting}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            Memverifikasi...
          </>
        ) : (
          <>
            <LockKeyhole size={15} />
            Masuk ke panel admin
          </>
        )}
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink">
          <ArrowLeft size={12} />
          Kembali ke toko
        </Link>
        <Link href="/privacy" className="hover:text-ink">
          Privasi
        </Link>
      </div>
    </form>
  );
}
