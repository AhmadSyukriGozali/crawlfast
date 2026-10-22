import { randomUUID } from "node:crypto";
import { guardAdminApi } from "@/lib/admin/guard";
import { noStoreJson } from "@/lib/security/request";
import {
  PRODUCT_IMAGE_BUCKET,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MIME_TYPES,
} from "@/lib/products/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const guard = await guardAdminApi(request, "products-upload", 30);

  if (!guard.ok) return guard.response;

  const contentLength = Number(
    request.headers.get("content-length") ?? "0",
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > PRODUCT_IMAGE_MAX_BYTES + 128 * 1024
  ) {
    return noStoreJson(
      { error: "Ukuran gambar maksimal 4 MB." },
      { status: 413 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return noStoreJson(
      { error: "Form upload tidak valid." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return noStoreJson(
      { error: "File gambar wajib dipilih." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return noStoreJson(
      { error: "Ukuran gambar harus antara 1 byte dan 4 MB." },
      { status: 413 },
    );
  }

  if (
    !(PRODUCT_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return noStoreJson(
      { error: "Format gambar harus JPG, PNG, WEBP, atau AVIF." },
      { status: 415 },
    );
  }

  try {
    const supabase = createAdminClient();

    const { data: buckets, error: bucketListError } =
      await supabase.storage.listBuckets();

    if (bucketListError) {
      console.error(
        "Failed to list storage buckets:",
        bucketListError.message,
      );
      return noStoreJson(
        { error: "Storage gambar belum siap." },
        { status: 500 },
      );
    }

    if (!buckets?.some((bucket) => bucket.name === PRODUCT_IMAGE_BUCKET)) {
      const { error: bucketError } = await supabase.storage.createBucket(
        PRODUCT_IMAGE_BUCKET,
        {
          public: true,
          fileSizeLimit: PRODUCT_IMAGE_MAX_BYTES,
          allowedMimeTypes: [...PRODUCT_IMAGE_MIME_TYPES],
        },
      );

      if (
        bucketError &&
        !/already exists|duplicate/i.test(bucketError.message)
      ) {
        console.error("Failed to create image bucket:", bucketError.message);
        return noStoreJson(
          { error: "Bucket gambar gagal dibuat." },
          { status: 500 },
        );
      }
    }

    const extension = EXTENSIONS[file.type];
    const objectPath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(objectPath, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Failed to upload product image:", uploadError.message);
      return noStoreJson(
        { error: "Gambar gagal di-upload." },
        { status: 500 },
      );
    }

    const { data } = supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(objectPath);

    return noStoreJson({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error(
      "Product image upload error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { error: "Terjadi kesalahan saat upload gambar." },
      { status: 500 },
    );
  }
}
