import { formatStatus } from "@/features/orders/utils";

type Props = {
  value: string;
};

const TONE_MAP: Record<string, "success" | "warn" | "danger" | "neutral" | "info"> = {
  settlement: "success",
  capture: "success",
  completed: "success",
  pending: "warn",
  pending_payment: "warn",
  authorize: "warn",
  processing: "info",
  shipped: "info",
  cancelled: "danger",
  deny: "danger",
  expire: "danger",
  failure: "danger",
  refund: "danger",
};

export default function StatusBadge({ value }: Props) {
  const status = (value || "unknown").toLowerCase();
  const tone = TONE_MAP[status] ?? "neutral";

  return (
    <span className="admin-chip" data-tone={tone}>
      {formatStatus(value)}
    </span>
  );
}
