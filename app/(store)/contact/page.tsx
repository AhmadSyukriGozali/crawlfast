import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Camera, Mail, MapPin, MessageCircle } from "lucide-react";
import InfoPage from "@/components/store/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi tim CRAWLFAST untuk pertanyaan pesanan, ukuran, pengiriman, atau pengembalian.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "Balasan dalam 1 hari kerja.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+62 812-3456-7890",
    href: SITE.whatsapp,
    note: "Senin–Jumat, 09.00–17.00 WIB.",
  },
  {
    icon: Camera,
    title: "Instagram",
    value: "@crawlfast",
    href: SITE.instagram,
    note: "Update koleksi dan behind the scenes.",
  },
];

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Mari"
      accent="berbicara."
      description="Punya pertanyaan tentang pesanan, ukuran, atau pengiriman? Pilih kanal yang paling nyaman untukmu."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;

          return (
            <a
              key={channel.title}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={
                channel.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="group border border-line p-5 transition-colors hover:border-sage hover:bg-sand/40"
            >
              <Icon size={21} className="text-sage" />
              <p className="mt-4 text-sm font-semibold">{channel.title}</p>
              <p className="mt-1 break-words text-[13px] text-ink-soft">
                {channel.value}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                {channel.note}
              </p>
            </a>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="border border-line p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Clock3 size={17} className="text-sage" />
            Jam operasional
          </p>
          <p className="mt-2 text-[13px] leading-6 text-ink-soft">
            Senin–Jumat: 09.00–17.00 WIB
            <br />
            Sabtu: 09.00–13.00 WIB
            <br />
            Minggu & hari libur: tutup
          </p>
        </div>

        <div className="border border-line p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MapPin size={17} className="text-sage" />
            Studio
          </p>
          <p className="mt-2 text-[13px] leading-6 text-ink-soft">
            Jakarta, Indonesia
            <br />
            Kunjungan hanya dengan janji temu.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-6 text-sm leading-7 text-ink-soft">
        <p>
          Untuk pertanyaan tentang pesanan, sertakan nomor pesanan agar kami
          dapat membantu lebih cepat. Cek juga{" "}
          <Link href="/track" className="text-sage underline underline-offset-4">
            halaman lacak pesanan
          </Link>{" "}
          dan{" "}
          <Link href="/faq" className="text-sage underline underline-offset-4">
            FAQ
          </Link>{" "}
          sebelum menghubungi kami.
        </p>
      </div>
    </InfoPage>
  );
}
