
"use client";

// Mengimpor hook React untuk menghitung nilai, menyimpan state, dan membaca data eksternal.
import {
  useMemo,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from "react";

// Mengimpor komponen gambar Next.js.
import Image from "next/image";

// Mengimpor komponen navigasi Next.js.
import Link from "next/link";

// Mengimpor ikon yang digunakan pada halaman checkout.
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";

// Mendefinisikan struktur data satu produk di keranjang.
type CartItem = {
  productId: number;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};

// Mendefinisikan struktur data formulir checkout.
type CheckoutForm = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  customer_notes: string;
};

// Menentukan nama key localStorage untuk menyimpan keranjang.
const CART_KEY = "crawlfast-cart";

// Menentukan estimasi ongkos kirim dalam rupiah.
const SHIPPING_COST = 15000;

// Menyediakan array kosong yang stabil untuk snapshot keranjang kosong.
const EMPTY_CART: CartItem[] = [];

// Menyimpan teks localStorage terakhir yang sudah dibaca.
let cachedCartRaw: string | null | undefined = undefined;

// Menyimpan hasil parsing keranjang agar getSnapshot mengembalikan referensi yang stabil.
let cachedCartSnapshot: CartItem[] = EMPTY_CART;

// Menyediakan nilai awal seluruh kolom formulir checkout.
const initialForm: CheckoutForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  shipping_address: "",
  shipping_city: "",
  shipping_province: "",
  shipping_postal_code: "",
  customer_notes: "",
};

// Memeriksa apakah sebuah nilai memiliki struktur CartItem yang valid.
function isCartItem(item: unknown): item is CartItem {
  // Menolak nilai null dan nilai yang bukan objek.
  if (item === null || typeof item !== "object") {
    return false;
  }

  // Memastikan semua properti memiliki tipe data yang sesuai.
  return (
    "productId" in item &&
    typeof item.productId === "number" &&
    "name" in item &&
    typeof item.name === "string" &&
    "price" in item &&
    typeof item.price === "string" &&
    "image" in item &&
    typeof item.image === "string" &&
    "size" in item &&
    typeof item.size === "string" &&
    "quantity" in item &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

// Membaca keranjang dari localStorage dan menyimpan hasilnya di cache.
function getCartSnapshot(): CartItem[] {
  // Mengembalikan keranjang kosong saat fungsi dijalankan di server.
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    // Membaca data keranjang yang tersimpan di browser.
    const stored = window.localStorage.getItem(CART_KEY);

    // Menggunakan hasil cache jika data belum berubah.
    if (stored === cachedCartRaw) {
      return cachedCartSnapshot;
    }

    // Memperbarui cache teks setelah data berubah.
    cachedCartRaw = stored;

    // Mengurai JSON atau menggunakan array kosong jika data belum tersedia.
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    // Mengembalikan array kosong jika data bukan array.
    if (!Array.isArray(parsed)) {
      cachedCartSnapshot = EMPTY_CART;
      return cachedCartSnapshot;
    }

    // Menyimpan hanya item keranjang dengan struktur yang valid.
    cachedCartSnapshot = parsed.filter(isCartItem);

    // Mengembalikan snapshot terbaru yang sudah divalidasi.
    return cachedCartSnapshot;
  } catch {
    // Mengembalikan array kosong jika localStorage atau JSON bermasalah.
    return EMPTY_CART;
  }
}

// Menyediakan snapshot khusus server untuk mencegah hydration mismatch.
function getServerCartSnapshot(): CartItem[] {
  // Server dan render awal hydration menggunakan array kosong yang sama.
  return EMPTY_CART;
}

// Mendaftarkan listener untuk perubahan keranjang di tab ini maupun tab lain.
function subscribeToCart(callback: () => void): () => void {
  // Memastikan listener hanya didaftarkan di browser.
  if (typeof window === "undefined") {
    return () => {};
  }

  // Memanggil callback saat menerima perubahan keranjang dari aplikasi.
  const handleCartUpdate = () => {
    callback();
  };

  // Memantau perubahan localStorage dari tab browser lain.
  const handleStorageUpdate = (event: StorageEvent) => {
    // Memperbarui tampilan hanya jika key keranjang berubah atau storage dibersihkan.
    if (event.key === CART_KEY || event.key === null) {
      callback();
    }
  };

  // Mendengarkan event khusus yang digunakan oleh halaman keranjang.
  window.addEventListener("crawlfast-cart-updated", handleCartUpdate);

  // Mendengarkan event perubahan storage dari tab lain.
  window.addEventListener("storage", handleStorageUpdate);

  // Menghapus listener saat komponen tidak lagi berlangganan.
  return () => {
    window.removeEventListener("crawlfast-cart-updated", handleCartUpdate);
    window.removeEventListener("storage", handleStorageUpdate);
  };
}

// Mengubah teks harga menjadi angka rupiah.
function parsePrice(price: string): number {
  // Menghapus karakter selain angka dan mengembalikan nol jika hasilnya tidak valid.
  return Number(price.replace(/\D/g, "")) || 0;
}

// Memformat angka menjadi mata uang rupiah Indonesia.
function formatRupiah(amount: number): string {
  // Menggunakan formatter bawaan JavaScript untuk format IDR.
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Merender halaman checkout dan mengelola formulir serta proses pembayaran.
export default function CheckoutPage() {
  // Membaca keranjang menggunakan external store agar aman untuk SSR dan hydration.
  const cart = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );

  // Menyimpan data formulir pelanggan dan alamat pengiriman.
  const [form, setForm] = useState<CheckoutForm>(initialForm);

  // Menyimpan pesan kesalahan yang akan ditampilkan kepada pengguna.
  const [error, setError] = useState("");

  // Menandai apakah permintaan checkout sedang diproses.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Menghitung subtotal seluruh item dan menggunakan ulang hasilnya saat keranjang tidak berubah.
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + parsePrice(item.price) * item.quantity,
        0,
      ),
    [cart],
  );

  // Menghitung total sementara dengan menambahkan estimasi ongkos kirim.
  const total = subtotal + SHIPPING_COST;

  // Memperbarui satu kolom formulir tanpa mengubah kolom lainnya.
  function updateField(field: keyof CheckoutForm, value: string): void {
    // Menggunakan state sebelumnya agar perubahan kolom tetap konsisten.
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Memvalidasi dan mengirim pesanan ke endpoint checkout di server.
  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    // Mencegah browser memuat ulang halaman saat formulir dikirim.
    event.preventDefault();

    // Menghapus pesan kesalahan dari percobaan sebelumnya.
    setError("");

    // Menolak checkout jika tidak ada produk di keranjang.
    if (cart.length === 0) {
      setError("Keranjang kamu kosong. Tambahkan produk sebelum checkout.");
      return;
    }

    // Mengunci tombol agar pesanan tidak dikirim berulang kali.
    setIsSubmitting(true);

    try {
      // Mengirim informasi pelanggan dan item keranjang ke server.
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: form,
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });

      // Membaca respons server yang berisi pesan kesalahan atau URL pembayaran.
      const result: {
        error?: string;
        redirectUrl?: string;
        orderNumber?: string;
      } = await response.json();

      // Menampilkan pesan server jika pembuatan pesanan gagal.
      if (!response.ok) {
        throw new Error(
          result.error || "Pesanan belum dapat diproses. Coba lagi.",
        );
      }

      // Memastikan server mengembalikan tautan pembayaran.
      if (!result.redirectUrl) {
        throw new Error(
          "Pesanan berhasil diproses, tetapi tautan pembayaran belum tersedia. Hubungi admin toko dengan nomor pesanan jika ditampilkan.",
        );
      }

      // Mengarahkan pelanggan ke halaman pembayaran yang diberikan server.
      window.location.assign(result.redirectUrl);
    } catch (submitError) {
      // Menampilkan pesan yang sesuai jika pengiriman pesanan gagal.
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan. Periksa koneksi lalu coba lagi.",
      );

      // Mengaktifkan kembali tombol agar pelanggan dapat mencoba lagi.
      setIsSubmitting(false);
    }
  }

  // Menentukan kelas CSS yang dipakai oleh input dan textarea.
  const inputClass =
    "mt-2 min-h-12 w-full border border-[#20211f]/20 bg-white/60 px-4 text-sm outline-none transition focus:border-[#59634b] focus:ring-1 focus:ring-[#59634b]";

  // Menentukan kelas CSS untuk label formulir.
  const labelClass = "block text-xs font-medium text-[#41413b]";

  // Merender keseluruhan halaman checkout.
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20211f]">
      {/* Menampilkan pesan promosi di bagian paling atas halaman. */}
      <div className="flex min-h-9 items-center justify-center bg-[#20211f] px-4 text-center text-[10px] tracking-[0.16em] text-white sm:text-[11px]">
        EVERYDAY ESSENTIALS, MADE TO LAST.
      </div>

      {/* Menampilkan header dan navigasi utama toko. */}
      <header className="border-b border-[#20211f]/10">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-[21px] font-black tracking-[-0.08em] sm:text-[25px]"
          >
            CRAWLFAST<span className="text-[#59634b]">.</span>
          </Link>

          <span className="text-[10px] font-medium tracking-[0.12em] text-[#77776f]">
            CHECKOUT
          </span>
        </div>
      </header>

      {/* Menampung judul halaman, formulir pelanggan, dan ringkasan pesanan. */}
      <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-9 sm:px-8 sm:pt-12 lg:px-12">
        {/* Menyediakan tautan kembali ke halaman keranjang. */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs text-[#66665e] transition-colors hover:text-[#59634b]"
        >
          <ArrowLeft size={16} />
          Kembali ke keranjang
        </Link>

        {/* Menampilkan judul dan penjelasan proses checkout. */}
        <div className="mb-9 mt-6 border-b border-[#20211f]/15 pb-6">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
            ALMOST YOURS
          </p>
          <h1 className="text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#77776f]">
            Lengkapi informasi pengiriman. Setelah pesanan diproses, kamu akan
            diarahkan ke halaman pembayaran.
          </p>
        </div>

        {/* Menampilkan pesan kosong atau formulir berdasarkan isi keranjang. */}
        {cart.length === 0 ? (
          <div className="border border-dashed border-[#20211f]/20 px-5 py-16 text-center">
            <h2 className="text-xl font-medium">
              Keranjangmu masih kosong
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#77776f]">
              Tambahkan produk terlebih dahulu sebelum melanjutkan checkout.
            </p>
            <Link
              href="/#collection"
              className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#20211f] px-6 text-[10px] font-semibold tracking-[0.13em] text-white transition-colors hover:bg-[#59634b]"
            >
              MULAI BELANJA
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14"
          >
            {/* Mengelompokkan formulir pelanggan, alamat, dan pesan kesalahan. */}
            <div className="space-y-9">
              {/* Bagian informasi pelanggan. */}
              <section>
                <div className="mb-5 border-b border-[#20211f]/15 pb-3">
                  <h2 className="text-lg font-medium">
                    Informasi pelanggan
                  </h2>
                  <p className="mt-1 text-xs text-[#77776f]">
                    Informasi ini digunakan untuk menghubungi kamu mengenai
                    pesanan.
                  </p>
                </div>

                {/* Mengumpulkan nama, email, dan nomor telepon pelanggan. */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    Nama lengkap *
                    <input
                      className={inputClass}
                      name="customer_name"
                      autoComplete="name"
                      value={form.customer_name}
                      onChange={(event) =>
                        updateField("customer_name", event.target.value)
                      }
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Nama penerima"
                    />
                  </label>

                  <label className={labelClass}>
                    Email *
                    <input
                      className={inputClass}
                      type="email"
                      name="customer_email"
                      autoComplete="email"
                      value={form.customer_email}
                      onChange={(event) =>
                        updateField("customer_email", event.target.value)
                      }
                      required
                      maxLength={254}
                      placeholder="nama@email.com"
                    />
                  </label>

                  <label className={`${labelClass} sm:col-span-2`}>
                    Nomor telepon *
                    <input
                      className={inputClass}
                      type="tel"
                      name="customer_phone"
                      autoComplete="tel"
                      value={form.customer_phone}
                      onChange={(event) =>
                        updateField("customer_phone", event.target.value)
                      }
                      required
                      minLength={8}
                      maxLength={20}
                      pattern="[0-9+() .-]{8,20}"
                      placeholder="Contoh: 081234567890"
                    />
                  </label>
                </div>
              </section>

              {/* Bagian alamat pengiriman dan catatan pesanan. */}
              <section>
                <div className="mb-5 border-b border-[#20211f]/15 pb-3">
                  <h2 className="text-lg font-medium">
                    Alamat pengiriman
                  </h2>
                  <p className="mt-1 text-xs text-[#77776f]">
                    Pastikan alamat lengkap agar pesanan mudah dikirim.
                  </p>
                </div>

                {/* Mengumpulkan alamat jalan, kota, provinsi, kode pos, dan catatan. */}
                <div className="space-y-5">
                  <label className={labelClass}>
                    Alamat lengkap *
                    <textarea
                      className={`${inputClass} min-h-28 resize-y py-3`}
                      name="shipping_address"
                      autoComplete="street-address"
                      value={form.shipping_address}
                      onChange={(event) =>
                        updateField("shipping_address", event.target.value)
                      }
                      required
                      minLength={8}
                      maxLength={500}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <label className={labelClass}>
                      Kota / kabupaten *
                      <input
                        className={inputClass}
                        name="shipping_city"
                        autoComplete="address-level2"
                        value={form.shipping_city}
                        onChange={(event) =>
                          updateField("shipping_city", event.target.value)
                        }
                        required
                        maxLength={100}
                        placeholder="Nama kota"
                      />
                    </label>

                    <label className={labelClass}>
                      Provinsi *
                      <input
                        className={inputClass}
                        name="shipping_province"
                        autoComplete="address-level1"
                        value={form.shipping_province}
                        onChange={(event) =>
                          updateField("shipping_province", event.target.value)
                        }
                        required
                        maxLength={100}
                        placeholder="Nama provinsi"
                      />
                    </label>

                    <label className={labelClass}>
                      Kode pos *
                      <input
                        className={inputClass}
                        name="shipping_postal_code"
                        autoComplete="postal-code"
                        value={form.shipping_postal_code}
                        onChange={(event) =>
                          updateField("shipping_postal_code", event.target.value)
                        }
                        required
                        inputMode="numeric"
                        pattern="[0-9]{5}"
                        maxLength={5}
                        placeholder="12345"
                      />
                    </label>
                  </div>

                  <label className={labelClass}>
                    Catatan pesanan (opsional)
                    <textarea
                      className={`${inputClass} min-h-24 resize-y py-3`}
                      name="customer_notes"
                      value={form.customer_notes}
                      onChange={(event) =>
                        updateField("customer_notes", event.target.value)
                      }
                      maxLength={1000}
                      placeholder="Petunjuk pengiriman atau catatan tambahan"
                    />
                  </label>
                </div>
              </section>

              {/* Menampilkan pesan kesalahan jika proses checkout gagal. */}
              {error && (
                <p
                  role="alert"
                  className="border border-red-900/20 bg-red-50 p-4 text-sm leading-6 text-red-800"
                >
                  {error}
                </p>
              )}

              {/* Menjelaskan bahwa pembayaran diproses melalui Midtrans. */}
              <div className="flex items-start gap-3 border border-[#20211f]/10 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-[#59634b]"
                />
                <p className="text-xs leading-5 text-[#77776f]">
                  Pembayaran akan diproses melalui Midtrans jika konfigurasi
                  server sudah lengkap. Periksa kembali informasi sebelum
                  melanjutkan.
                </p>
              </div>
            </div>

            {/* Menampilkan ringkasan produk dan total di sisi formulir. */}
            <aside className="border border-[#20211f]/15 p-5 sm:p-7 lg:sticky lg:top-8">
              <h2 className="text-lg font-medium tracking-tight">
                Ringkasan pesanan
              </h2>

              {/* Menampilkan setiap produk yang akan dibeli. */}
              <div className="mt-5 divide-y divide-[#20211f]/10 border-y border-[#20211f]/10">
                {cart.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.size}-${index}`}
                    className="flex gap-3 py-4"
                  >
                    {/* Menampilkan gambar produk dan jumlah barang. */}
                    <div className="relative aspect-[4/5] w-[68px] shrink-0 overflow-hidden bg-[#e8e5dc]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="68px"
                        className="object-cover"
                      />
                      <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center bg-[#20211f] px-1 text-[10px] text-white">
                        {item.quantity}
                      </span>
                    </div>

                    {/* Menampilkan nama, ukuran, dan harga item. */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-5">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[10px] text-[#77776f]">
                        Ukuran: {item.size}
                      </p>
                      <p className="mt-2 text-xs font-semibold">
                        {formatRupiah(
                          parsePrice(item.price) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Menampilkan subtotal dan estimasi ongkos kirim. */}
              <div className="mt-5 space-y-4 border-b border-[#20211f]/15 pb-5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#77776f]">Subtotal</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#77776f]">Estimasi pengiriman</span>
                  <span className="font-medium">
                    {formatRupiah(SHIPPING_COST)}
                  </span>
                </div>
              </div>

              {/* Menampilkan total sementara sebelum validasi server. */}
              <div className="flex items-center justify-between gap-3 py-5">
                <span className="text-sm font-semibold">Total sementara</span>
                <span className="text-lg font-semibold tracking-tight">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* Mengirim formulir dan menampilkan status proses pembayaran. */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="flex min-h-14 w-full items-center justify-center gap-2 bg-[#20211f] px-4 text-center text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:bg-[#59634b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    MEMPROSES PESANAN...
                  </>
                ) : (
                  "LANJUTKAN KE PEMBAYARAN"
                )}
              </button>

              {/* Memberi tahu pelanggan bahwa ongkir masih berupa estimasi. */}
              <p className="mt-4 text-center text-[10px] leading-5 text-[#77776f]">
                Ongkir merupakan estimasi tetap. Total akhir mengikuti
                perhitungan server sebelum pembayaran.
              </p>
            </aside>
          </form>
        )}
      </section>

      {/* Menampilkan footer toko. */}
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
