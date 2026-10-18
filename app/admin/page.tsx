"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AdminState =
  | { status: "loading" }
  | { status: "allowed"; email: string }
  | { status: "denied"; message: string };

export default function AdminPage() {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          if (active) setState({ status: "denied", message: "Silakan login terlebih dahulu." });
          return;
        }

        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          cache: "no-store",
        });
        const body = await response.json();

        if (!response.ok) {
          if (active) setState({ status: "denied", message: body.error ?? "Akses ditolak." });
          return;
        }

        if (active) setState({ status: "allowed", email: body.email });
      } catch {
        if (active) setState({ status: "denied", message: "Tidak dapat memverifikasi akses admin." });
      }
    }

    void verifyAccess();
    return () => { active = false; };
  }, []);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-10 text-[#20211f] sm:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[#20211f]/10 pb-5">
        <Link href="/" className="text-xl font-bold tracking-[0.2em]">CRAWLFAST</Link>
        {state.status === "allowed" && <button onClick={signOut} className="text-sm underline underline-offset-4">Keluar</button>}
      </header>
      <section className="mx-auto max-w-6xl py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#59634b]">ADMINISTRATION</p>
        {state.status === "loading" ? (
          <p className="mt-4 text-sm">Memverifikasi akses...</p>
        ) : state.status === "denied" ? (
          <div className="mt-6 max-w-xl border border-[#20211f]/10 bg-white/70 p-6">
            <h1 className="text-2xl font-semibold">Akses belum tersedia</h1>
            <p className="mt-3 text-sm leading-6 text-[#20211f]/70">{state.message}</p>
            <Link href="/login" className="mt-5 inline-block bg-[#20211f] px-5 py-3 text-xs font-semibold tracking-[0.15em] text-white">KE HALAMAN LOGIN</Link>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Dashboard Admin</h1>
            <p className="mt-3 text-sm text-[#20211f]/65">Login sebagai {state.email}</p>
            <div className="mt-8 border border-[#20211f]/10 bg-white/70 p-6">
              <h2 className="text-lg font-semibold">Fondasi akses admin aktif</h2>
              <p className="mt-2 text-sm leading-6 text-[#20211f]/65">
                Verifikasi akun sudah tersedia. Modul pengelolaan pesanan dan katalog akan ditambahkan setelah skema database dan kebijakan akses diverifikasi.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
