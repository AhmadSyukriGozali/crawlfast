import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";


type MidtransNotification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  transaction_id?: string;
  payment_type?: string;
  fraud_status?: string;
};

const VALID_PAYMENT_STATUSES = new Set([
  "pending",
  "settlement",
  "capture",
  "deny",
  "cancel",
  "expire",
  "failure",
  "refund",
  "partial_refund",
]);

export async function POST(request: Request) {
  try {
    const notification =
      (await request.json()) as MidtransNotification;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is missing.");

      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 },
      );
    }

    const orderNumber = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signature = notification.signature_key;

    if (
      !orderNumber ||
      !statusCode ||
      !grossAmount ||
      !signature
    ) {
      return NextResponse.json(
        { error: "Invalid notification payload." },
        { status: 400 },
      );
    }

    const expectedSignature = createHash("sha512")
      .update(`${orderNumber}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid notification signature." },
        { status: 401 },
      );
    }

    const supabase = createAdminClient();

    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, total_amount, payment_status")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (findError) {
      console.error("Failed to look up order:", findError.message);

      return NextResponse.json(
        { error: "Could not look up order." },
        { status: 500 },
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }

    const notifiedAmount = Number(grossAmount);

    if (
      !Number.isFinite(notifiedAmount) ||
      Math.round(notifiedAmount) !== order.total_amount
    ) {
      return NextResponse.json(
        { error: "Payment amount does not match the order." },
        { status: 400 },
      );
    }

    const rawStatus = notification.transaction_status ?? "";

    if (!VALID_PAYMENT_STATUSES.has(rawStatus)) {
      return NextResponse.json(
        { error: "Unsupported transaction status." },
        { status: 400 },
      );
    }

    const incomingStatus = rawStatus as
      | "pending"
      | "settlement"
      | "capture"
      | "deny"
      | "cancel"
      | "expire"
      | "failure"
      | "refund"
      | "partial_refund";

    const currentIsSuccessful = ["settlement", "capture"].includes(
      order.payment_status,
    );

    const incomingIsUnsuccessful =
      ["pending", "deny", "cancel", "expire", "failure"].includes(
        incomingStatus,
      );

    // Jangan biarkan notifikasi lama mengubah pembayaran sukses
    // kembali menjadi pending atau gagal.
    if (currentIsSuccessful && incomingIsUnsuccessful) {
      return NextResponse.json({ received: true });
    }

    const isSuccessful = ["settlement", "capture"].includes(
      incomingStatus,
    );

    const isFailed = [
      "deny",
      "cancel",
      "expire",
      "failure",
    ].includes(incomingStatus);

    const orderStatus = isSuccessful
      ? "processing"
      : isFailed
        ? "cancelled"
        : "pending_payment";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: incomingStatus,
        order_status: orderStatus,
        payment_reference:
          notification.transaction_id ?? orderNumber,
        paid_at: isSuccessful ? new Date().toISOString() : null,
        payment_payload: notification,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update payment:", updateError.message);

      return NextResponse.json(
        { error: "Could not update payment status." },
        { status: 500 },
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "Payment notification error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Invalid notification request." },
      { status: 400 },
    );
  }
}