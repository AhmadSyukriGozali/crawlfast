import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/store/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ & Bantuan",
  description:
    "Pertanyaan yang sering diajukan tentang pemesanan, pembayaran, pengiriman, ukuran, dan pengembalian di CRAWLFAST.",
  alternates: { canonical: "/faq" },
};

const FAQ_GROUPS = [
  {
    title: "Pemesanan",
    items: [
      {
        q: "Bagaimana cara memesan?",
        a: "Pilih produk, tentukan ukuran dan jumlah, lalu tambahkan ke keranjang. Setelah itu lanjut ke checkout, isi data pengiriman, dan selesaikan pembayaran melalui halaman Midtrans.",
      },
      {
        q: "Apakah saya bisa mengubah pesanan setelah checkout?",
        a: "Pesanan yang sudah dibayar tidak dapat diubah otomatis. Hubungi kami secepatnya dengan nomor pesanan; perubahan masih mungkin dilakukan selama pesanan belum dikirim.",
      },
      {
        q: "Apakah perlu membuat akun?",
        a: "Tidak. Checkout dapat dilakukan tanpa akun. Fitur akun pelanggan sedang disiapkan; sementara itu gunakan halaman lacak pesanan untuk memantau status.",
      },
    ],
  },
  {
    title: "Pembayaran",
    items: [
      {
        q: "Metode pembayaran apa yang tersedia?",
        a: "Pembayaran diproses oleh Midtrans dan mendukung QRIS, transfer bank (virtual account), kartu kredit/debit ber-3D Secure, serta dompet digital yang tersedia di halaman pembayaran.",
      },
      {
        q: "Apakah pembayaran saya aman?",
        a: "Ya. CRAWLFAST tidak menyimpan data kartu. Seluruh proses pembayaran ditangani Midtrans, dan status pesanan diperbarui melalui notifikasi bertanda tangan yang diverifikasi di server kami.",
      },
      {
        q: "Berapa lama konfirmasi pembayaran?",
        a: "Sebagian besar pembayaran terkonfirmasi dalam hitungan detik hingga beberapa menit. Virtual account dan QRIS dapat membutuhkan waktu lebih lama tergantung bank penerbit.",
      },
    ],
  },
  {
    title: "Pengiriman & pengembalian",
    items: [
      {
        q: "Berapa lama pengiriman?",
        a: "Pesanan diproses dalam 1–2 hari kerja. Estimasi tiba 2–5 hari kerja setelah pengiriman, tergantung lokasi. Info lengkap ada di halaman pengiriman.",
      },
      {
        q: "Apakah ada gratis ongkir?",
        a: "Gratis ongkir berlaku untuk subtotal pesanan di atas Rp 500.000 sebelum diskon dan biaya lain.",
      },
      {
        q: "Bagaimana cara menukar ukuran?",
        a: "Tukar ukuran dapat dilakukan dalam 14 hari setelah pesanan diterima, selama produk belum dipakai, belum dicuci, dan label masih terpasang. Lihat halaman pengembalian untuk alurnya.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Help center"
      title="Pertanyaan yang"
      accent="sering diajukan."
      description="Temukan jawaban cepat seputar pemesanan, pembayaran, pengiriman, dan ukuran. Jika belum terjawab, tim kami siap membantu."
    >
      <div className="space-y-10">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage">
              {group.title}
            </h2>

            <div className="mt-4 divide-y divide-line border-y border-line">
              {group.items.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex items-center justify-between gap-4 text-sm font-medium">
                    {item.q}
                    <span className="accordion-icon text-lg font-light transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[13px] leading-6 text-ink-soft">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 bg-sand/70 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg tracking-tight">Masih butuh bantuan?</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Kirim email ke{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-sage underline underline-offset-4"
            >
              {SITE.email}
            </a>{" "}
            dan kami balas dalam 1 hari kerja.
          </p>
        </div>
        <Link href="/contact" className="btn btn-secondary">
          Hubungi kami
        </Link>
      </div>
    </InfoPage>
  );
}
