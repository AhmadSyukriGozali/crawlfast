import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, Clock3, PackageSearch, ShoppingBag } from "lucide-react";
import { isOrderNumber } from "@/lib/security/validate";

export const metadata: Metadata = {
  title: "Status Pesanan",
  description: "Status pesanan CRAWLFAST setelah pembayaran.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ order_id?: string | string[] }>;
};

function Fallback() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-sm text-ink-muted">Memuat informasi pesanan...</p>
    </div>
  );
}

async function ResultContent({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params.order_id;

  const orderNumber =
    typeof raw === "string" && isOrderNumber(raw) ? raw : null;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl border border-line bg-white/40 px-6 py-10 text-center sm:px-12 sm:py-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
          {orderNumber ? (
            <Clock3 size={30} className="text-sage" />
          ) : (
            <ShoppingBag size={30} className="text-sage" />
          )}
        </div>

        <p className="eyebrow mt-7">
          {orderNumber ? "Order received" : "CRAWLFAST Store"}
        </p>

        <h1 className="display mt-3 text-3xl sm:text-4xl">
          {orderNumber ? (
            <>
              Terima kasih atas <span className="serif-accent">pesananmu.</span>
            </>
          ) : (
            "Periksa status pesananmu."
          )}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-ink-soft">
          {orderNumber
            ? "Kamu telah kembali dari halaman pembayaran. Status pembayaran diverifikasi melalui notifikasi resmi Midtrans, jadi mungkin butuh beberapa saat untuk diperbarui."
            : "Nomor pesanan tidak ditemukan pada tautan ini. Jika kamu baru saja menyelesaikan pembayaran, simpan bukti transaksi dan hubungi admin toko."}
        </p>

        {orderNumber && (
          <>
            <div className="mt-8 border-y border-line py-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-ink-muted">
                Nomor pesanan
              </p>
              <p className="mt-2 break-all text-sm font-semibold tracking-wide">
                {orderNumber}
              </p>
            </div>

            <div className="mt-6 flex items-start gap-3 bg-sage/5 p-4 text-left">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-sage" />
              <p className="text-xs leading-6 text-ink-soft">
                Simpan nomor pesanan ini. Halaman ini belum memastikan
                pembayaran berhasil — gunakan halaman lacak pesanan dengan email
                yang kamu gunakan saat checkout untuk melihat status terbaru.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {orderNumber ? (
            <Link
              href={`/track?order=${encodeURIComponent(orderNumber)}`}
              className="btn btn-primary"
            >
              <PackageSearch size={15} />
              Lacak pesanan
            </Link>
          ) : (
            <Link href="/track" className="btn btn-primary">
              <PackageSearch size={15} />
              Halaman lacak pesanan
            </Link>
          )}

          <Link href="/products" className="btn btn-secondary">
            Kembali ke toko
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutResultPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <ResultContent searchParams={searchParams} />
    </Suspense>
  );
}
