
"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

type CartItem = {
  productId: number;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};

const CART_KEY = "crawlfast-cart";
const CART_UPDATED_EVENT = "crawlfast-cart-updated";
const SHIPPING_COST = 15000;

type CartSnapshot = {
  cart: CartItem[];
  isLoaded: boolean;
  notice: string;
};

const serverCartSnapshot: CartSnapshot = {
  cart: [],
  isLoaded: false,
  notice: "",
};

let lastStoredCart: string | null | undefined;
let cachedCartSnapshot = serverCartSnapshot;

function getCartSnapshot(): CartSnapshot {
  try {
    const stored = localStorage.getItem(CART_KEY);

    if (stored === lastStoredCart) {
      return cachedCartSnapshot;
    }

    lastStoredCart = stored;
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    const cart = Array.isArray(parsed)
      ? parsed.filter(
          (item): item is CartItem =>
            item !== null &&
            typeof item === "object" &&
            typeof item.productId === "number" &&
            typeof item.name === "string" &&
            typeof item.price === "string" &&
            typeof item.image === "string" &&
            typeof item.size === "string" &&
            typeof item.quantity === "number" &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0,
        )
      : [];

    cachedCartSnapshot = { cart, isLoaded: true, notice: "" };
  } catch {
    cachedCartSnapshot = {
      cart: [],
      isLoaded: true,
      notice: "Data keranjang tidak dapat dibaca. Coba muat ulang halaman.",
    };
  }

  return cachedCartSnapshot;
}

function subscribeToCart(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_UPDATED_EVENT, onStoreChange);
  };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parsePrice(price: string) {
  const digits = price.replace(/\D/g, "");
  return Number(digits) || 0;
}

export default function CartPage() {
  const { cart, isLoaded, notice: storageNotice } = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    () => serverCartSnapshot,
  );

  const [saveNotice, setSaveNotice] = useState("");
  const notice = storageNotice || saveNotice;

  
  function saveCart(updatedCart: CartItem[]) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
      setSaveNotice("");
    } catch {
      setSaveNotice(
        "Perubahan belum tersimpan. Periksa penyimpanan browser kamu.",
      );
    }
  }


  function updateQuantity(index: number, change: number) {
    const updatedCart = cart
      .map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: item.quantity + change }
          : item,
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  }

  function removeItem(index: number) {
    saveCart(cart.filter((_, itemIndex) => itemIndex !== index));
  }

  function clearCart() {
    saveCart([]);
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );

  const estimatedTotal = subtotal + SHIPPING_COST;

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] text-sm text-[#77776f]">
        Memuat keranjang...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20211f]">
      <div className="flex min-h-9 items-center justify-center bg-[#20211f] px-4 text-center text-[10px] tracking-[0.16em] text-white sm:text-[11px]">
        EVERYDAY ESSENTIALS, MADE TO LAST.
      </div>

      <header className="sticky top-0 z-30 border-b border-[#20211f]/10 bg-[#f5f3ee]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-[21px] font-black tracking-[-0.08em] sm:text-[25px]"
          >
            CRAWLFAST<span className="text-[#59634b]">.</span>
          </Link>

          <Link
            href="/#collection"
            className="text-[10px] font-medium tracking-[0.1em] transition-colors hover:text-[#59634b]"
          >
            LANJUT BELANJA
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12">
        <Link
          href="/#collection"
          className="inline-flex items-center gap-2 text-xs text-[#66665e] transition-colors hover:text-[#59634b]"
        >
          <ArrowLeft size={16} />
          Kembali belanja
        </Link>

        <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#20211f]/15 pb-6">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
              YOUR SELECTION
            </p>
            <h1 className="text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
              Keranjang belanja
            </h1>
          </div>

          <p className="text-xs text-[#77776f]">
            {totalItems} produk
          </p>
        </div>

        {notice && (
          <p
            role="alert"
            className="mb-6 border border-red-900/20 bg-red-50 p-4 text-sm text-red-800"
          >
            {notice}
          </p>
        )}

        {cart.length === 0 ? (
          <div className="flex flex-col items-center border border-dashed border-[#20211f]/20 px-5 py-16 text-center sm:py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8e5dc]">
              <ShoppingBag size={25} strokeWidth={1.4} />
            </div>

            <h2 className="mt-6 text-xl font-medium tracking-tight">
              Keranjangmu masih kosong
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#77776f]">
              Temukan pakaian esensial favoritmu dan tambahkan ke keranjang
              untuk mulai berbelanja.
            </p>

            <Link
              href="/#collection"
              className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#20211f] px-6 text-[10px] font-semibold tracking-[0.13em] text-white transition-colors hover:bg-[#59634b]"
            >
              MULAI BELANJA
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_350px] lg:gap-14">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.14em]">
                  PRODUK KAMU ({totalItems})
                </p>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[10px] text-[#77776f] underline underline-offset-4 transition-colors hover:text-red-700"
                >
                  Kosongkan keranjang
                </button>
              </div>

              <div className="divide-y divide-[#20211f]/15 border-y border-[#20211f]/15">
                {cart.map((item, index) => (
                  <article
                    key={`${item.productId}-${item.size}-${index}`}
                    className="flex gap-4 py-5 sm:gap-6"
                  >
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative aspect-[4/5] w-[112px] shrink-0 overflow-hidden bg-[#e8e5dc] sm:w-[145px]"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="145px"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm font-medium leading-5 hover:text-[#59634b] sm:text-base"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-2 text-xs text-[#77776f]">
                            Ukuran: {item.size}
                          </p>

                          <p className="mt-2 text-xs font-semibold">
                            {item.price}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          aria-label={`Hapus ${item.name} ukuran ${item.size}`}
                          className="shrink-0 p-1 text-[#77776f] transition-colors hover:text-red-700"
                        >
                          <Trash2 size={17} strokeWidth={1.6} />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <div className="inline-flex h-9 items-center border border-[#20211f]/20">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, -1)}
                            aria-label={`Kurangi jumlah ${item.name}`}
                            className="flex h-full w-9 items-center justify-center transition-colors hover:bg-[#e8e5dc]"
                          >
                            <Minus size={13} />
                          </button>

                          <span
                            aria-label="Jumlah produk"
                            className="min-w-7 text-center text-xs tabular-nums"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(index, 1)}
                            aria-label={`Tambah jumlah ${item.name}`}
                            className="flex h-full w-9 items-center justify-center transition-colors hover:bg-[#e8e5dc]"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <p className="text-right text-xs font-semibold sm:text-sm">
                          {formatRupiah(
                            parsePrice(item.price) * item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                href="/#collection"
                className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.1em] text-[#59634b] hover:text-[#20211f]"
              >
                <ArrowLeft size={15} />
                TAMBAH PRODUK LAIN
              </Link>
            </div>

            <aside className="border border-[#20211f]/15 p-5 sm:p-7 lg:sticky lg:top-28">
              <h2 className="text-lg font-medium tracking-tight">
                Ringkasan pesanan
              </h2>

              <div className="mt-6 space-y-4 border-b border-[#20211f]/15 pb-5 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#77776f]">
                    Subtotal ({totalItems} produk)
                  </span>
                  <span className="font-medium">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#77776f]">Estimasi pengiriman</span>
                  <span className="text-right">
                    {formatRupiah(SHIPPING_COST)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-5">
                <span className="text-sm font-semibold">Estimasi total</span>
                <span className="text-lg font-semibold tracking-tight">
                  {formatRupiah(estimatedTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="flex min-h-14 w-full items-center justify-center bg-[#20211f] px-4 text-center text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:bg-[#59634b]"
              >
                LANJUT KE CHECKOUT
              </Link>

              <p className="mt-4 text-center text-[10px] leading-5 text-[#77776f]">
                Biaya pengiriman merupakan estimasi dan akan dikonfirmasi
                sebelum pembayaran.
              </p>
            </aside>
          </div>
        )}
      </section>

      <footer className="bg-[#20211f] px-5 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="text-xl font-black tracking-[-0.08em]"
          >
            CRAWLFAST<span className="text-[#aab19a]">.</span>
          </Link>

          <p className="text-[10px] text-white/50">
            Everyday essentials. Uncomplicated style.
          </p>
        </div>
      </footer>
    </main>
  );
}
