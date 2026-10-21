import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/store/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan situs serta pembelian produk CRAWLFAST.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Syarat &"
      accent="ketentuan."
      description="Dengan menggunakan situs dan melakukan pembelian, kamu menyetujui ketentuan berikut."
    >
      <div className="prose-site">
        <p>Terakhir diperbarui: 1 Oktober 2026.</p>

        <h2>1. Penggunaan situs</h2>
        <p>
          Situs CRAWLFAST disediakan untuk keperluan berbelanja dan informasi.
          Kamu setuju untuk tidak menyalahgunakan situs, termasuk mencoba
          mengakses area terbatas, mengirim permintaan otomatis secara berlebih,
          atau mengganggu layanan.
        </p>

        <h2>2. Produk & ketersediaan</h2>
        <p>
          Kami berusaha menampilkan warna dan detail produk seakurat mungkin.
          Perbedaan tampilan warna dapat terjadi karena pengaturan layar. Stok
          dapat berubah; jika produk tidak tersedia setelah pembayaran, kami
          akan menghubungi kamu untuk penukaran atau pengembalian dana.
        </p>

        <h2>3. Harga & pembayaran</h2>
        <p>
          Semua harga dalam Rupiah dan dapat berubah tanpa pemberitahuan
          sebelumnya. Harga final dihitung ulang di server saat checkout.
          Pembayaran harus diselesaikan melalui halaman Midtrans yang disediakan.
          Pesanan yang belum dibayar dalam batas waktu yang ditentukan akan
          dibatalkan otomatis.
        </p>

        <h2>4. Pengiriman</h2>
        <p>
          Estimasi pengiriman bersifat perkiraan dan dapat berubah karena faktor
          kurir atau cuaca. Detail biaya dan estimasi dijelaskan di{" "}
          <Link href="/shipping">halaman pengiriman</Link>.
        </p>

        <h2>5. Pengembalian</h2>
        <p>
          Penukaran dan pengembalian tunduk pada{" "}
          <Link href="/returns">kebijakan pengembalian</Link>. Produk yang telah
          dipakai, dicuci, atau kehilangan label tidak dapat dikembalikan,
          kecuali terdapat cacat produksi.
        </p>

        <h2>6. Kekayaan intelektual</h2>
        <p>
          Nama, logo, foto, dan konten CRAWLFAST dilindungi hukum. Kamu tidak
          boleh menggunakan konten kami untuk kepentingan komersial tanpa izin
          tertulis.
        </p>

        <h2>7. Batasan tanggung jawab</h2>
        <p>
          Sepanjang diizinkan hukum, CRAWLFAST tidak bertanggung jawab atas
          kerugian tidak langsung yang timbul dari penggunaan situs. Ketentuan
          ini tidak mengurangi hak konsumen yang dijamin oleh peraturan
          perlindungan konsumen yang berlaku.
        </p>

        <h2>8. Kontak</h2>
        <p>
          Pertanyaan mengenai ketentuan ini dapat dikirim ke{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </InfoPage>
  );
}
