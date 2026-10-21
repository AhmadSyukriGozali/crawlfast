export type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; status: 400 | 413 | 415; error: string };

const JSON_CONTENT_TYPE = /^application\/json(?:\s*;|$)/i;

/**
 * Membaca body JSON dengan batas ukuran dan validasi content-type.
 * Mencegah body besar menghabiskan memori dan request lintas tipe.
 */
export async function readJsonBody(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!JSON_CONTENT_TYPE.test(contentType)) {
    return {
      ok: false,
      status: 415,
      error: "Content-Type harus application/json.",
    };
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, status: 413, error: "Payload terlalu besar." };
  }

  if (!request.body) {
    return { ok: false, status: 400, error: "Body permintaan kosong." };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      received += value.byteLength;

      if (received > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: "Payload terlalu besar." };
      }

      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Body permintaan tidak valid." };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(received);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder().decode(bytes);

  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "JSON tidak valid." };
  }
}

/**
 * Proteksi CSRF sederhana untuk route handler yang dipanggil dari browser.
 * Jika header Origin dikirim, host-nya harus sama dengan host aplikasi.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      return new URL(origin).host === new URL(request.url).host;
    } catch {
      return false;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  return true;
}

export function noStoreJson(
  body: unknown,
  init?: ResponseInit,
): Response {
  const response = Response.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
