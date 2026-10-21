"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useMounted } from "@/lib/hooks/useMounted";
import { formatRupiah } from "@/lib/format";
import {
  amountToFreeShipping,
  calculateShipping,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/shipping";

export default function CartPage() {
  const mounted = useMounted();
  const {
    items,
    totalItems,
    subtotal,
    setQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const remaining = amountToFreeShipping(subtotal);

  if (!mounted) {
    return (
      <div className="container-page py-24 text-center text-sm text-ink-muted">
        Memuat keranjang...
      </div>
    );
  }

  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-sage"
      >
        <ArrowLeft size={14} />
        Lanjut belanja
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Your selection</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">
            Keranjang <span className="serif-accent">belanja.</span>
          </h1>
        </div>
        <p className="text-xs text-ink-soft">
          {totalItems} produk{totalItems === 1 ? "" : ""}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center border border-dashed border-line px-5 py-16 text-center sm:py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand">
            <ShoppingBag size={25} strokeWidth={1.4} />
          </div>
          <h2 className="mt-6 text-2xl font-medium tracking-tight">
            Keranjangmu masih kosong
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
            Temukan pakaian esensial favoritmu dan tambahkan ke keranjang untuk
            mulai berbelanja.
          </p>
          <Link href="/products" className="btn btn-primary mt-7">
            Mulai belanja
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                Produk kamu ({totalItems})
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Kosongkan seluruh keranjang?")) {
                    clearCart();
                  }
                }}
                className="text-[10px] uppercase tracking-[0.08em] text-ink-muted underline underline-offset-4 transition-colors hover:text-red-700"
              >
                Kosongkan
              </button>
            </div>

            <div className="divide-y divide-line border-y border-line">
              {items.map((item) => (
                <article
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 py-5 sm:gap-6"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative aspect-[4/5] w-[104px] shrink-0 overflow-hidden bg-sand sm:w-[136px]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="136px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-medium leading-5 transition-colors hover:text-sage sm:text-base"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1.5 text-[11px] text-ink-muted">
                          Ukuran: {item.size}
                        </p>
                        <p className="mt-1.5 text-xs font-semibold">
                          {formatRupiah(item.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label={`Hapus ${item.name} ukuran ${item.size}`}
                        className="shrink-0 p-1 text-ink-muted transition-colors hover:text-red-700"
                      >
                        <Trash2 size={17} strokeWidth={1.6} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <div className="inline-flex h-9 items-center border border-line">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          aria-label={`Kurangi jumlah ${item.name}`}
                          className="flex h-full w-9 items-center justify-center transition-colors hover:bg-sand"
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
                          onClick={() =>
                            setQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          aria-label={`Tambah jumlah ${item.name}`}
                          className="flex h-full w-9 items-center justify-center transition-colors hover:bg-sand"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <p className="text-right text-xs font-semibold sm:text-sm">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sage hover:text-ink"
            >
              <ArrowLeft size={15} />
              Tambah produk lain
            </Link>
          </div>

          <aside className="border border-line p-5 sm:p-7 lg:sticky lg:top-28">
            <h2 className="text-lg font-medium tracking-tight">
              Ringkasan pesanan
            </h2>

            <div className="mt-4 border border-sage/20 bg-sage/5 p-3">
              {remaining > 0 ? (
                <>
                  <p className="text-[11px] leading-5 text-ink-soft">
                    Tambah{" "}
                    <span className="font-semibold text-ink">
                      {formatRupiah(remaining)}
                    </span>{" "}
                    lagi untuk gratis ongkir.
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-sage transition-all"
                      style={{
                        width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="flex items-center gap-2 text-[11px] font-medium text-sage">
                  <Truck size={14} />
                  Kamu mendapat gratis ongkir.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3.5 border-b border-line pb-5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-soft">
                  Subtotal ({totalItems} produk)
                </span>
                <span className="font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-soft">Pengiriman</span>
                <span className="font-medium">
                  {shipping === 0 ? "Gratis" : formatRupiah(shipping)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-5">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-semibold tracking-tight">
                {formatRupiah(total)}
              </span>
            </div>

            <Link href="/checkout" className="btn btn-primary w-full">
              Lanjut ke checkout
              <ArrowRight size={15} />
            </Link>

            <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-ink-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-sage" />
              Total akhir, ongkir, dan ketersediaan dikonfirmasi oleh server
              sebelum pembayaran.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
