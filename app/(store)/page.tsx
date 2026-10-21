import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import { getProduct } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Everyday Essentials, Made to Last",
  description:
    "Koleksi pakaian esensial CRAWLFAST: kaos boxy, overshirt, celana relaxed, dan knitwear dengan bahan nyaman untuk gaya sehari-hari.",
  alternates: { canonical: "/" },
};

const MARQUEE = [
  "DESIGNED FOR EVERYDAY",
  "VERSATILE BY NATURE",
  "LESS, BETTER PIECES",
  "YOUR STYLE, YOUR RULES",
];

const VALUES = [
  {
    icon: Truck,
    title: "Gratis ongkir",
    body: "Untuk pembelian di atas Rp 500.000 ke seluruh Indonesia.",
  },
  {
    icon: RotateCcw,
    title: "Tukar 14 hari",
    body: "Ukuran tidak pas? Tukar dengan mudah dalam 14 hari.",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran aman",
    body: "Diproses Midtrans dengan verifikasi 3D Secure.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nadia P.",
    role: "Jakarta",
    quote:
      "Bahannya tebal tapi tetap adem. Boxy tee-nya jadi kaos favorit yang saya pakai hampir setiap minggu.",
  },
  {
    name: "Raka A.",
    role: "Bandung",
    quote:
      "Overshirt-nya rapi untuk kerja dan santai untuk weekend. Jahitannya benar-benar rapi untuk harga segini.",
  },
  {
    name: "Sinta M.",
    role: "Surabaya",
    quote:
      "Pengiriman cepat, packaging rapi, dan ukurannya sesuai panduan. Pasti belanja lagi untuk koleksi berikutnya.",
  },
];

export default function HomePage() {
  const heroProduct = getProduct("essential-boxy-tee");

  return (
    <>
      {/* Hero */}
      <section className="container-page grid gap-8 pb-12 pt-8 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-16 lg:pt-14">
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-sage" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sage">
              Koleksi 001 — Everyday Edit
            </p>
          </div>

          <h1 className="display mt-5 text-[48px] sm:text-[68px] lg:text-[84px]">
            Less, but
            <br />
            <span className="serif-accent">better.</span>
            <br />
            Made for every day.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-ink-soft">
            Pakaian esensial untuk setiap versi dirimu. Siluet yang tenang,
            lapisan yang serbaguna, dan potongan yang terasa seperti kamu.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-primary group">
              Belanja koleksi
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link href="/about" className="btn btn-secondary">
              Kenali CRAWLFAST
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-ink-muted">
                Rating
              </dt>
              <dd className="mt-1 flex items-center gap-1 text-lg font-semibold tracking-tight">
                4.8
                <Star
                  size={13}
                  className="fill-sage text-sage"
                  aria-hidden="true"
                />
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-ink-muted">
                Ulasan
              </dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight">
                600+
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-ink-muted">
                Produksi
              </dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight">
                Lokal
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative animate-fade-up delay-200">
          <div className="relative overflow-hidden bg-sand">
            <Image
              src="/editorial/hero.jpg"
              alt="Editorial koleksi CRAWLFAST dengan pakaian netral"
              width={1400}
              height={1600}
              priority
              sizes="(max-width: 1023px) 100vw, 46vw"
              className="h-[360px] w-full object-cover sm:h-[520px] lg:h-[600px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/0 to-transparent" />

            <div className="absolute inset-x-5 top-5 text-white sm:inset-x-7 sm:top-7">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">
                The new edit
              </p>
              <p className="mt-1 text-xl tracking-tight sm:text-2xl">
                Everyday, redefined.
              </p>
            </div>
          </div>

          {heroProduct && (
            <Link
              href={`/products/${heroProduct.slug}`}
              className="group absolute -bottom-7 left-4 hidden max-w-[260px] items-center gap-3 border border-line bg-cream p-3 shadow-[0_24px_60px_-36px_rgba(29,30,26,0.6)] sm:flex lg:-left-8"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-sand">
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.imageAlt}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                  {heroProduct.tag ?? "Bestseller"}
                </p>
                <p className="truncate text-xs font-medium">
                  {heroProduct.name}
                </p>
                <p className="mt-1 text-[11px] font-semibold">
                  {formatRupiah(heroProduct.price)}
                </p>
              </div>
              <ArrowUpRight
                size={15}
                className="ml-auto shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </section>

      {/* Marquee */}
      <section
        aria-hidden="true"
        className="overflow-hidden border-y border-line py-4"
      >
        <div className="flex w-max animate-marquee items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {MARQUEE.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-6 px-6 text-[10px] font-semibold tracking-[0.2em] text-ink-soft"
                >
                  {item}
                  <Sparkles size={12} className="text-sage" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <FeaturedCollection />

      {/* Lookbook editorial */}
      <section id="lookbook" className="bg-sand/60 py-16 sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/editorial/lookbook-01.jpg"
                alt="Lookbook layer netral CRAWLFAST"
                fill
                sizes="(max-width: 1023px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden sm:mt-12">
              <Image
                src="/editorial/lookbook-02.jpg"
                alt="Detail bahan koleksi CRAWLFAST"
                fill
                sizes="(max-width: 1023px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow">Lookbook / 001</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl lg:text-[56px]">
              Layer, don&rsquo;t
              <br />
              <span className="serif-accent">overthink.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-ink-soft">
              Mulai dari dasar yang tepat: kaos dengan struktur, overshirt yang
              ringan, dan celana dengan jatuh yang bersih. Tiga potongan yang
              bisa bekerja bersama sepanjang tahun.
            </p>

            <ul className="mt-7 space-y-3 border-t border-ink/10 pt-6 text-sm">
              {[
                "Palet netral yang mudah dipadukan",
                "Bahan breathable untuk iklim tropis",
                "Potongan unisex dengan rentang ukuran S–XL",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" />
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/products?category=Outerwear"
              className="btn btn-primary mt-8 group"
            >
              Belanja outerwear
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {VALUES.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="border-t border-line pt-6 sm:pt-7"
              >
                <Icon size={22} strokeWidth={1.4} className="text-sage" />
                <h3 className="mt-4 text-sm font-semibold tracking-tight">
                  {value.title}
                </h3>
                <p className="mt-2 max-w-xs text-[13px] leading-6 text-ink-soft">
                  {value.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sage-light">
              The CRAWLFAST philosophy
            </p>
            <p className="display mt-5 max-w-2xl text-3xl leading-[1.12] sm:text-5xl">
              Gaya yang baik dimulai dari{" "}
              <span className="serif-accent text-sage-light">
                tahu apa yang penting.
              </span>
            </p>
          </div>

          <div>
            <p className="max-w-sm text-sm leading-7 text-white/55">
              Pakai yang terasa tepat. Bangun lemari dari potongan yang saling
              melengkapi, nyaman dipakai, dan tetap relevan melewati musim.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white"
            >
              Baca cerita kami
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Community notes</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">
              Dipakai, <span className="serif-accent">dicintai.</span>
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-6 text-ink-soft">
            Ulasan dari pelanggan yang memakai CRAWLFAST setiap hari.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col border border-line p-5 sm:p-6"
            >
              <div
                className="flex gap-0.5 text-sage"
                aria-label="Penilaian 5 dari 5"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={12}
                    className="fill-sage text-sage"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[13px] leading-6 text-ink-soft">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <p className="text-xs font-semibold">{testimonial.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  {testimonial.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container-page pb-16 sm:pb-20">
        <div className="relative overflow-hidden bg-sand px-6 py-12 text-center sm:px-12 sm:py-16">
          <PackageCheck
            size={30}
            strokeWidth={1.3}
            className="mx-auto text-sage"
          />
          <h2 className="display mx-auto mt-5 max-w-xl text-3xl sm:text-4xl">
            Siap menemukan potongan{" "}
            <span className="serif-accent">yang tepat?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
            Butuh bantuan ukuran atau pengiriman? Tim kami siap membantu sebelum
            dan sesudah kamu berbelanja.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-primary">
              Mulai belanja
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Hubungi kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
