import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/store/InfoPage";

export const metadata: Metadata = {
  title: "Pengembalian & Penukaran",
  description:
    "Kebijakan penukaran ukuran dan pengembalian produk CRAWLFAST dalam 14 hari.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Returns"
      title="Tukar atau"
      accent="kembalikan."
      description="Kami ingin kamu benar-benar memakai pakaiannya. Jika ukuran tidak pas atau ada masalah, berikut alurnya."
    >
      <div className="prose-site">
        <h2>Penukaran ukuran (14 hari)</h2>
        <p>
          Penukaran ukuran dapat dilakukan maksimal 14 hari setelah paket
          diterima. Produk harus belum dipakai, belum dicuci, tidak berbau, dan
          label masih terpasang.
        </p>
        <ul>
          <li>Hubungi kami melalui email dengan nomor pesanan.</li>
          <li>Sertakan foto produk dan label untuk verifikasi.</li>
          <li>
            Kami akan mengonfirmasi ketersediaan ukuran pengganti sebelum kamu
            mengirim balik produk.
          </li>
          <li>
            Biaya pengiriman penukaran pertama ditanggung pelanggan, kecuali
            kesalahan berasal dari kami.
          </li>
        </ul>

        <h2>Pengembalian dana</h2>
        <p>
          Pengembalian dana diproses jika produk rusak saat diterima atau tidak
          sesuai pesanan. Laporkan dalam 3 x 24 jam setelah paket diterima
          dengan menyertakan foto atau video unboxing. Dana dikembalikan ke
          metode pembayaran awal dalam 5–14 hari kerja setelah produk diterima
          dan diperiksa.
        </p>

        <h2>Yang tidak dapat dikembalikan</h2>
        <ul>
          <li>Produk yang sudah dipakai, dicuci, atau diubah.</li>
          <li>Produk tanpa label atau kemasan asli.</li>
          <li>Produk yang dibeli saat flash sale final (akan ditandai jelas).</li>
        </ul>

        <p>
          Ada pertanyaan sebelum membeli? Lihat{" "}
          <Link href="/size-guide">panduan ukuran</Link> atau{" "}
          <Link href="/contact">hubungi kami</Link>.
        </p>
      </div>
    </InfoPage>
  );
}
