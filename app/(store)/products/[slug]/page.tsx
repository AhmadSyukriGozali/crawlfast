import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import ProductPurchase from "@/components/product/ProductPurchase";
import { getRelatedProducts } from "@/lib/catalog";
import { getStoreProduct, getStoreProducts } from "@/lib/products/data";
import { formatRupiah } from "@/lib/format";
import { SITE } from "@/lib/site";

// Halaman detail bergantung pada slug dan data produk dari database. Navigasi
// ke halaman ini memang boleh menunggu data, jadi opt-out dari validasi instant.
export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getStoreProducts();

  const params = products.flatMap((product) => [
    { slug: product.slug },
    { slug: String(product.id) },
  ]);

  return params.length > 0 ? params : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProduct(slug);

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — CRAWLFAST`,
      description: product.description,
      url: `${SITE.url}/products/${product.slug}`,
      images: [{ url: product.image, width: 1100, height: 1375, alt: product.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — CRAWLFAST`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getStoreProduct(slug),
    getStoreProducts(),
  ]);

  if (!product) notFound();

  const related = getRelatedProducts(products, product);
  const inStock = true;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image],
    description: product.description,
    sku: `CF-${String(product.id).padStart(4, "0")}`,
    brand: { "@type": "Brand", name: SITE.name },
    category: product.category,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/products/${product.slug}`,
      priceCurrency: "IDR",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Produk",
        item: `${SITE.url}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE.url}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <div className="container-page pb-16 pt-6 sm:pb-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          <Link href="/" className="hover:text-ink">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="hover:text-ink">
            Produk
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="relative aspect-[4/5] overflow-hidden"
              style={{ backgroundColor: product.tint }}
            >
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
              {product.tag && (
                <span className="absolute left-4 top-4 bg-cream px-3 py-1.5 text-[9px] font-semibold tracking-[0.1em]">
                  {product.tag}
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-[10px] text-ink-soft">
              <div className="border border-line p-3 text-center">
                <p className="font-semibold text-ink">Bahan premium</p>
                <p className="mt-1 leading-4">Nyaman & breathable</p>
              </div>
              <div className="border border-line p-3 text-center">
                <p className="font-semibold text-ink">
                  {product.sizes.length === 1 ? "One size" : "Unisex fit"}
                </p>
                <p className="mt-1 leading-4">
                  {product.sizes.length === 1
                    ? "Nyaman untuk semua"
                    : "Ukuran S–XL"}
                </p>
              </div>
              <div className="border border-line p-3 text-center">
                <p className="font-semibold text-ink">Produksi lokal</p>
                <p className="mt-1 leading-4">Dibuat di Indonesia</p>
              </div>
            </div>
          </div>

          <div className="lg:pt-2">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">{product.category}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                <span className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={11}
                      className={
                        index < Math.round(product.rating)
                          ? "fill-sage text-sage"
                          : "text-ink-muted"
                      }
                    />
                  ))}
                </span>
                <span className="font-medium text-ink">
                  {product.rating.toFixed(1)}
                </span>
                <span>({product.reviewCount} ulasan)</span>
              </div>
            </div>

            <h1 className="display mt-3 text-4xl sm:text-5xl lg:text-[56px]">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-xl font-semibold">
                {formatRupiah(product.price)}
              </p>
              {product.compareAtPrice && (
                <>
                  <p className="text-sm text-ink-muted line-through">
                    {formatRupiah(product.compareAtPrice)}
                  </p>
                  <span className="bg-sage/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sage">
                    Hemat{" "}
                    {formatRupiah(product.compareAtPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            <p className="mt-5 max-w-lg text-sm leading-7 text-ink-soft">
              {product.description}
            </p>

            <ProductPurchase product={product} />

            <div className="mt-8 divide-y divide-line border-y border-line">
              <details className="group py-4" open>
                <summary className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Detail produk
                  <span className="accordion-icon text-lg font-light transition-transform duration-200">
                    +
                  </span>
                </summary>
                <ul className="mt-3 space-y-2 pl-1">
                  {product.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2.5 text-[13px] leading-6 text-ink-soft"
                    >
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-sage" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </details>

              <details className="group py-4">
                <summary className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Pengiriman & pengembalian
                  <span className="accordion-icon text-lg font-light transition-transform duration-200">
                    +
                  </span>
                </summary>
                <div className="mt-3 space-y-2 text-[13px] leading-6 text-ink-soft">
                  <p>
                    Dikirim dari Jakarta dalam 1–2 hari kerja. Estimasi tiba 2–5
                    hari kerja tergantung lokasi.
                  </p>
                  <p>
                    Gratis ongkir untuk pesanan di atas{" "}
                    {formatRupiah(500_000)}. Tukar ukuran dapat dilakukan dalam
                    14 hari setelah pesanan diterima.
                  </p>
                  <Link
                    href="/shipping"
                    className="inline-flex items-center gap-1 text-sage underline underline-offset-4"
                  >
                    Baca kebijakan lengkap
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </details>

              <details className="group py-4">
                <summary className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Perawatan
                  <span className="accordion-icon text-lg font-light transition-transform duration-200">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[13px] leading-6 text-ink-soft">
                  Cuci dengan air dingin dan putaran lembut. Balik pakaian
                  sebelum dicuci, hindari pemutih, dan jemur di tempat teduh
                  untuk menjaga warna serta bentuk kain.
                </p>
              </details>
            </div>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-sage"
            >
              <ArrowLeft size={14} />
              Kembali ke semua produk
            </Link>
          </div>
        </div>
      </div>

      <section className="border-t border-line bg-sand/40 py-14 sm:py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Complete the look</p>
              <h2 className="display mt-3 text-3xl sm:text-4xl">
                Padukan <span className="serif-accent">dengan.</span>
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sage hover:text-ink sm:inline-flex"
            >
              Semua produk
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
