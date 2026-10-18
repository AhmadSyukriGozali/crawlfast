"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Essential Boxy Tee",
    category: "T-Shirts",
    price: "Rp 189.000",
    tag: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e9e5dc]",
  },
  {
    id: 2,
    name: "Utility Overshirt",
    category: "Outerwear",
    price: "Rp 429.000",
    tag: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e6e3dc]",
  },
  {
    id: 3,
    name: "Relaxed Straight Pants",
    category: "Bottoms",
    price: "Rp 349.000",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e8e5df]",
  },
  {
    id: 4,
    name: "Everyday Knit",
    category: "T-Shirts",
    price: "Rp 279.000",
    tag: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e6e3dc]",
  },
];

const categories = ["All Products", "T-Shirts", "Outerwear", "Bottoms"];
const WISHLIST_KEY = "crawlfast-wishlist";
const WISHLIST_UPDATED_EVENT = "crawlfast-wishlist-updated";

const serverWishlistSnapshot: number[] = [];
let lastStoredWishlist: string | null | undefined;
let cachedWishlistSnapshot = serverWishlistSnapshot;

function getWishlistSnapshot() {
  try {
    const savedWishlist = localStorage.getItem(WISHLIST_KEY);

    if (savedWishlist === lastStoredWishlist) {
      return cachedWishlistSnapshot;
    }

    lastStoredWishlist = savedWishlist;
    const parsed: unknown = savedWishlist ? JSON.parse(savedWishlist) : [];

    cachedWishlistSnapshot =
      Array.isArray(parsed) &&
      parsed.every(
        (id) =>
          typeof id === "number" &&
          products.some((product) => product.id === id),
      )
        ? parsed
        : [];
  } catch {
    cachedWishlistSnapshot = [];
  }

  return cachedWishlistSnapshot;
}

function subscribeToWishlist(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(WISHLIST_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WISHLIST_UPDATED_EVENT, onStoreChange);
  };
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wishlist = useSyncExternalStore(
    subscribeToWishlist,
    getWishlistSnapshot,
    () => serverWishlistSnapshot,
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All Products" ||
        product.category === activeCategory;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  function toggleWishlist(productId: number) {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
    } catch (error) {
      console.error("Gagal menyimpan wishlist:", error);
    }
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20211f]">
      <div className="flex min-h-9 items-center justify-center bg-[#20211f] px-4 text-center text-[10px] tracking-[0.16em] text-white sm:text-[11px]">
        EVERYDAY ESSENTIALS, MADE TO LAST.
        <span className="mx-2 text-[#c7cbb9]">·</span>
        DISCOVER THE COLLECTION
      </div>

      <header className="sticky top-0 z-30 border-b border-[#20211f]/10 bg-[#f5f3ee]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 lg:gap-8">
            <button
              type="button"
              aria-label={
                mobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center lg:hidden"
            >
              {mobileMenuOpen ? (
                <X size={21} strokeWidth={1.6} />
              ) : (
                <Menu size={21} strokeWidth={1.6} />
              )}
            </button>

            <Link
              href="/"
              className="text-[21px] font-black tracking-[-0.08em] sm:text-[25px]"
            >
              CRAWLFAST<span className="text-[#59634b]">.</span>
            </Link>

            <nav className="hidden items-center gap-6 text-[11px] font-medium tracking-[0.08em] lg:flex">
              <a
                href="#collection"
                className="transition-colors hover:text-[#59634b]"
              >
                SHOP ALL
              </a>
              <a
                href="#collection"
                onClick={() => {
                  setActiveCategory("All Products");
                  setSearchQuery("");
                }}
                className="transition-colors hover:text-[#59634b]"
              >
                NEW ARRIVALS
              </a>
              <a
                href="#about"
                className="transition-colors hover:text-[#59634b]"
              >
                OUR STORY
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              aria-label={searchOpen ? "Close product search" : "Search products"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="relative transition-colors hover:text-[#59634b]"
            >
              {searchOpen ? (
                <X size={20} strokeWidth={1.6} />
              ) : (
                <Search size={20} strokeWidth={1.6} />
              )}
            </button>

            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} products`}
              className="relative transition-colors hover:text-[#59634b]"
            >
              <Heart
                size={20}
                strokeWidth={1.6}
                fill={wishlist.length > 0 ? "currentColor" : "none"}
              />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#59634b] px-1 text-[9px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden transition-colors hover:text-[#59634b] sm:block"
            >
              <UserRound size={20} strokeWidth={1.6} />
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="transition-colors hover:text-[#59634b]"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-[#20211f]/10 px-5 py-4 sm:px-8 lg:px-12">
            <label
              htmlFor="product-search"
              className="mx-auto flex max-w-[1440px] items-center gap-3"
            >
              <Search size={18} className="shrink-0 text-[#77776f]" />
              <input
                id="product-search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tees, outerwear, bottoms..."
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-[#96958d]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#59634b]"
                >
                  CLEAR
                </button>
              )}
            </label>
          </div>
        )}

        {mobileMenuOpen && (
          <nav className="border-t border-[#20211f]/10 bg-[#f5f3ee] px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-4 text-[11px] font-medium tracking-[0.12em]">
              <a href="#collection" onClick={closeMobileMenu}>
                SHOP ALL
              </a>
              <a
                href="#collection"
                onClick={() => {
                  setActiveCategory("All Products");
                  setSearchQuery("");
                  closeMobileMenu();
                }}
              >
                NEW ARRIVALS
              </a>
              <a href="#about" onClick={closeMobileMenu}>
                OUR STORY
              </a>
              <Link href="/wishlist" onClick={closeMobileMenu}>
                MY WISHLIST ({wishlist.length})
              </Link>
              <Link href="/account" onClick={closeMobileMenu}>
                MY ACCOUNT
              </Link>
            </div>
          </nav>
        )}
      </header>

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 pb-10 pt-9 sm:px-8 sm:pt-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-12 lg:px-12 lg:pb-14 lg:pt-12">
        <div className="flex flex-col items-start">
          <p className="mb-4 text-[10px] font-semibold tracking-[0.24em] text-[#59634b] sm:text-[11px]">
            CRAWLFAST / COLLECTION 001
          </p>
          <h1 className="max-w-xl text-[43px] font-medium leading-[0.99] tracking-[-0.065em] sm:text-6xl lg:text-[76px]">
            Less, but
            <br />
            <span className="font-serif italic">better.</span>
            <br />
            Made for every day.
          </h1>
          <p className="mt-5 max-w-md text-[13px] leading-6 text-[#66665e] sm:text-sm">
            Everyday essentials for every version of you. Thoughtful
            silhouettes, versatile layers, and pieces that feel like you.
          </p>
          <a
            href="#collection"
            className="group mt-7 inline-flex min-h-12 items-center gap-7 bg-[#20211f] px-5 text-[10px] font-semibold tracking-[0.14em] text-white transition-colors hover:bg-[#59634b]"
          >
            EXPLORE COLLECTION
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
          <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.1em] text-[#77776f]">
            <span className="h-px w-8 bg-[#59634b]" />
            DESIGNED FOR YOUR EVERYDAY
          </div>
        </div>

        <a href="#collection" className="group relative block overflow-hidden bg-[#e8e5dc]">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85"
            alt="Editorial fashion collection"
            width={1100}
            height={825}
            sizes="(max-width: 1023px) 100vw, 46vw"
            className="h-[250px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] sm:h-[340px] lg:h-[365px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-7 sm:left-7 sm:right-7">
            <div>
              <p className="text-[9px] tracking-[0.2em]">THE NEW EDIT</p>
              <p className="mt-1 text-xl tracking-tight sm:text-2xl">
                Everyday, redefined.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 transition-colors group-hover:bg-white group-hover:text-[#20211f]">
              <ArrowDownRight size={19} />
            </span>
          </div>
        </a>
      </section>

      <section className="border-y border-[#20211f]/10">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-4 px-5 py-5 sm:px-8 lg:grid-cols-4 lg:px-12">
          {[
            "DESIGNED FOR EVERYDAY",
            "VERSATILE BY NATURE",
            "LESS, BETTER PIECES",
            "YOUR STYLE, YOUR RULES",
          ].map((item) => (
            <p
              key={item}
              className="text-[9px] font-medium tracking-[0.13em] text-[#66665e] sm:text-[10px]"
            >
              <span className="mr-2 text-[#59634b]">✳</span>
              {item}
            </p>
          ))}
        </div>
      </section>

      <section
        id="collection"
        className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12"
      >
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
              CURATED FOR YOU
            </p>
            <h2 className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
              Shop the collection
            </h2>
            <p className="mt-2 text-xs text-[#77776f] sm:text-sm">
              Pieces you will keep reaching for.
            </p>
          </div>
          <span className="hidden pb-1 text-[10px] tracking-[0.1em] text-[#77776f] sm:inline">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "PIECE" : "PIECES"}
          </span>
        </div>

        <div
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filter by category"
        >
          {categories.map((category) => {
            const active = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 border px-4 py-2.5 text-[10px] tracking-[0.04em] transition-colors ${
                  active
                    ? "border-[#20211f] bg-[#20211f] text-white"
                    : "border-[#20211f]/15 text-[#55564f] hover:border-[#20211f]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <article key={product.id} className="group min-w-0">
                  <div className={`relative overflow-hidden ${product.color}`}>
                    <Link
                      href={`/products/${product.id}`}
                      aria-label={`View ${product.name}`}
                      className="block"
                    >
                      <div className="aspect-[4/5] overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={700}
                          height={875}
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                    </Link>

                    {product.tag && (
                      <span className="absolute left-2 top-2 bg-[#f5f3ee] px-2 py-1 text-[8px] font-semibold tracking-[0.08em] sm:left-3 sm:top-3 sm:text-[9px]">
                        {product.tag}
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={
                        isWishlisted
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                      aria-pressed={isWishlisted}
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:right-3 sm:top-3 ${
                        isWishlisted
                          ? "bg-[#59634b] text-white"
                          : "bg-[#f5f3ee]/90 hover:bg-white"
                      }`}
                    >
                      <Heart
                        size={15}
                        strokeWidth={1.6}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      className="absolute inset-x-2 bottom-2 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block"
                    >
                      <span className="flex h-10 items-center justify-center bg-[#f5f3ee]/95 text-[10px] font-semibold tracking-[0.1em]">
                        VIEW PRODUCT
                      </span>
                    </Link>
                  </div>

                  <div className="pt-3">
                    <p className="mb-1 text-[9px] tracking-[0.08em] text-[#77776f] sm:text-[10px]">
                      {product.category}
                    </p>
                    <Link
                      href={`/products/${product.id}`}
                      className="block text-[12px] font-medium leading-5 sm:text-sm"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1.5 text-[11px] font-semibold sm:text-xs">
                      {product.price}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#20211f]/20 px-5 py-14 text-center">
            <p className="text-lg tracking-tight">No pieces found</p>
            <p className="mt-2 text-sm text-[#77776f]">
              Try another search or choose a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All Products");
              }}
              className="mt-5 border border-[#20211f] px-4 py-3 text-[10px] font-semibold tracking-[0.12em] transition-colors hover:bg-[#20211f] hover:text-white"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </section>

      <section id="about" className="bg-[#e8e5dc] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
              THE CRAWLFAST PHILOSOPHY
            </p>
            <h2 className="max-w-xl text-3xl leading-tight tracking-[-0.05em] sm:text-4xl">
              Good style starts with
              <br />
              <span className="font-serif italic">
                knowing what matters.
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-6 text-[#66665e] sm:text-sm">
            Wear what feels right. Build a wardrobe around pieces that work
            together, move with you, and stay relevant beyond the season.
          </p>
        </div>
      </section>

      <footer className="bg-[#20211f] px-5 py-9 text-white sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/"
              className="text-2xl font-black tracking-[-0.08em]"
            >
              CRAWLFAST<span className="text-[#aab19a]">.</span>
            </Link>
            <p className="mt-3 text-[11px] text-white/55">
              Everyday essentials. Uncomplicated style.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] tracking-[0.08em] text-white/75">
            <a href="#collection" className="hover:text-white">
              SHOP
            </a>
            <Link href="/wishlist" className="hover:text-white">
              WISHLIST
            </Link>
            <Link href="/account" className="hover:text-white">
              MY ACCOUNT
            </Link>
            <Link href="/cart" className="hover:text-white">
              CART
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1440px] border-t border-white/15 pt-5 text-[10px] text-white/45">
          © 2026 CRAWLFAST. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </main>
  );
}
