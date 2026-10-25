"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Menukar code recovery menjadi session. Hanya berhasil jika halaman dibuka
 * dari tautan email; sesi login biasa tidak dianggap sebagai bukti recovery.
 */
async function prepareRecoverySession(): Promise<boolean> {
  // Baca code sebelum client dibuat. `detectSessionInUrl` otomatis menukar
  // dan menghapus ?code saat client diinisialisasi.
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const flowId = params.get("sb_flow_id");

  if (!code) return false;

  // Bersihkan URL lebih dulu agar code tidak ditukar dua kali.
  params.delete("code");
  params.delete("sb_flow_id");
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
  );

  try {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (error) return false;

    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  } catch {
    return false;
  }
}

export default function ResetPasswordForm() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const recoveryAttempt = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Simpan promise di ref agar React Strict Mode tidak menukar code dua kali.
    let attempt = recoveryAttempt.current;
    if (!attempt) {
      attempt = prepareRecoverySession();
      recoveryAttempt.current = attempt;
    }

    void attempt.then((ok) => {
      if (cancelled) return;
      if (ok) setReady(true);
      else setInvalid(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password minimal 8 karakter.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setMessage("Gunakan kombinasi huruf dan angka.");
      return;
    }

    if (password !== confirm) {
      setMessage("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      await supabase.auth.signOut({ scope: "global" });
      router.replace("/login?reset=success");
    } catch {
      setMessage("Password belum dapat diperbarui. Minta tautan baru lalu coba lagi.");
      setLoading(false);
    }
  }

  if (!ready && !invalid) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <LoaderCircle size={16} className="animate-spin" />
        Memverifikasi tautan reset...
      </div>
    );
  }

  if (invalid) {
    return (
      <div>
        <p className="border border-red-900/20 bg-red-50 p-4 text-sm leading-6 text-red-800">
          Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru dari
          halaman login.
        </p>
        <Link href="/login" className="btn btn-secondary mt-5">
          <ArrowLeft size={14} />
          Kembali ke login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="new-password" className="field-label">
          Password baru
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimal 8 karakter, kombinasi huruf & angka"
          className="field"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="field-label">
          Ulangi password baru
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Ulangi password"
          className="field"
        />
      </div>

      {message && (
        <p role="alert" className="border border-red-900/20 bg-red-50 p-3 text-xs leading-5 text-red-800">
          {message}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <LockKeyhole size={15} />
            Simpan password baru
          </>
        )}
      </button>

      <p className="flex items-start gap-2 text-[10px] leading-5 text-ink-muted">
        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-sage" />
        Setelah password diperbarui, kamu akan keluar dari semua sesi dan perlu
        login kembali.
      </p>
    </form>
  );
}
