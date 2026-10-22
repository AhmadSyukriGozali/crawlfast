import "server-only";

import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { noStoreJson } from "@/lib/security/request";
import { requireAdmin } from "@/lib/supabase/require-admin";

type GuardResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; response: Response };

/**
 * Guard standar untuk API admin baru: rate limit IP sebelum verifikasi token,
 * lalu rate limit tambahan per akun admin.
 */
export async function guardAdminApi(
  request: Request,
  scope: string,
  maxRequests = 60,
): Promise<GuardResult> {
  const ipLimit = await rateLimit(
    `admin:auth:${getClientIp(request)}`,
    120,
    60_000,
  );

  if (!ipLimit.allowed) {
    return {
      ok: false,
      response: noStoreJson(
        { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        },
      ),
    };
  }

  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return {
      ok: false,
      response: noStoreJson({ error: auth.error }, { status: auth.status }),
    };
  }

  const limit = await rateLimit(
    `admin:${scope}:${auth.user.id}`,
    maxRequests,
    60_000,
  );

  if (!limit.allowed) {
    return {
      ok: false,
      response: noStoreJson(
        { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      ),
    };
  }

  return { ok: true, user: auth.user };
}
