import "server-only";

import { createClient } from "@supabase/supabase-js";

export type AdminAuthResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; status: 401 | 403 | 500; error: string };

function getAdminEmails(): Set<string> {
  const raw = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter(Boolean)
    .join(",");

  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0),
  );
}

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.match(/^Bearer\s+([A-Za-z0-9\-._~+/]+=*)$/i)?.[1];

  if (!accessToken || accessToken.length < 20 || accessToken.length > 4096) {
    return { ok: false, status: 401, error: "Login diperlukan." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmails = getAdminEmails();

  if (!supabaseUrl || !supabaseKey || adminEmails.size === 0) {
    console.error("Admin authorization environment is not configured.");
    return { ok: false, status: 500, error: "Akses admin belum dikonfigurasi." };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user || !data.user.email) {
    return {
      ok: false,
      status: 401,
      error: "Sesi tidak valid. Silakan login kembali.",
    };
  }

  const email = data.user.email.toLowerCase();

  if (!adminEmails.has(email)) {
    return {
      ok: false,
      status: 403,
      error: "Akun ini tidak memiliki akses admin.",
    };
  }

  if (data.user.email_confirmed_at === null) {
    return {
      ok: false,
      status: 403,
      error: "Verifikasi email terlebih dahulu sebelum mengakses panel admin.",
    };
  }

  return { ok: true, user: { id: data.user.id, email: data.user.email } };
}
