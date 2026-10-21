const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  if (!Number.isFinite(amount)) return rupiahFormatter.format(0);
  return rupiahFormatter.format(amount);
}

/** Mengubah teks harga lama ("Rp 189.000") menjadi angka. */
export function parsePrice(price: string | number): number {
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  const digits = price.replace(/\D/g, "");
  return Number(digits) || 0;
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatStatus(value: string | null | undefined): string {
  return (value || "unknown").replaceAll("_", " ");
}
