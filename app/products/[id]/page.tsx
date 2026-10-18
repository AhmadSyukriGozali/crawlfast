
"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useParams } from "next/navigation";

const products = [
  {
    id: 1,
    name: "Essential Boxy Tee",
    category: "T-Shirts",
    price: "Rp 189.000",
    tag: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
    description:
      "Kaos esensial dengan siluet boxy yang santai. Mudah dipadukan dengan berbagai gaya untuk menemani aktivitas sehari-hari.",
    color: "bg-[#e9e5dc]",
  },
  {
    id: 2,
    name: "Utility Overshirt",
    category: "Outerwear",
    price: "Rp 429.000",
    tag: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85",
    description:
      "Overshirt serbaguna dengan tampilan modern. Cocok digunakan sebagai lapisan tambahan untuk gaya kasual yang rapi.",
    color: "bg-[#e6e3dc]",
  },
  {
    id: 3,
    name: "Relaxed Straight Pants",
    category: "Bottoms",
    price: "Rp 349.000",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=85",
    description:
      "Celana berpotongan straight dengan siluet relaxed yang nyaman. Pilihan versatile untuk tampilan santai maupun smart casual.",
    color: "bg-[#e8e5df]",
  },
  {
    id: 4,
    name: "Everyday Knit",
    category: "T-Shirts",
    price: "Rp 279.000",
    tag: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85",
    description:
      "Atasan knit untuk melengkapi koleksi pakaian sehari-hari. Desainnya mudah dipadukan dan cocok untuk berbagai kesempatan.",
    color: "bg-[#e6e3dc]",
  },
];

const sizes = ["S", "M", "L", "XL"];

type CartItem = {
  productId: number;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f3ee]" aria-busy="true" />
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const product = products.find((item) => item.id === productId);

  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  function addToCart() {
    if (!product) return;

    if (!selectedSize) {
      setError("Pilih ukuran terlebih dahulu.");
      return;
    }

    try {
      const storedCart = localStorage.getItem("crawlfast-cart");
      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      if (!Array.isArray(cart)) {
        throw new Error("Format keranjang tidak valid.");
      }

      const existingItem = cart.find(
        (item) =>
          item.productId === product.id && item.size === selectedSize,
      );

      let updatedCart: CartItem[];

      if (existingItem) {
        updatedCart = cart.map((item) =>
          item.productId === product.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        updatedCart = [
          ...cart,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem("crawlfast-cart", JSON.stringify(updatedCart));
      setError("");
      setAdded(true);
    } catch {
      setError(
        "Produk belum bisa disimpan. Periksa penyimpanan browser kamu, lalu coba lagi.",
      );
    }
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f3ee] px-5 text-center text-[#20211f]">
        <p className="text-xs tracking-[0.2em] text-[#59634b]">
          CRAWLFAST / PRODUCT
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight">
          Produk tidak ditemukan
        </h1>
        <p className="mt-3 text-sm text-[#77776f]">
          Produk yang kamu cari mungkin tidak tersedia.
        </p>
        <Link
          href="/#collection"
          className="mt-7 bg-[#20211f] px-6 py-4 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-[#59634b]"
        >
          KEMBALI KE KOLEKSI
        </Link>
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
            href="/cart"
            aria-label="Buka keranjang"
            className="flex items-center gap-2 transition-colors hover:text-[#59634b]"
          >
            <ShoppingBag size={20} strokeWidth={1.6} />
            <span className="hidden text-[10px] font-medium tracking-[0.1em] sm:inline">
              KERANJANG
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 pt-6 sm:px-8 lg:px-12">
        <Link
          href="/#collection"
          className="inline-flex items-center gap-2 text-xs text-[#66665e] transition-colors hover:text-[#59634b]"
        >
          <ArrowLeft size={16} />
          Kembali ke koleksi
        </Link>
      </div>

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 pb-16 pt-6 sm:px-8 sm:pb-20 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:pt-8">
        <div className={`relative overflow-hidden ${product.color}`}>
          {product.tag && (
            <span className="absolute left-4 top-4 z-10 bg-[#f5f3ee] px-3 py-2 text-[9px] font-semibold tracking-[0.1em]">
              {product.tag}
            </span>
          )}

          <div className="relative aspect-[4/5] w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-start lg:sticky lg:top-28 lg:self-start lg:pt-8">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
            {product.category.toUpperCase()}
          </p>

          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.055em] sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <p className="mt-5 text-lg font-semibold">{product.price}</p>

          <div className="mt-7 w-full border-t border-[#20211f]/15 pt-6">
            <p className="text-[10px] font-semibold tracking-[0.14em]">
              DESKRIPSI PRODUK
            </p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[#66665e]">
              {product.description}
            </p>
          </div>

          <div className="mt-8 w-full">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-[0.14em]">
                PILIH UKURAN
              </p>
              <span className="text-[10px] text-[#77776f]">
                Ukuran tersedia
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {sizes.map((size) => {
                const selected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedSize(size);
                      setError("");
                      setAdded(false);
                    }}
                    className={`flex h-12 items-center justify-center border text-xs font-medium transition-colors ${
                      selected
                        ? "border-[#20211f] bg-[#20211f] text-white"
                        : "border-[#20211f]/20 hover:border-[#20211f]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {error && (
              <p role="alert" className="mt-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={addToCart}
              className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 bg-[#20211f] px-5 text-[10px] font-semibold tracking-[0.14em] text-white transition-colors hover:bg-[#59634b]"
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added ? "DITAMBAHKAN KE KERANJANG" : "TAMBAH KE KERANJANG"}
            </button>

            {added && (
              <Link
                href="/cart"
                className="mt-3 flex min-h-12 w-full items-center justify-center border border-[#20211f]/20 text-[10px] font-semibold tracking-[0.12em] transition-colors hover:border-[#20211f]"
              >
                LIHAT KERANJANG
              </Link>
            )}
          </div>

          <div className="mt-8 w-full border-t border-[#20211f]/15 pt-5">
            <p className="text-[10px] leading-6 tracking-[0.06em] text-[#77776f]">
              DESAIN UNTUK SEHARI-HARI
              <br />
              GAYA SEDERHANA, PILIHAN YANG LEBIH BAIK.
            </p>
          </div>
        </div>
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
