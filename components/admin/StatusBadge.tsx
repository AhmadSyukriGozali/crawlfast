import { formatStatus } from "@/features/orders/utils";

type Props = {
  value: string;
};

export default function StatusBadge({ value }: Props) {
  const status = value.toLowerCase();

  const color = [
    "settlement",
    "capture",
    "completed",
  ].includes(status)
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : [
        "pending",
        "pending_payment",
        "authorize",
      ].includes(status)
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : [
          "cancelled",
          "deny",
          "expire",
          "failure",
          "refund",
        ].includes(status)
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${color}`}
    >
      {formatStatus(value)}
    </span>
  );
}