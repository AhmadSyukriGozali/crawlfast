import { NextResponse, type NextRequest } from "next/server";
import { PRODUCT_BY_ID, PRODUCT_BY_SLUG } from "@/lib/catalog";

function isKnownProduct(value: string): boolean {
  if (/^\d+$/.test(value)) {
    return PRODUCT_BY_ID.has(Number(value));
  }

  return PRODUCT_BY_SLUG.has(value);
}

export function proxy(request: NextRequest) {
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
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  if (isKnownProduct(slug)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

export const config = {
  matcher: "/products/:slug",
};
