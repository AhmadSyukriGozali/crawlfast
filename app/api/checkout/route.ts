import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isProductSize } from "@/lib/catalog";
import { getCheckoutProducts } from "@/lib/products/data";
import { calculateDiscount } from "@/lib/discounts/calculate";
import {
  claimDiscountUsage,
  getDiscountByCode,
  isMissingDiscountsTable,
  releaseDiscountUsage,
} from "@/lib/discounts/data";
import {
  DISCOUNT_CODE_PATTERN,
  type Discount,
} from "@/lib/discounts/constants";
import { normalizeDiscountCode } from "@/lib/discounts/validation";
import { calculateShipping, calculateTotal } from "@/lib/shipping";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { isSameOrigin, readJsonBody } from "@/lib/security/request";
import {
  cleanText,
  isEmail,
  isPhone,
  isPostalCode,
} from "@/lib/security/validate";

const MAX_ITEMS = 30;
const MAX_QUANTITY = 20;

type CheckoutItemInput = {
  productId?: unknown;
  size?: unknown;
  quantity?: unknown;
};

type CheckoutBody = {
  customer?: {
    customer_name?: unknown;
    customer_email?: unknown;
    customer_phone?: unknown;
    shipping_address?: unknown;
    shipping_city?: unknown;
    shipping_province?: unknown;
    shipping_postal_code?: unknown;
    customer_notes?: unknown;
    company?: unknown;
  };
  items?: unknown;
  discountCode?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function resolveSiteOrigin(request: Request): string {
  const configured = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.hostname === "localhost") {
        return url.origin;
      }
    } catch {
      // Abaikan nilai yang tidak valid dan gunakan origin request.
    }
  }

  return new URL(request.url).origin;
}

function isSafeMidtransRedirect(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "midtrans.com" || url.hostname.endsWith(".midtrans.com"))
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Permintaan tidak diizinkan.", 403);
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`checkout:${ip}`, 8, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const bodyResult = await readJsonBody(request, 64 * 1024);

  if (!bodyResult.ok) {
    return jsonError(bodyResult.error, bodyResult.status);
  }

  try {
    const body = bodyResult.data as CheckoutBody;
    const customer = body?.customer;
    const rawItems = body?.items;

    if (!customer || !Array.isArray(rawItems) || rawItems.length === 0) {
      return jsonError("Data pelanggan dan keranjang wajib diisi.", 400);
    }

    if (rawItems.length > MAX_ITEMS) {
      return jsonError("Jumlah baris produk terlalu banyak.", 400);
    }

    // Honeypot: form tersembunyi yang hanya diisi bot.
    if (cleanText(customer.company, 100)) {
      return jsonError("Permintaan tidak dapat diproses.", 400);
    }

    const name = cleanText(customer.customer_name, 100);
    const email = cleanText(customer.customer_email, 254).toLowerCase();
    const phone = cleanText(customer.customer_phone, 25);
    const address = cleanText(customer.shipping_address, 500);
    const city = cleanText(customer.shipping_city, 100);
    const province = cleanText(customer.shipping_province, 100);
    const postalCode = cleanText(customer.shipping_postal_code, 10);
    const notes = cleanText(customer.customer_notes, 500);

    if (
      name.length < 2 ||
      !isEmail(email) ||
      !isPhone(phone) ||
      address.length < 8 ||
      city.length < 2 ||
      province.length < 2 ||
      !isPostalCode(postalCode)
    ) {
      return jsonError(
        "Periksa kembali data penerima dan alamat pengiriman.",
        400,
      );
    }

    const seenItems = new Set<string>();
    const parsedItems: {
      productId: number;
      size: string;
      quantity: number;
    }[] = [];

    for (const rawItem of rawItems as CheckoutItemInput[]) {
      const productId = Number(rawItem?.productId);
      const size = cleanText(rawItem?.size, 20);
      const quantity = Number(rawItem?.quantity);
      const itemKey = `${productId}:${size}`;

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !isProductSize(size) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QUANTITY ||
        seenItems.has(itemKey)
      ) {
        return jsonError(
          "Ada produk, ukuran, atau jumlah yang tidak valid.",
          400,
        );
      }

      seenItems.add(itemKey);
      parsedItems.push({ productId, size, quantity });
    }

    const productMap = await getCheckoutProducts(
      parsedItems.map((item) => item.productId),
    );

    let subtotal = 0;
    const normalizedItems: {
      product_id: number;
      product_name: string;
      product_image: string;
      size: string;
      unit_price: number;
      quantity: number;
    }[] = [];

    for (const item of parsedItems) {
      const product = productMap.get(item.productId);

      if (
        !product ||
        product.isActive === false ||
        !product.sizes.includes(item.size)
      ) {
        return jsonError(
          "Produk atau ukuran sudah tidak tersedia. Perbarui keranjang.",
          400,
        );
      }

      subtotal += product.price * item.quantity;

      normalizedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        size: item.size,
        unit_price: product.price,
        quantity: item.quantity,
      });
    }

    const rawDiscountCode = cleanText(body?.discountCode, 32);
    const discountCode = rawDiscountCode
      ? normalizeDiscountCode(rawDiscountCode)
      : "";

    let appliedDiscount: Discount | null = null;
    let discountAmount = 0;

    if (discountCode) {
      if (!DISCOUNT_CODE_PATTERN.test(discountCode)) {
        return jsonError("Format kode diskon tidak valid.", 400);
      }

      let discount: Discount | undefined;

      try {
        discount = await getDiscountByCode(discountCode);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          isMissingDiscountsTable(
            error as { code?: string; message?: string },
          )
        ) {
          return jsonError("Layanan diskon belum tersedia.", 503);
        }

        throw error;
      }

      if (!discount) {
        return jsonError(
          "Kode diskon tidak ditemukan atau tidak berlaku.",
          400,
        );
      }

      const discountResult = calculateDiscount(discount, subtotal);

      if (!discountResult.ok) {
        return jsonError(discountResult.error, 400);
      }

      appliedDiscount = discount;
      discountAmount = discountResult.amount;
    }

    const shippingCost = calculateShipping(subtotal);
    const totalAmount = calculateTotal(subtotal) - discountAmount;

    if (totalAmount <= 0 || !Number.isSafeInteger(totalAmount)) {
      return jsonError(
        "Total setelah diskon harus lebih dari Rp 0. Kurangi nilai diskon.",
        400,
      );
    }

    const orderNumber = `CF-${Date.now()}-${randomBytes(4).toString("hex")}`;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is not configured.");
      return jsonError("Konfigurasi pembayaran di server belum lengkap.", 500);
    }

    const supabase = createAdminClient();

    if (
      appliedDiscount &&
      !(await claimDiscountUsage(appliedDiscount))
    ) {
      return jsonError(
        "Kuota kode diskon baru saja habis. Silakan gunakan kode lain.",
        409,
      );
    }

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
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        currency: "IDR",
        order_status: "pending_payment",
        payment_status: "pending",
        payment_gateway: "midtrans",
        ...(appliedDiscount
          ? {
              discount_code: appliedDiscount.code,
              discount_amount: discountAmount,
              discount_id: appliedDiscount.id,
            }
          : {}),
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError?.message);

      if (appliedDiscount) {
        await releaseDiscountUsage(appliedDiscount);
      }

      return jsonError(
        "Pesanan belum bisa disimpan. Silakan coba lagi.",
        500,
      );
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      normalizedItems.map((item) => ({
        ...item,
        order_id: order.id,
      })),
    );

    if (itemsError) {
      console.error("Failed to save order items:", itemsError.message);

      await supabase
        .from("orders")
        .update({
          order_status: "cancelled",
          payment_status: "failure",
        })
        .eq("id", order.id);

      if (appliedDiscount) {
        await releaseDiscountUsage(appliedDiscount);
      }

      return jsonError("Detail produk pesanan gagal disimpan.", 500);
    }

    const itemDetails = normalizedItems.map((item) => ({
      id: `${item.product_id}-${item.size.replace(/[^a-zA-Z0-9-]/g, "")}`,
      price: item.unit_price,
      quantity: item.quantity,
      name: item.product_name.slice(0, 50),
    }));

    if (shippingCost > 0) {
      itemDetails.push({
        id: "shipping",
        price: shippingCost,
        quantity: 1,
        name: "Ongkos Kirim",
      });
    }

    if (discountAmount > 0 && appliedDiscount) {
      itemDetails.push({
        id: "discount",
        price: -discountAmount,
        quantity: 1,
        name: `Diskon ${appliedDiscount.code}`.slice(0, 50),
      });
    }

    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    let paymentResponse: Response;

    try {
      paymentResponse = await fetch(midtransUrl, {
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
            first_name: name.slice(0, 50),
            email,
            phone,
            billing_address: {
              first_name: name.slice(0, 50),
              address: address.slice(0, 200),
              city: city.slice(0, 50),
              postal_code: postalCode,
              country_code: "IDN",
            },
            shipping_address: {
              first_name: name.slice(0, 50),
              address: address.slice(0, 200),
              city: city.slice(0, 50),
              postal_code: postalCode,
              country_code: "IDN",
            },
          },
          callbacks: {
            finish: `${resolveSiteOrigin(request)}/checkout/result?order_id=${encodeURIComponent(order.order_number)}`,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
    } catch (paymentError) {
      console.error(
        "Midtrans request failed:",
        paymentError instanceof Error ? paymentError.message : "Unknown error",
      );

      await supabase
        .from("orders")
        .update({
          order_status: "cancelled",
          payment_status: "failure",
        })
        .eq("id", order.id);

      if (appliedDiscount) {
        await releaseDiscountUsage(appliedDiscount);
      }

      return jsonError(
        "Pesanan tersimpan, tetapi halaman pembayaran gagal dibuat. Silakan coba lagi.",
        502,
      );
    }

    const paymentData = (await paymentResponse.json().catch(() => null)) as {
      token?: unknown;
      redirect_url?: unknown;
    } | null;

    if (
      !paymentResponse.ok ||
      typeof paymentData?.token !== "string" ||
      typeof paymentData?.redirect_url !== "string" ||
      !isSafeMidtransRedirect(paymentData.redirect_url)
    ) {
      console.error("Midtrans transaction creation failed:", {
        status: paymentResponse.status,
      });

      await supabase
        .from("orders")
        .update({
          order_status: "cancelled",
          payment_status: "failure",
        })
        .eq("id", order.id);

      if (appliedDiscount) {
        await releaseDiscountUsage(appliedDiscount);
      }

      return jsonError(
        "Pesanan tersimpan, tetapi halaman pembayaran gagal dibuat. Silakan coba lagi.",
        502,
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        snap_token: paymentData.token,
        snap_redirect_url: paymentData.redirect_url,
        payment_reference: order.order_number,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to save payment reference:", updateError.message);
      return jsonError(
        "Transaksi pembayaran telah dibuat, tetapi status pesanan perlu diperiksa oleh admin.",
        500,
      );
    }

    return NextResponse.json(
      {
        orderNumber: order.order_number,
        redirectUrl: paymentData.redirect_url,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "Checkout error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonError("Terjadi kesalahan saat memproses checkout.", 500);
  }
}
