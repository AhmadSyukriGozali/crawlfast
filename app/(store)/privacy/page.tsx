import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/store/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi CRAWLFAST: data apa yang dikumpulkan, bagaimana digunakan, dan hak kamu sebagai pelanggan.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Kebijakan"
      accent="privasi."
      description="Kami hanya mengumpulkan data yang diperlukan untuk memproses pesanan dan meningkatkan layanan. Halaman ini menjelaskan caranya."
    >
      <div className="prose-site">
        <p>
          Terakhir diperbarui: 1 Oktober 2026. Kebijakan ini berlaku untuk
          situs CRAWLFAST dan layanan terkait.
        </p>

        <h2>1. Data yang kami kumpulkan</h2>
        <ul>
          <li>
            <strong>Data pesanan:</strong> nama, email, nomor telepon, alamat
            pengiriman, dan catatan pesanan.
          </li>
          <li>
            <strong>Data transaksi:</strong> nomor pesanan, jumlah, status
            pembayaran, dan referensi transaksi dari Midtrans.
          </li>
          <li>
            <strong>Data perangkat:</strong> informasi teknis terbatas seperti
            jenis browser dan alamat IP untuk keamanan serta pencegahan
            penyalahgunaan.
          </li>
          <li>
            <strong>Preferensi lokal:</strong> keranjang dan wishlist disimpan
            di penyimpanan browser perangkatmu, bukan di akun server.
          </li>
        </ul>

        <h2>2. Bagaimana data digunakan</h2>
        <ul>
          <li>Memproses, mengirim, dan melayani pesanan.</li>
          <li>Mengonfirmasi pembayaran melalui Midtrans.</li>
          <li>Menanggapi pertanyaan dan permintaan pengembalian.</li>
          <li>Mencegah penipuan dan menjaga keamanan layanan.</li>
          <li>Memenuhi kewajiban hukum yang berlaku.</li>
        </ul>

        <h2>3. Pembayaran</h2>
        <p>
          Pembayaran diproses oleh Midtrans. CRAWLFAST tidak menerima atau
          menyimpan nomor kartu, CVV, PIN, atau kredensial perbankan kamu.
          Informasi yang dibagikan ke Midtrans terbatas pada data yang
          diperlukan untuk memproses transaksi.
        </p>

        <h2>4. Berbagi data</h2>
        <p>
          Kami tidak menjual data pelanggan. Data hanya dibagikan kepada mitra
          yang diperlukan untuk menjalankan layanan, seperti penyedia
          infrastruktur database, gateway pembayaran, dan kurir pengiriman.
        </p>

        <h2>5. Penyimpanan & keamanan</h2>
        <p>
          Data disimpan pada layanan cloud dengan akses terbatas. Komunikasi
          menggunakan HTTPS, akses panel admin dilindungi autentikasi dan
          allowlist email, serta notifikasi pembayaran diverifikasi dengan
          tanda tangan kriptografis. Tidak ada sistem yang sepenuhnya bebas
          risiko, tetapi kami menerapkan langkah yang wajar untuk melindungi
          data.
        </p>

        <h2>6. Hak kamu</h2>
        <p>
          Kamu dapat meminta akses, koreksi, atau penghapusan data pribadi
          dengan menghubungi {SITE.email}. Permintaan akan diproses setelah
          verifikasi identitas, sejauh tidak bertentangan dengan kewajiban
          hukum penyimpanan data transaksi.
        </p>

        <h2>7. Cookie & penyimpanan lokal</h2>
        <p>
          Situs menggunakan penyimpanan lokal browser untuk keranjang, wishlist,
          dan sesi admin. Kami tidak menggunakan cookie iklan pihak ketiga.
        </p>

        <h2>8. Perubahan kebijakan</h2>
        <p>
          Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu
          tersedia di halaman ini. Pertanyaan dapat dikirim ke{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> atau melalui{" "}
          <Link href="/contact">halaman kontak</Link>.
        </p>
      </div>
    </InfoPage>
  );
}
