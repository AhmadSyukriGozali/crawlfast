"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = createBrowserSupabaseClient();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
          : await supabase.auth.signUp({ email: email.trim(), password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        setMessage("Pendaftaran berhasil. Periksa email untuk verifikasi sebelum login.");
        return;
      }

      window.location.assign("/admin");
    } catch {
      setMessage("Autentikasi belum siap. Periksa konfigurasi Supabase di Vercel.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-12 text-[#20211f]">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-xl font-bold tracking-[0.2em]">CRAWLFAST</Link>
        <section className="mt-10 border border-[#20211f]/10 bg-white/70 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#59634b]">ACCOUNT ACCESS</p>
          <h1 className="mt-3 text-3xl font-semibold">{mode === "login" ? "Masuk" : "Buat akun"}</h1>
          <p className="mt-3 text-sm leading-6 text-[#20211f]/65">
            Gunakan akun Supabase Auth. Hak admin ditentukan di server dan tidak dapat dipilih dari formulir ini.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-[#20211f]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#59634b]" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
              <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[#20211f]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#59634b]" />
              <p className="mt-2 text-xs text-[#20211f]/50">Minimal 8 karakter.</p>
            </div>
            {message && <p role="status" className="text-sm leading-5 text-[#59634b]">{message}</p>}
            <button disabled={busy} className="w-full bg-[#20211f] px-5 py-4 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-[#59634b] disabled:opacity-60">
              {busy ? "MEMPROSES..." : mode === "login" ? "MASUK" : "DAFTAR"}
            </button>
          </form>
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}
            className="mt-5 text-sm underline underline-offset-4">
            {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </section>
        <p className="mt-5 text-xs leading-5 text-[#20211f]/50">
          Mendaftar tidak otomatis memberi akses admin. Admin pertama harus cocok dengan email yang dikonfigurasi di server.
        </p>
      </div>
    </main>
  );
}
