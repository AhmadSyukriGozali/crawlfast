import type { Metadata } from "next";
import { Ruler } from "lucide-react";
import InfoPage from "@/components/store/InfoPage";

export const metadata: Metadata = {
  title: "Panduan Ukuran",
  description:
    "Tabel ukuran CRAWLFAST untuk kaos, outerwear, dan bottoms agar kamu memilih ukuran yang tepat.",
  alternates: { canonical: "/size-guide" },
};

const TOPS = [
  ["S", "96–100", "66", "58", "44"],
  ["M", "100–104", "68", "60", "45"],
  ["L", "104–110", "70", "62", "46"],
  ["XL", "110–116", "72", "64", "47"],
];

const BOTTOMS = [
  ["S", "76–80", "96", "28", "98"],
  ["M", "80–86", "102", "30", "100"],
  ["L", "86–92", "108", "32", "102"],
  ["XL", "92–100", "114", "34", "104"],
];

function SizeTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Ruler size={17} className="text-sage" />
        {title}
      </h2>

      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-cream-deep text-[10px] uppercase tracking-[0.08em] text-ink-soft">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${index}`}
                    className={`px-4 py-3 ${index === 0 ? "font-semibold" : "text-ink-soft"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Size guide"
      title="Temukan ukuran"
      accent="yang tepat."
      description="Ukur pakaian favoritmu yang sudah pas, lalu bandingkan dengan tabel di bawah. Semua ukuran dalam sentimeter."
    >
      <div className="space-y-10">
        <SizeTable
          title="Kaos, knitwear & shirts (unisex)"
          headers={["Ukuran", "Lingkar dada", "Panjang badan", "Lebar bahu", "Panjang lengan"]}
          rows={TOPS}
        />

        <SizeTable
          title="Bottoms"
          headers={["Ukuran", "Lingkar pinggang", "Lingkar pinggul", "Inseam", "Panjang total"]}
          rows={BOTTOMS}
        />

        <p className="max-w-xl text-xs leading-6 text-ink-muted">
          Aksesori seperti beanie menggunakan satu ukuran (All Size) dan
          dirancang nyaman untuk lingkar kepala 54–60 cm. Untuk produk lain yang
          memiliki beberapa ukuran, gunakan tabel di atas sebagai acuan.
        </p>
      </div>

      <div className="prose-site mt-10">
        <h2>Cara mengukur</h2>
        <ul>
          <li>
            <strong>Lingkar dada:</strong> ukur melingkar pada bagian terlebar
            dada, dengan pita tidak terlalu ketat.
          </li>
          <li>
            <strong>Panjang badan:</strong> ukur dari titik bahu tertinggi
            sampai ujung bawah pakaian.
          </li>
          <li>
            <strong>Lingkar pinggang:</strong> ukur pada bagian pinggang alami,
            biasanya di atas tulang panggul.
          </li>
          <li>
            <strong>Inseam:</strong> ukur dari bagian dalam celana hingga ujung
            kaki.
          </li>
        </ul>

        <h2>Jika di antara dua ukuran</h2>
        <p>
          Untuk siluet boxy dan relaxed, pilih ukuran yang lebih kecil jika kamu
          menyukai fit yang lebih rapi. Untuk tampilan oversize, pilih ukuran
          lebih besar. Masih ragu? Hubungi kami dengan tinggi dan berat badan
          kamu untuk rekomendasi.
        </p>
      </div>
    </InfoPage>
  );
}
