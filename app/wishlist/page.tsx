"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";

const WISHLIST_KEY = "crawlfast-wishlist";

const products = [
  {
    id: 1,
    name: "Essential Boxy Tee",
    category: "T-Shirts",
    price: "Rp 189.000",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "Utility Overshirt",
    category: "Outerwear",
    price: "Rp 429.000",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "Relaxed Straight Pants",
    category: "Bottoms",
    price: "Rp 349.000",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 4,
    name: "Everyday Knit",
    category: "T-Shirts",
    price: "Rp 279.000",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=85",
  },
];

const WISHLIST_UPDATED_EVENT = "crawlfast-wishlist-updated";

type WishlistSnapshot = {
  wishlist: number[];
  loaded: boolean;
};

const serverWishlistSnapshot: WishlistSnapshot = {
  wishlist: [],
  loaded: false,
};

let lastStoredWishlist: string | null | undefined;
let cachedWishlistSnapshot = serverWishlistSnapshot;

function getWishlistSnapshot(): WishlistSnapshot {
  try {
    const savedWishlist = localStorage.getItem(WISHLIST_KEY);

    if (savedWishlist === lastStoredWishlist) {
      return cachedWishlistSnapshot;
    }

    lastStoredWishlist = savedWishlist;
    const parsed: unknown = savedWishlist ? JSON.parse(savedWishlist) : [];
    const wishlist = Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (id): id is number =>
                typeof id === "number" &&
                products.some((product) => product.id === id),
            ),
          ),
        ]
      : [];

    cachedWishlistSnapshot = { wishlist, loaded: true };
  } catch {
    cachedWishlistSnapshot = { wishlist: [], loaded: true };
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

export default function WishlistPage() {
  const { wishlist, loaded } = useSyncExternalStore(
    subscribeToWishlist,
    getWishlistSnapshot,
    () => serverWishlistSnapshot,
  );

  function removeFromWishlist(productId: number) {
    const updated = wishlist.filter((id) => id !== productId);

    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
    } catch (error) {
      console.error("Gagal memperbarui wishlist:", error);
    }
  }

  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20211f]">
      <header className="border-b border-[#20211f]/10">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="text-[21px] font-black tracking-[-0.08em] sm:text-[25px]"
          >
            CRAWLFAST<span className="text-[#59634b]">.</span>
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/account"
              className="text-xs transition-colors hover:text-[#59634b]"
            >
              ACCOUNT
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
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-[#66665e] transition-colors hover:text-[#59634b]"
        >
          <ArrowLeft size={15} />
          CONTINUE SHOPPING
        </Link>

        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[0.24em] text-[#59634b]">
              YOUR PERSONAL EDIT
            </p>
            <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
              Wishlist<span className="font-serif italic">.</span>
            </h1>
            <p className="mt-3 text-sm text-[#77776f]">
              Simpan pieces yang kamu suka, untuk nanti.
            </p>
          </div>

          {loaded && (
            <span className="pb-1 text-[10px] tracking-[0.1em] text-[#77776f]">
              {savedProducts.length}{" "}
              {savedProducts.length === 1 ? "ITEM" : "ITEMS"}
            </span>
          )}
        </div>

        {!loaded ? (
          <div className="py-20 text-center text-sm text-[#77776f]">
            Memuat wishlist...
          </div>
        ) : savedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <article key={product.id} className="group min-w-0">
                <div className="relative overflow-hidden bg-[#e8e5dc]">
                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`Lihat ${product.name}`}
                    className="block"
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={700}
                        height={875}
                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={`Hapus ${product.name} dari wishlist`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f3ee]/95 transition-colors hover:bg-[#59634b] hover:text-white"
                  >
                    <Trash2 size={16} strokeWidth={1.6} />
                  </button>
                </div>

                <div className="pt-3">
                  <p className="mb-1 text-[10px] tracking-[0.08em] text-[#77776f]">
                    {product.category}
                  </p>
                  <Link
                    href={`/products/${product.id}`}
                    className="block text-sm font-medium leading-5 hover:text-[#59634b]"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-2 text-xs font-semibold">{product.price}</p>

                  <Link
                    href={`/products/${product.id}`}
                    className="mt-4 flex min-h-11 items-center justify-center gap-2 bg-[#20211f] px-3 text-[10px] font-semibold tracking-[0.1em] text-white transition-colors hover:bg-[#59634b]"
                  >
                    VIEW PRODUCT
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#20211f]/20 px-5 py-16 text-center sm:py-24">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#59634b]/10 text-[#59634b]">
              <Heart size={25} strokeWidth={1.5} />
            </div>

            <h2 className="mt-5 text-2xl font-medium tracking-tight">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#77776f]">
              Temukan pieces favoritmu dan tekan ikon hati pada produk untuk
              menyimpannya di sini.
            </p>

            <Link
              href="/#collection"
              className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[#20211f] px-6 text-[10px] font-semibold tracking-[0.14em] text-white transition-colors hover:bg-[#59634b]"
            >
              EXPLORE COLLECTION
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>

      <footer className="border-t border-[#20211f]/10 px-5 py-7 text-center text-[10px] tracking-[0.1em] text-[#77776f]">
        © 2026 CRAWLFAST. ALL RIGHTS RESERVED.
      </footer>
    </main>
  );
}
