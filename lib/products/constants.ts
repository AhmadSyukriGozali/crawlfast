export const PRODUCTS_TABLE = "products";
export const PRODUCT_IMAGE_BUCKET = "product-images";
// Vercel Functions menolak request body > 4.5 MB (FUNCTION_PAYLOAD_TOO_LARGE),
// jadi batas file dijaga 4 MB agar multipart overhead tetap muat.
export const PRODUCT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const PRODUCT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const PRODUCT_IMAGE_PATH_PREFIX = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
