"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { PRODUCTS } from "@/lib/catalog";
import { useCart } from "@/lib/hooks/useCart";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { formatRupiah } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { STORE_NAV } from "@/lib/site";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sage px-1 text-[9px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [overlayPath, setOverlayPath] = useState(pathname);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Menu/pencarian otomatis tertutup saat rute berubah tanpa setState di effect.
  const menuVisible = menuOpen && overlayPath === pathname;
  const searchVisible = searchOpen && overlayPath === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlayOpen = menuVisible || searchVisible;

  useEffect(() => {
    if (!overlayOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [overlayOpen]);

  useEffect(() => {
    if (searchVisible) {
      const timeout = window.setTimeout(
        () => searchInputRef.current?.focus(),
        60,
      );
      return () => window.clearTimeout(timeout);
    }
  }, [searchVisible]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    ).slice(0, 5);
  }, [query]);

  return (
    <>
      <div className="bg-ink text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[9px] font-medium tracking-[0.16em] sm:text-[10px]">
          <span className="hidden text-white/60 sm:block">
            GRATIS ONGKIR DI ATAS {formatRupiah(FREE_SHIPPING_THRESHOLD)}
          </span>

          <p className="mx-auto flex items-center gap-2 sm:mx-0">
            <span className="h-1 w-1 rounded-full bg-sage-light animate-soft-pulse" />
            EVERYDAY ESSENTIALS, MADE TO LAST.
          </p>

          <Link
            href="/track"
            className="hidden text-white/60 transition-colors hover:text-white sm:block"
          >
            LACAK PESANAN
          </Link>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b border-line bg-cream/92 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? "shadow-[0_10px_40px_-28px_rgba(29,30,26,0.5)]" : ""
        }`}
      >
        <div className="container-page">
          <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-[76px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={menuVisible ? "Tutup menu" : "Buka menu"}
                aria-expanded={menuVisible}
                aria-controls="mobile-menu"
                onClick={() => {
                  setMenuOpen(!menuVisible);
                  setOverlayPath(pathname);
                  setSearchOpen(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-sage lg:hidden"
              >
                {menuVisible ? <X size={21} /> : <Menu size={21} />}
              </button>

              <Logo />
            </div>

            <nav
              aria-label="Navigasi utama"
              className="hidden items-center gap-8 lg:flex"
            >
              {STORE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/75 transition-colors hover:text-ink"
                >
                  {item.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-sage transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Cari produk"
                aria-expanded={searchVisible}
                aria-controls="search-panel"
                onClick={() => {
                  setSearchOpen(true);
                  setOverlayPath(pathname);
                  setMenuOpen(false);
                  setQuery("");
                }}
                className="inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-sage"
              >
                <Search size={20} strokeWidth={1.7} />
              </button>

              <Link
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} produk`}
                className="relative hidden h-10 w-10 items-center justify-center text-ink transition-colors hover:text-sage sm:inline-flex"
              >
                <Heart
                  size={20}
                  strokeWidth={1.7}
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                />
                <CountBadge count={wishlistCount} />
              </Link>

              <Link
                href="/account"
                aria-label="Akun saya"
                className="relative hidden h-10 w-10 items-center justify-center text-ink transition-colors hover:text-sage sm:inline-flex"
              >
                <UserRound size={20} strokeWidth={1.7} />
              </Link>

              <Link
                href="/cart"
                aria-label={`Keranjang, ${totalItems} produk`}
                className="relative inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-sage"
              >
                <ShoppingBag size={20} strokeWidth={1.7} />
                <CountBadge count={totalItems} />
              </Link>
            </div>
          </div>
        </div>

        {/* Panel pencarian */}
        {searchVisible && (
          <div
            id="search-panel"
            className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-cream/98 backdrop-blur-xl ${
              scrolled
                ? "top-[68px] lg:top-[76px]"
                : "top-[104px] lg:top-[112px]"
            }`}
          >
            <div className="container-page py-8 sm:py-12">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-4 border-b border-ink/20 pb-4">
                  <Search size={22} className="shrink-0 text-sage" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari kaos, outerwear, celana..."
                    aria-label="Cari produk"
                    className="w-full bg-transparent text-xl tracking-tight outline-none placeholder:text-ink-muted sm:text-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Tutup pencarian"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors hover:bg-sand"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-8">
                  {query.trim() === "" ? (
                    <div>
                      <p className="eyebrow">Pencarian populer</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Boxy Tee", "Overshirt", "Trousers", "Knitwear"].map(
                          (term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setQuery(term)}
                              className="border border-line px-4 py-2 text-xs transition-colors hover:border-ink hover:bg-ink hover:text-white"
                            >
                              {term}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ink-soft">
                      Tidak ada produk yang cocok dengan &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    <div>
                      <p className="eyebrow">
                        {results.length} hasil untuk &ldquo;{query}&rdquo;
                      </p>
                      <ul className="mt-4 divide-y divide-line border-y border-line">
                        {results.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="group flex items-center gap-4 py-4"
                            >
                              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-sand">
                                <Image
                                  src={product.image}
                                  alt={product.imageAlt}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                                  {product.category}
                                </p>
                                <p className="mt-1 truncate text-sm font-medium">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-xs font-semibold">
                                  {formatRupiah(product.price)}
                                </p>
                              </div>
                              <ArrowRight
                                size={17}
                                className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={`/products?q=${encodeURIComponent(query.trim())}`}
                        onClick={() => setSearchOpen(false)}
                        className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-sage hover:text-ink"
                      >
                        Lihat semua hasil
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu mobile */}
        {menuVisible && (
          <div
            id="mobile-menu"
            className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-cream lg:hidden ${
              scrolled ? "top-[68px]" : "top-[104px]"
            }`}
          >
            <nav
              aria-label="Navigasi mobile"
              className="container-page flex min-h-full flex-col py-8"
            >
              <div className="flex flex-col">
                {STORE_NAV.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between border-b border-line py-5 text-2xl tracking-tight text-ink"
                  >
                    <span>
                      <span className="mr-3 align-middle text-[10px] font-semibold text-sage">
                        0{index + 1}
                      </span>
                      {item.label}
                    </span>
                    <ArrowRight size={18} className="text-ink-muted" />
                  </Link>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center border border-line"
                >
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  href="/track"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center border border-line"
                >
                  Lacak pesanan
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center border border-line"
                >
                  Akun saya
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center bg-ink text-white"
                >
                  Keranjang ({totalItems})
                </Link>
              </div>

              <p className="mt-auto pt-10 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                CRAWLFAST · {FREE_SHIPPING_THRESHOLD / 1000}K+ GRATIS ONGKIR
              </p>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
