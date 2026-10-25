"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/hooks/useCart";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { FREE_SHIPPING_THRESHOLD, MAX_QUANTITY_PER_ITEM } from "@/lib/shipping";

export default function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isSaved, toggle } = useWishlist();

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const saved = isSaved(product.id);

  function handleAddToCart() {
    if (!size) {
      setError("Pilih ukuran terlebih dahulu.");
      return;
    }

    const success = addItem(product, size, quantity);

    if (!success) {
      setError(
        "Produk belum bisa disimpan. Periksa penyimpanan browser lalu coba lagi.",
      );
      return;
    }

    setError("");
    setAdded(true);
  }

  return (
    <div>
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
            Pilih ukuran
          </p>
          <Link
            href="/size-guide"
            className="flex items-center gap-1.5 text-[10px] text-ink-muted underline underline-offset-4 transition-colors hover:text-sage"
          >
            <Ruler size={13} />
            Panduan ukuran
          </Link>
        </div>

        <div
          className="mt-3 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.max(product.sizes.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {product.sizes.map((item) => {
            const selected = size === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setSize(item);
                  setError("");
                  setAdded(false);
                }}
                className={`flex h-12 items-center justify-center border text-xs font-semibold transition-colors ${
                  selected
                    ? "border-ink bg-ink text-white"
                    : "border-line hover:border-ink"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 w-full items-center justify-between border border-line sm:w-36">
          <button
            type="button"
            onClick={() => {
              setQuantity((current) => Math.max(1, current - 1));
              setAdded(false);
            }}
            aria-label="Kurangi jumlah"
            disabled={quantity <= 1}
            className="flex h-full w-11 items-center justify-center transition-colors hover:bg-sand disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
          <span aria-live="polite" className="text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => {
              setQuantity((current) =>
                Math.min(MAX_QUANTITY_PER_ITEM, current + 1),
              );
              setAdded(false);
            }}
            aria-label="Tambah jumlah"
            disabled={quantity >= MAX_QUANTITY_PER_ITEM}
            className="flex h-full w-11 items-center justify-center transition-colors hover:bg-sand disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="btn btn-primary h-14 flex-1"
        >
          {added ? <Check size={17} /> : <ShoppingBag size={17} />}
          {added ? "Ditambahkan ke keranjang" : "Tambah ke keranjang"}
        </button>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-pressed={saved}
          aria-label={
            saved ? "Hapus dari wishlist" : "Simpan produk ke wishlist"
          }
          className={`flex h-14 w-14 shrink-0 items-center justify-center border transition-colors ${
            saved
              ? "border-sage bg-sage text-white"
              : "border-line hover:border-ink"
          }`}
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {added && (
        <Link
          href="/cart"
          className="btn btn-secondary mt-3 w-full border-sage text-sage"
        >
          Lihat keranjang
        </Link>
      )}

      <div className="mt-6 space-y-3 border-t border-line pt-5 text-[11px] text-ink-soft">
        <p className="flex items-center gap-2.5">
          <Truck size={15} className="shrink-0 text-sage" />
          Gratis ongkir untuk pesanan di atas{" "}
          {formatRupiah(FREE_SHIPPING_THRESHOLD)}
        </p>
        <p className="flex items-center gap-2.5">
          <ShieldCheck size={15} className="shrink-0 text-sage" />
          Pembayaran aman via Midtrans · 3D Secure
        </p>
        <p className="flex items-center gap-2.5">
          <Check size={15} className="shrink-0 text-sage" />
          Tukar ukuran dalam 14 hari
        </p>
      </div>
    </div>
  );
}
