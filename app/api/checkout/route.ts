
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Menentukan biaya pengiriman tetap dalam rupiah.
const SHIPPING_COST = 15000;

// Menyimpan katalog produk resmi di server agar harga tidak dipercaya dari browser.
const PRODUCTS = {
  1: {
    name: "Essential Boxy Tee",
    price: 189000,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
  },
  2: {
    name: "Utility Overshirt",
    price: 429000,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=85",
  },
  3: {
    name: "Relaxed Straight Pants",
    price: 349000,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=85",
  },
  4: {
    name: "Everyday Knit",
    price: 279000,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=85",
  },
} as const;

// Mengambil tipe ID produk berdasarkan key katalog di atas.
type ProductId = keyof typeof PRODUCTS;

// Menentukan struktur setiap produk yang dikirim dari halaman checkout.
type CheckoutItemInput = {
  productId: number;
  size: string;
  quantity: number;
};

// Menyesuaikan struktur data pelanggan dengan field yang dikirim halaman checkout.
type CheckoutBody = {
  customer: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_province: string;
    shipping_postal_code: string;
    customer_notes?: string;
  };
  items: CheckoutItemInput[];
};

// Membersihkan teks masukan dan membatasi panjangnya.
function cleanText(value: unknown, maxLength = 200): string {
  // Mengembalikan string kosong jika nilai bukan teks.
  if (typeof value !== "string") return "";

  // Menghapus spasi di awal dan akhir lalu membatasi panjang teks.
  return value.trim().slice(0, maxLength);
}

// Memastikan ID produk terdaftar dalam katalog resmi.
function isProductId(value: number): value is ProductId {
  // Memeriksa apakah ID merupakan key yang tersedia di PRODUCTS.
  return Object.prototype.hasOwnProperty.call(PRODUCTS, value);
}

// Menangani permintaan checkout dari halaman pelanggan.
export async function POST(request: Request) {
  try {
    // Membaca data JSON yang dikirim oleh halaman checkout.
    const body = (await request.json()) as CheckoutBody;

    // Mengambil objek pelanggan dan daftar item dari permintaan.
    const customer = body?.customer;
    const items = body?.items;

    // Menolak permintaan jika data pelanggan atau daftar produk tidak tersedia.
    if (!customer || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Data pelanggan dan keranjang wajib diisi." },
        { status: 400 },
      );
    }

    // Membatasi jumlah baris produk dalam satu pesanan.
    if (items.length > 30) {
      return NextResponse.json(
        { error: "Jumlah baris produk terlalu banyak." },
        { status: 400 },
      );
    }

    // Membaca nama pelanggan dari field formulir customer_name.
    const name = cleanText(customer.customer_name, 100);

    // Membaca dan menormalkan email dari field customer_email.
    const email = cleanText(customer.customer_email, 254).toLowerCase();

    // Membaca nomor telepon dari field customer_phone.
    const phone = cleanText(customer.customer_phone, 25);

    // Membaca alamat dari field shipping_address.
    const address = cleanText(customer.shipping_address, 500);

    // Membaca kota atau kabupaten dari field shipping_city.
    const city = cleanText(customer.shipping_city, 100);

    // Membaca provinsi dari field shipping_province.
    const province = cleanText(customer.shipping_province, 100);

    // Membaca kode pos dari field shipping_postal_code.
    const postalCode = cleanText(customer.shipping_postal_code, 10);

    // Membaca catatan opsional dari field customer_notes.
    const notes = cleanText(customer.customer_notes, 500);

    // Memvalidasi data pelanggan dan alamat sebelum membuat pesanan.
    if (
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[0-9+\-\s()]{8,25}$/.test(phone) ||
      !address ||
      !city ||
      !province ||
      !/^[a-zA-Z0-9 -]{3,10}$/.test(postalCode)
    ) {
      return NextResponse.json(
        { error: "Periksa kembali data penerima dan alamat pengiriman." },
        { status: 400 },
      );
    }

    // Menyiapkan subtotal awal sebelum menjumlahkan produk.
    let subtotal = 0;

    // Menampung item yang sudah divalidasi untuk disimpan ke database.
    const normalizedItems: {
      product_id: ProductId;
      product_name: string;
      product_image: string;
      size: string;
      unit_price: number;
      quantity: number;
    }[] = [];

    // Memvalidasi setiap produk dan menghitung harga berdasarkan katalog server.
    for (const item of items) {
      // Mengubah ID produk menjadi angka untuk proses validasi.
      const productId = Number(item?.productId);

      // Membersihkan teks ukuran produk.
      const size = cleanText(item?.size, 5);

      // Mengubah jumlah produk menjadi angka.
      const quantity = Number(item?.quantity);

      // Menolak ID, ukuran, atau jumlah produk yang tidak valid.
      if (
        !Number.isInteger(productId) ||
        !isProductId(productId) ||
        !["S", "M", "L", "XL"].includes(size) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        return NextResponse.json(
          { error: "Ada produk, ukuran, atau jumlah yang tidak valid." },
          { status: 400 },
        );
      }

      // Mengambil nama, harga, dan gambar dari katalog server.
      const product = PRODUCTS[productId];

      // Menghitung total harga untuk baris produk saat ini.
      const lineTotal = product.price * quantity;

      // Menambahkan harga produk ke subtotal pesanan.
      subtotal += lineTotal;

      // Menyimpan data produk yang sudah dinormalisasi.
      normalizedItems.push({
        product_id: productId,
        product_name: product.name,
        product_image: product.image,
        size,
        unit_price: product.price,
        quantity,
      });
    }

    // Menghitung total pesanan termasuk biaya pengiriman.
    const totalAmount = subtotal + SHIPPING_COST;

    // Membuat nomor pesanan unik untuk identifikasi transaksi.
    const orderNumber = `CF-${Date.now()}-${randomBytes(4).toString("hex")}`;

    // Membaca kunci server Midtrans dari environment server.
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Memilih mode production hanya jika variabelnya bernilai "true".
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    // Menghentikan checkout jika konfigurasi pembayaran belum tersedia.
    if (!serverKey) {
      return NextResponse.json(
        { error: "Konfigurasi pembayaran di server belum lengkap." },
        { status: 500 },
      );
    }

    // Membuat klien Supabase dengan akses server.
    const supabase = createAdminClient();

    // Menyimpan data utama pesanan ke tabel orders.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        shipping_city: city,
        shipping_province: province,
        shipping_postal_code: postalCode,
        customer_notes: notes || null,
        subtotal,
        shipping_cost: SHIPPING_COST,
        total_amount: totalAmount,
        currency: "IDR",
        order_status: "pending_payment",
        payment_status: "pending",
        payment_gateway: "midtrans",
      })
      .select("id, order_number")
      .single();

    // Mengembalikan pesan kesalahan jika pesanan gagal disimpan.
    if (orderError || !order) {
      console.error("Failed to create order:", orderError?.message);

      return NextResponse.json(
        { error: "Pesanan belum bisa disimpan. Silakan coba lagi." },
        { status: 500 },
      );
    }

    // Menyimpan seluruh rincian produk ke tabel order_items.
    const { error: itemsError } = await supabase.from("order_items").insert(
      normalizedItems.map((item) => ({
        ...item,
        order_id: order.id,
      })),
    );

    // Membatalkan pesanan jika rincian produk gagal disimpan.
    if (itemsError) {
      console.error("Failed to save order items:", itemsError.message);

      await supabase
        .from("orders")
        .update({
          order_status: "cancelled",
          payment_status: "failure",
        })
        .eq("id", order.id);

      return NextResponse.json(
        { error: "Detail produk pesanan gagal disimpan." },
        { status: 500 },
      );
    }

    // Menyusun detail item dengan format yang diperlukan oleh Midtrans.
    const itemDetails: {
      id: string;
      price: number;
      quantity: number;
      name: string;
    }[] = normalizedItems.map((item) => ({
      id: String(item.product_id),
      price: item.unit_price,
      quantity: item.quantity,
      name: item.product_name,
    }));

    // Menambahkan ongkos kirim sebagai item transaksi Midtrans.
    itemDetails.push({
      id: "shipping",
      price: SHIPPING_COST,
      quantity: 1,
      name: "Ongkos Kirim",
    });

    // Menentukan endpoint Snap berdasarkan mode sandbox atau production.
    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Meminta Midtrans membuat transaksi pembayaran.
    const paymentResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: order.order_number,
          gross_amount: totalAmount,
        },
        item_details: itemDetails,
        customer_details: {
          first_name: name,
          email,
          phone,
          billing_address: {
            first_name: name,
            address,
            city,
            postal_code: postalCode,
            country_code: "IDN",
          },
          shipping_address: {
            first_name: name,
            address,
            city,
            postal_code: postalCode,
            country_code: "IDN",
          },
        },
        callbacks: {
          finish: `${new URL(request.url).origin}/checkout/result?order_id=${encodeURIComponent(order.order_number)}`,
        },
      }),
      cache: "no-store",
    });

    // Membaca respons Midtrans, termasuk saat respons bukan JSON yang valid.
    const paymentData = await paymentResponse.json().catch(() => null);

    // Memastikan Midtrans berhasil membuat token dan URL pembayaran.
    if (
      !paymentResponse.ok ||
      typeof paymentData?.token !== "string" ||
      typeof paymentData?.redirect_url !== "string"
    ) {
      // Mencatat status respons tanpa membocorkan kunci pembayaran.
      console.error("Midtrans transaction creation failed:", {
        status: paymentResponse.status,
      });

      // Menandai pesanan sebagai gagal jika transaksi tidak dapat dibuat.
      await supabase
        .from("orders")
        .update({
          order_status: "cancelled",
          payment_status: "failure",
        })
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "Pesanan tersimpan, tetapi halaman pembayaran gagal dibuat. Silakan coba lagi.",
          orderNumber: order.order_number,
        },
        { status: 502 },
      );
    }

    // Menyimpan token Snap dan URL pembayaran pada pesanan.
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        snap_token: paymentData.token,
        snap_redirect_url: paymentData.redirect_url,
        payment_reference: order.order_number,
      })
      .eq("id", order.id);

    // Memberi tahu pelanggan jika data pembayaran gagal diperbarui.
    if (updateError) {
      console.error("Failed to save payment reference:", updateError.message);

      return NextResponse.json(
        {
          error:
            "Transaksi pembayaran telah dibuat, tetapi status pesanan perlu diperiksa oleh admin.",
          orderNumber: order.order_number,
        },
        { status: 500 },
      );
    }

    // Mengembalikan nomor pesanan dan URL pembayaran kepada browser.
    return NextResponse.json({
      orderNumber: order.order_number,
      redirectUrl: paymentData.redirect_url,
    });
  } catch (error) {
    // Mencatat kesalahan server untuk pemeriksaan tanpa menampilkan detail sensitif.
    console.error(
      "Checkout error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    // Mengirim pesan umum jika terjadi kesalahan yang tidak tertangani.
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses checkout." },
      { status: 500 },
    );
  }
}
