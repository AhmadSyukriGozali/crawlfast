export const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const PAID_STATUSES = new Set(["settlement", "capture"]);

export function isPaid(status: string | null | undefined) {
  return PAID_STATUSES.has((status ?? "").toLowerCase());
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatStatus(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

export function shortDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}