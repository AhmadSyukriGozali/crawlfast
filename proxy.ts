import { NextResponse, type NextRequest } from "next/server";
import { PRODUCTS } from "@/lib/catalog";

const SAFE_PRODUCT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function notFoundResponse(request: NextRequest) {
  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

/**
 * Cek keberadaan produk aktif langsung ke Supabase sebelum halaman dirender.
 * Ini menjaga status HTTP 404 tetap benar meskipun halaman memakai PPR dan
 * `notFound()` terjadi setelah streaming dimulai.
 *
 * Mengembalikan `null` jika tabel belum dibuat atau Supabase tidak bisa
 * dihubungi, agar fallback katalog statis tetap bekerja.
 */
async function productExists(slug: string): Promise<boolean | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const isId = /^\d+$/.test(slug);
  const filter = isId
    ? `id=eq.${encodeURIComponent(slug)}`
    : `slug=eq.${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id&is_active=eq.true&${filter}&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(2_000),
      },
    );

    if (!response.ok) return null;

    const rows = (await response.json().catch(() => null)) as
      | { id?: unknown }[]
      | null;

    if (!Array.isArray(rows)) return null;

    return rows.length > 0;
  } catch {
    return null;
  }
}

function existsInStaticFallback(slug: string): boolean {
  return PRODUCTS.some(
    (product) => product.slug === slug || String(product.id) === slug,
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);

  if (!match) {
    return NextResponse.next();
  }

  // Jangan intersepsi aset gambar produk di /products/*.jpg.
  if (/\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }

  let slug: string;

  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return notFoundResponse(request);
  }

  if (!/^\d+$/.test(slug) && !SAFE_PRODUCT_SLUG.test(slug)) {
    return notFoundResponse(request);
  }

  const exists = await productExists(slug);

  if (exists === false) {
    return notFoundResponse(request);
  }

  // Tabel products belum tersedia atau Supabase tidak bisa dihubungi:
  // gunakan katalog statis sebagai sumber fallback.
  if (exists === null && !existsInStaticFallback(slug)) {
    return notFoundResponse(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/products/:slug",
};
