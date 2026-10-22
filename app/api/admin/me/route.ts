import { requireAdmin } from "@/lib/supabase/require-admin";
import { noStoreJson } from "@/lib/security/request";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  // Batasi percobaan sebelum verifikasi token agar token palsu tidak
  // memicu request tak terbatas ke Supabase Auth.
  const ipLimit = await rateLimit(
    `admin:auth:${getClientIp(request)}`,
    120,
    60_000,
  );

  if (!ipLimit.allowed) {
    return noStoreJson(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      },
    );
  }

  const result = await requireAdmin(request);

  if (!result.ok) {
    return noStoreJson({ error: result.error }, { status: result.status });
  }

  return noStoreJson({
    authenticated: true,
    role: "admin",
    email: result.user.email,
  });
}
