import type { Metadata } from "next";
import { Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import InfoPage from "@/components/store/InfoPage";
import { formatRupiah } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Pengiriman",
  description:
    "Informasi ongkos kirim, estimasi waktu pengiriman, dan pelacakan pesanan CRAWLFAST.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Shipping"
      title="Pengiriman yang"
      accent="jelas."
      description="Kami mengirim dari Jakarta dengan mitra kurir terpercaya. Berikut rincian biaya dan estimasi waktunya."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-line p-5">
          <Truck size={21} className="text-sage" />
          <p className="mt-3 text-sm font-semibold">Ongkos kirim</p>
          <p className="mt-1 text-[13px] leading-6 text-ink-soft">
            {formatRupiah(SHIPPING_COST)} untuk seluruh Indonesia. Gratis untuk
            pesanan dengan subtotal di atas{" "}
            {formatRupiah(FREE_SHIPPING_THRESHOLD)}.
          </p>
        </div>
        <div className="border border-line p-5">
          <Clock3 size={21} className="text-sage" />
          <p className="mt-3 text-sm font-semibold">Waktu proses</p>
          <p className="mt-1 text-[13px] leading-6 text-ink-soft">
            1–2 hari kerja setelah pembayaran terkonfirmasi. Pesanan pada akhir
            pekan diproses pada hari kerja berikutnya.
          </p>
        </div>
        <div className="border border-line p-5">
          <MapPin size={21} className="text-sage" />
          <p className="mt-3 text-sm font-semibold">Estimasi tiba</p>
          <p className="mt-1 text-[13px] leading-6 text-ink-soft">
            Jawa 2–3 hari kerja, luar Jawa 3–5 hari kerja, dan area terpencil
            5–7 hari kerja.
          </p>
        </div>
        <div className="border border-line p-5">
          <PackageCheck size={21} className="text-sage" />
          <p className="mt-3 text-sm font-semibold">Pelacakan</p>
          <p className="mt-1 text-[13px] leading-6 text-ink-soft">
            Nomor pesanan tersedia setelah checkout. Lacak status pembayaran dan
            pengiriman di halaman lacak pesanan.
          </p>
        </div>
      </div>

      <div className="prose-site mt-10">
        <h2>Alur pengiriman</h2>
        <ul>
          <li>Pembayaran diverifikasi otomatis melalui notifikasi Midtrans.</li>
          <li>Pesanan disiapkan dan dikemas dalam 1–2 hari kerja.</li>
          <li>Nomor resi dikirim ke email yang kamu gunakan saat checkout.</li>
          <li>
            Kurir melakukan pengantaran sesuai alamat. Pastikan ada penerima
            atau instruksi khusus pada catatan pesanan.
          </li>
        </ul>

        <h2>Catatan penting</h2>
        <p>
          Pastikan alamat dan nomor telepon benar. Pesanan yang gagal dikirim
          karena alamat tidak lengkap dapat dikenakan biaya pengiriman ulang.
          Untuk perubahan alamat, hubungi kami sebelum pesanan diserahkan ke
          kurir.
        </p>
      </div>
    </InfoPage>
  );
}
