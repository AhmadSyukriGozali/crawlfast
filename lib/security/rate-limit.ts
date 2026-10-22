import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

/**
 * Fallback in-memory. Hanya akurat pada satu instance proses (mis. `next dev`
 * atau deployment single-instance). Di Vercel/serverless, setiap instance punya
 * memori sendiri sehingga `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
 * wajib diisi agar limit berlaku global.
 */
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

let redisClient: Redis | null | undefined;
const limiters = new Map<string, Ratelimit>();

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  // Vercel Marketplace (Upstash) memakai prefixed env; integrasi Vercel KV
  // lama memakai KV_REST_API_*. Keduanya didukung agar tidak perlu rename.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  try {
    redisClient = new Redis({ url, token });
  } catch (error) {
    console.error(
      "Upstash Redis init failed; using in-memory rate limit.",
      error instanceof Error ? error.message : "Unknown error",
    );
    redisClient = null;
  }

  return redisClient;
}

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  const cacheKey = `${limit}:${windowMs}`;
  const existing = limiters.get(cacheKey);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    prefix: "crawlfast:ratelimit",
    // Fail-open bila Redis lambat, agar checkout tidak ikut macet.
    timeout: 2_000,
    analytics: false,
    ephemeralCache: new Map<string, number>(),
  });

  limiters.set(cacheKey, limiter);
  return limiter;
}

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  // Jika masih penuh, buang entri paling lama agar memori tetap terkendali.
  if (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Rate limiter terdistribusi (Upstash Redis, sliding window) dengan fallback
 * in-memory. Dipakai untuk checkout, tracking, dan endpoint admin.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, windowMs);

  if (limiter) {
    try {
      const result = await limiter.limit(key);

      if (result.success) {
        return {
          allowed: true,
          remaining: Math.max(0, result.remaining),
          retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((result.reset - Date.now()) / 1000),
        ),
      };
    } catch (error) {
      console.error(
        "Upstash rate limit failed; using in-memory fallback.",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  return memoryRateLimit(key, limit, windowMs);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().slice(0, 64) || "unknown";
  }

  return (
    request.headers.get("x-real-ip")?.trim().slice(0, 64) ||
    request.headers.get("cf-connecting-ip")?.trim().slice(0, 64) ||
    "unknown"
  );
}
