import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  LockKeyhole,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Akun Saya",
  description:
    "Akses wishlist, keranjang, pelacakan pesanan, dan informasi keamanan akun CRAWLFAST.",
  alternates: { canonical: "/account" },
};

const LINKS = [
  {
    href: "/track",
    icon: PackageSearch,
    title: "Lacak pesanan",
    description:
      "Lihat status pembayaran dan progres pengiriman dengan nomor pesanan.",
  },
  {
    href: "/wishlist",
    icon: Heart,
    title: "Wishlist",
    description: "Produk yang kamu simpan untuk nanti.",
  },
  {
    href: "/cart",
    icon: ShoppingBag,
    title: "Keranjang",
    description: "Lanjutkan checkout atau periksa kembali pilihanmu.",
  },
  {
    href: "/privacy",
    icon: ShieldCheck,
    title: "Privasi & keamanan",
    description: "Cara kami menyimpan dan melindungi data kamu.",
  },
];

export default function AccountPage() {
  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <header className="border-b border-line pb-7">
        <p className="eyebrow">Your account</p>
        <h1 className="display mt-4 text-4xl sm:text-5xl">
          Akun <span className="serif-accent">saya.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
          Satu tempat untuk pesanan, wishlist, dan preferensi belanja kamu.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-line bg-white/40 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-sage">
            <UserRound size={26} strokeWidth={1.6} />
          </div>

          <h2 className="mt-5 text-2xl tracking-tight">
            Akun pelanggan segera hadir
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
            Login pelanggan, riwayat pesanan otomatis, dan penyimpanan alamat
            sedang kami siapkan. Sementara itu, pesanan tetap bisa dilacak
            kapan saja menggunakan nomor pesanan dan email.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/track" className="btn btn-primary">
              <PackageSearch size={15} />
              Lacak pesanan
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Mulai belanja
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-3 border-t border-line pt-5">
            <LockKeyhole size={18} className="mt-0.5 shrink-0 text-sage" />
            <p className="text-xs leading-6 text-ink-soft">
              Akses panel admin terpisah dan dilindungi autentikasi Supabase
              serta allowlist email. Halaman login admin dapat diakses{" "}
              <Link
                href="/login"
                className="text-sage underline underline-offset-4"
              >
                di sini
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border border-line">
          <div className="border-b border-line p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={16} className="text-sage" />
              Pintasan
            </p>
          </div>

          <div className="divide-y divide-line">
            {LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-4 p-5 transition-colors hover:bg-sand/50 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-sage/10 text-sage">
                    <Icon size={19} strokeWidth={1.6} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">{link.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-ink-soft">
                      {link.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
