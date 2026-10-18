import "server-only";

import { createClient } from "@supabase/supabase-js";

export type AdminAuthResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; status: 401 | 403; error: string };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!accessToken) {
    return { ok: false, status: 401, error: "Login diperlukan." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!supabaseUrl || !supabaseKey || !adminEmail) {
    console.error("Admin authorization environment is not configured.");
    return { ok: false, status: 403, error: "Akses admin belum dikonfigurasi." };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user || !data.user.email) {
    return { ok: false, status: 401, error: "Sesi tidak valid. Silakan login kembali." };
  }

  if (data.user.email.toLowerCase() !== adminEmail) {
    return { ok: false, status: 403, error: "Akun ini tidak memiliki akses admin." };
  }

  return { ok: true, user: { id: data.user.id, email: data.user.email } };
}
