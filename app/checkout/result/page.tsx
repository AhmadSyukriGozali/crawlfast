
import Link from "next/link";
import { Suspense } from "react";
import {
  CheckCircle2,
  Clock3,
  ShoppingBag,
} from "lucide-react";

type CheckoutResultContentProps = {
  searchParams: Promise<{
    order_id?: string | string[];
  }>;
};

function CheckoutResultFallback() {
  return (
    <section className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl border border-[#20211f]/15 bg-white/40 px-6 py-10 text-center sm:px-12 sm:py-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#59634b]/10">
          <Clock3 size={30} className="text-[#59634b]" />
        </div>
        <p className="mt-7 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
          CRAWLFAST STORE
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
          Memuat informasi pesanan...
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#77776f]">
          Mohon tunggu sebentar.
        </p>
      </div>
    </section>
  );
}

async function CheckoutResultContent({
  searchParams,
}: CheckoutResultContentProps) {
  const params = await searchParams;
  const rawOrderId = params.order_id;

  const orderNumber =
    typeof rawOrderId === "string" &&
    /^CF-[a-zA-Z0-9-]{1,100}$/.test(rawOrderId)
      ? rawOrderId
      : null;

  return (
    <section className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl border border-[#20211f]/15 bg-white/40 px-6 py-10 text-center sm:px-12 sm:py-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#59634b]/10">
          {orderNumber ? (
            <Clock3 size={30} className="text-[#59634b]" />
          ) : (
            <ShoppingBag size={30} className="text-[#59634b]" />
          )}
        </div>

        <p className="mt-7 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
          {orderNumber ? "ORDER RECEIVED" : "CRAWLFAST STORE"}
        </p>

        <h1 className="mt-3 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
          {orderNumber
            ? "Terima kasih atas pesananmu."
            : "Periksa status pesananmu."}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#77776f]">
          {orderNumber
            ? "Kamu telah kembali dari halaman pembayaran. Status pembayaran perlu diverifikasi melalui sistem sebelum pesanan dapat dipastikan berhasil."
            : "Nomor pesanan tidak ditemukan pada tautan ini. Jika kamu baru saja menyelesaikan pembayaran, simpan bukti transaksi dan hubungi admin toko untuk bantuan."}
        </p>

        {orderNumber && (
          <div className="mt-8 border-y border-[#20211f]/10 py-5">
            <p className="text-[10px] tracking-[0.15em] text-[#77776f]">
              NOMOR PESANAN
            </p>
            <p className="mt-2 break-all text-sm font-semibold tracking-wide">
              {orderNumber}
            </p>
          </div>
        )}

        {orderNumber && (
          <div className="mt-6 flex items-start gap-3 bg-[#59634b]/5 p-4 text-left">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-[#59634b]"
            />
            <p className="text-xs leading-6 text-[#66665e]">
              Simpan nomor pesanan ini sebagai referensi. Halaman
              ini belum memastikan pembayaran berhasil. Jangan
              melakukan pembayaran ulang hanya berdasarkan halaman
              ini; periksa status transaksi terlebih dahulu.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center bg-[#20211f] px-6 text-[10px] font-semibold tracking-[0.13em] text-white transition-colors hover:bg-[#59634b]"
          >
            KEMBALI KE TOKO
          </Link>

          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center border border-[#20211f]/20 px-6 text-[10px] font-semibold tracking-[0.13em] transition-colors hover:border-[#59634b] hover:text-[#59634b]"
          >
            LIHAT KERANJANG
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutResultPage({
  searchParams,
}: CheckoutResultContentProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f5f3ee] text-[#20211f]">
      <div className="flex min-h-9 items-center justify-center bg-[#20211f] px-4 text-center text-[10px] tracking-[0.16em] text-white sm:text-[11px]">
        EVERYDAY ESSENTIALS, MADE TO LAST.
      </div>

      <header className="border-b border-[#20211f]/10">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-[21px] font-black tracking-[-0.08em] sm:text-[25px]"
          >
            CRAWLFAST<span className="text-[#59634b]">.</span>
          </Link>
        </div>
      </header>

      <Suspense fallback={<CheckoutResultFallback />}>
        <CheckoutResultContent searchParams={searchParams} />
      </Suspense>

      <footer className="bg-[#20211f] px-5 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="text-xl font-black tracking-[-0.08em]"
          >
            CRAWLFAST<span className="text-[#aab19a]">.</span>
          </Link>

          <p className="text-[10px] text-white/50">
            Everyday essentials. Uncomplicated style.
          </p>
        </div>
      </footer>
    </main>
  );
}
