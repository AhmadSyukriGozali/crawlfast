
import { createHash, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { noStoreJson, readJsonBody } from "@/lib/security/request";
import { isOrderNumber } from "@/lib/security/validate";

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

const VALID_STATUSES = new Set([
  "pending",
  "settlement",
  "capture",
  "authorize",
  "deny",
  "cancel",
  "expire",
  "failure",
  "refund",
  "partial_refund",
  "chargeback",
  "partial_chargeback",
]);

const SUCCESS_STATUSES = new Set(["settlement", "capture"]);

const FAILURE_STATUSES = new Set([
  "deny",
  "cancel",
  "expire",
  "failure",
]);

const REVERSAL_STATUSES = new Set([
  "refund",
  "partial_refund",
  "chargeback",
  "partial_chargeback",
]);

function jsonError(message: string, status: number) {
  return noStoreJson({ error: message }, { status });
}

export async function POST(request: Request) {
  // Midtrans memanggil endpoint ini server-to-server, jadi tidak ada
  // pengecekan Origin. Keaslian request diverifikasi lewat signature SHA-512.
  const bodyResult = await readJsonBody(request, 32 * 1024);

  if (!bodyResult.ok) {
    return jsonError("Invalid notification payload.", bodyResult.status);
  }

  const body: unknown = bodyResult.data;

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError("Invalid notification payload.", 400);
  }

  const notification = body as MidtransNotification;

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is missing.");
      return jsonError("Payment configuration is missing.", 500);
    }

    const orderNumber = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signature = notification.signature_key;
    const rawStatus = notification.transaction_status;

    if (
      typeof orderNumber !== "string" ||
      !isOrderNumber(orderNumber) ||
      typeof statusCode !== "string" ||
      !/^\d{3}$/.test(statusCode) ||
      typeof grossAmount !== "string" ||
      !/^\d+(?:\.\d{1,2})?$/.test(grossAmount) ||
      typeof signature !== "string" ||
      !/^[a-fA-F0-9]{128}$/.test(signature) ||
      typeof rawStatus !== "string" ||
      !VALID_STATUSES.has(rawStatus)
    ) {
      return jsonError("Invalid notification fields.", 400);
    }

    // Verify the Midtrans signature before accessing the order.
    const expectedSignature = createHash("sha512")
      .update(
        `${orderNumber}${statusCode}${grossAmount}${serverKey}`,
        "utf8",
      )
      .digest();

    const receivedSignature = Buffer.from(signature, "hex");

    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return jsonError("Invalid notification signature.", 401);
    }

    const supabase = createAdminClient();

    // Optimistic concurrency: notifikasi Midtrans bisa datang bersamaan.
    // Update hanya boleh menang jika status yang kita baca belum berubah.
    // Jika kalah balapan, baca ulang dan evaluasi lagi (maksimal 2 putaran).
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { data: order, error: findError } = await supabase
        .from("orders")
        .select(
          "id, total_amount, payment_status, order_status, paid_at",
        )
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (findError) {
        console.error("Order lookup failed:", findError.message);
        return jsonError("Could not look up order.", 500);
      }

      if (!order) {
        return jsonError("Order not found.", 404);
      }

      const notifiedAmount = Number(grossAmount);
      const storedAmount = Number(order.total_amount);

      if (
        !Number.isSafeInteger(notifiedAmount) ||
        !Number.isSafeInteger(storedAmount) ||
        notifiedAmount !== storedAmount
      ) {
        return jsonError("Payment amount does not match order.", 400);
      }

      // A card capture is successful only when Midtrans confirms acceptance.
      // Challenge, deny, or missing fraud status must not mark an order as paid.
      let effectiveStatus = rawStatus;

      if (rawStatus === "capture") {
        if (notification.fraud_status === "accept") {
          effectiveStatus = "capture";
        } else if (notification.fraud_status === "deny") {
          effectiveStatus = "deny";
        } else {
          effectiveStatus = "pending";
        }
      }

      const currentStatus = String(order.payment_status ?? "");

      const currentIsSuccessful = SUCCESS_STATUSES.has(currentStatus);
      const currentIsFailure = FAILURE_STATUSES.has(currentStatus);
      const incomingIsSuccessful = SUCCESS_STATUSES.has(effectiveStatus);
      const incomingIsFailure = FAILURE_STATUSES.has(effectiveStatus);
      const currentIsReversed = REVERSAL_STATUSES.has(currentStatus);
      const incomingIsReversal = REVERSAL_STATUSES.has(effectiveStatus);

      // Do not let any older pending/failure/authorize notification undo a
      // successful payment. Only success duplicates and reversals may pass.
      if (
        currentIsSuccessful &&
        !incomingIsSuccessful &&
        !incomingIsReversal
      ) {
        return noStoreJson({ received: true });
      }

      // A late pending/authorize must not resurrect an order that already
      // expired, failed, or was cancelled. A genuine settlement may still pass.
      if (
        currentIsFailure &&
        (effectiveStatus === "pending" || effectiveStatus === "authorize")
      ) {
        return noStoreJson({ received: true });
      }

      // Once a refund or chargeback is recorded, do not let an older
      // payment notification restore the order to a successful state.
      if (currentIsReversed && !incomingIsReversal) {
        return noStoreJson({ received: true });
      }

      const now = new Date().toISOString();

      const updateData: Record<string, unknown> = {
        payment_status: effectiveStatus,
        payment_reference:
          typeof notification.transaction_id === "string"
            ? notification.transaction_id.slice(0, 128)
            : orderNumber,
        payment_payload: {
          order_id: orderNumber,
          status_code: statusCode,
          gross_amount: grossAmount,
          transaction_status: rawStatus,
          transaction_id:
            typeof notification.transaction_id === "string"
              ? notification.transaction_id.slice(0, 128)
              : null,
          payment_type:
            typeof notification.payment_type === "string"
              ? notification.payment_type.slice(0, 50)
              : null,
          fraud_status:
            typeof notification.fraud_status === "string"
              ? notification.fraud_status.slice(0, 50)
              : null,
        },
        updated_at: now,
      };

      if (incomingIsSuccessful) {
        updateData.order_status = "processing";

        // Keep the original paid timestamp on duplicate success notifications.
        updateData.paid_at = order.paid_at ?? now;
      } else if (incomingIsFailure) {
        updateData.order_status = "cancelled";
        // Intentionally preserve paid_at instead of clearing payment history.
      } else if (
        effectiveStatus === "pending" ||
        effectiveStatus === "authorize"
      ) {
        updateData.order_status = "pending_payment";
      }

      // Refund and chargeback notifications update payment_status only.
      // They do not automatically erase the order's processing history.
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", order.id)
        .eq("payment_status", currentStatus)
        .select("id")
        .maybeSingle();

      if (updateError) {
        console.error("Payment update failed:", updateError.message);
        return jsonError("Could not update payment status.", 500);
      }

      // Notifikasi lain sudah mengubah status lebih dulu. Ulangi evaluasi
      // agar hasil akhir tetap konsisten (mis. success tidak kalah oleh expire).
      if (updatedOrder) {
        return noStoreJson({ received: true });
      }
    }

    return noStoreJson({ received: true });
  } catch (error) {
    console.error(
      "Payment notification error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonError("Could not process notification.", 500);
  }
}
