/**
 * Fallback netral untuk rute di luar storefront (mis. /login). Storefront punya
 * `app/(store)/loading.tsx` sendiri agar header dan footer tetap tampil.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-dvh animate-pulse flex-col items-center justify-center gap-4 bg-cream px-5"
      aria-busy="true"
    >
      <span className="sr-only">Memuat halaman…</span>
      <div className="h-6 w-40 rounded bg-sand" />
      <div className="h-3 w-56 max-w-full rounded bg-sand" />
    </div>
  );
}
