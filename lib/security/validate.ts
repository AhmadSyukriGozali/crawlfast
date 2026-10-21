export function cleanText(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") return "";

  // Buang karakter kontrol dan batasi panjang sebelum disimpan.
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isEmail(value: string): boolean {
  return (
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
  );
}

export function isPhone(value: string): boolean {
  return /^[0-9+()\-\s.]{8,25}$/.test(value);
}

export function isPostalCode(value: string): boolean {
  return /^[0-9]{5}$/.test(value);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function isOrderNumber(value: string): boolean {
  return /^CF-[A-Za-z0-9-]{1,64}$/.test(value);
}
