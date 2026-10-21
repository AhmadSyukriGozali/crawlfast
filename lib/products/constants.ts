export const PRODUCTS_TABLE = "products";
export const PRODUCT_IMAGE_BUCKET = "product-images";
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const PRODUCT_IMAGE_PATH_PREFIX = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
