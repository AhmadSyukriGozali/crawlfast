import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Ruler, Scissors } from "lucide-react";
import InfoPage from "@/components/store/InfoPage";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Cerita CRAWLFAST: pakaian esensial yang dibuat dengan bahan pilihan, produksi lokal, dan desain yang tahan tren.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: Scissors,
    title: "Potongan yang tenang",
    body: "Siluet sederhana yang memberi ruang untuk bergerak, bukan menuntut perhatian.",
  },
  {
    icon: Leaf,
    title: "Bahan yang bertanggung jawab",
    body: "Kami memilih katun, linen, dan wool dengan mempertimbangkan kenyamanan serta daya tahan.",
  },
  {
    icon: Ruler,
    title: "Ukuran yang jelas",
    body: "Panduan ukuran terperinci dan foto produk apa adanya membantu kamu memilih dengan yakin.",
  },
];

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title="Sedikit, tapi"
      accent="berarti."
      description="CRAWLFAST lahir dari ide sederhana: lemari yang lebih kecil, tetapi berisi pakaian yang benar-benar dipakai."
      wide
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Image
            src="/editorial/store.jpg"
            alt="Studio dan koleksi pakaian CRAWLFAST"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="prose-site">
          <p>
            Kami percaya pakaian terbaik adalah yang tidak perlu banyak dipikir.
            Potongan yang tepat, bahan yang nyaman, dan warna yang mudah
            dipadukan — lalu dipakai berulang kali sampai terasa seperti bagian
            dari dirimu.
          </p>
          <p>
            Setiap koleksi dimulai dari pertanyaan: apakah potongan ini akan
            tetap relevan tiga tahun lagi? Jika jawabannya tidak, kami tidak
            memproduksinya. Pendekatan ini membuat koleksi kami kecil, tetapi
            setiap pieces punya alasan untuk ada.
          </p>
          <p>
            Kami bekerja bersama mitra produksi lokal di Bandung dan Jakarta,
            memilih bahan dengan gramasi yang pas untuk iklim tropis, dan
            memastikan setiap jahitan nyaman dipakai sepanjang hari.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-6 border-t border-line pt-10 sm:grid-cols-3">
        {PRINCIPLES.map((principle) => {
          const Icon = principle.icon;

          return (
            <div key={principle.title}>
              <Icon size={22} strokeWidth={1.4} className="text-sage" />
              <h2 className="mt-4 text-base font-semibold">
                {principle.title}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-ink-soft">
                {principle.body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 border-y border-line py-8 sm:grid-cols-4">
        {[
          ["2024", "Tahun berdiri"],
          ["12", "Pieces inti"],
          ["600+", "Ulasan pelanggan"],
          ["4.8/5", "Rating rata-rata"],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 bg-sand/70 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-xl tracking-tight">Mulai dari satu potongan.</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Temukan dasar yang akan kamu pakai setiap hari.
          </p>
        </div>
        <Link href="/products" className="btn btn-primary group">
          Lihat koleksi
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </InfoPage>
  );
}
