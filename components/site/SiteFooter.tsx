import Link from "next/link";
import { ArrowUpRight, Camera, Mail, MapPin } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { FOOTER_LINKS, SITE } from "@/lib/site";

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({
  categories = [],
}: {
  categories?: string[];
}) {
  const shopLinks =
    categories.length > 0
      ? [
          { href: "/products", label: "Semua produk" },
          ...categories.map((category) => ({
            href: `/products?category=${encodeURIComponent(category)}`,
            label: category,
          })),
          { href: "/wishlist", label: "Wishlist" },
        ]
      : FOOTER_LINKS.shop;

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8 lg:py-16">
          <div className="max-w-sm">
            <Logo inverted />
            <p className="mt-4 text-[13px] leading-6 text-white/55">
              Pakaian esensial dengan siluet yang tenang, bahan yang nyaman, dan
              desain yang tetap relevan jauh setelah tren berganti.
            </p>

            <div className="mt-6 space-y-3 text-[12px] text-white/60">
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Mail size={15} />
                {SITE.email}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin size={15} />
                {SITE.city}
              </p>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Camera size={15} />
                @crawlfast
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          <LinkColumn title="Belanja" links={shopLinks} />
          <LinkColumn title="Bantuan" links={FOOTER_LINKS.help} />
          <LinkColumn title="Perusahaan" links={FOOTER_LINKS.company} />
        </div>

        <div className="grid gap-6 border-b border-white/10 py-6 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Pembayaran aman
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["QRIS", "BCA", "Mandiri", "BNI", "GoPay", "ShopeePay"].map(
                (method) => (
                  <span
                    key={method}
                    className="border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/65"
                  >
                    {method}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Diproses oleh
            </p>
            <p className="mt-2 text-sm font-semibold tracking-tight">
              Midtrans · 3D Secure
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-[10px] uppercase tracking-[0.12em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© CRAWLFAST. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-white/70">
              Privasi
            </Link>
            <Link href="/terms" className="hover:text-white/70">
              Ketentuan
            </Link>
            <Link href="/login" className="hover:text-white/70">
              Admin
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="select-none overflow-hidden pb-2">
          <p className="-mb-[0.18em] whitespace-nowrap text-[16vw] font-black leading-none tracking-[-0.07em] text-white/[0.045]">
            CRAWLFAST
          </p>
        </div>
      </div>
    </footer>
  );
}
