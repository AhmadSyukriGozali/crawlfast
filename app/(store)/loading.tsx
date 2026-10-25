/**
 * Loading khusus storefront. Tanpa file ini, `app/loading.tsx` akan membungkus
 * `(store)/layout` juga sehingga header dan footer hilang saat navigasi.
 */
export default function StoreLoading() {
  return (
    <div className="container-page animate-pulse py-10" aria-busy="true">
      <span className="sr-only">Memuat halaman…</span>

      <div className="h-3 w-24 rounded bg-sand" />
      <div className="mt-5 h-12 w-2/3 max-w-xl rounded bg-sand" />
      <div className="mt-4 h-4 w-full max-w-md rounded bg-sand" />

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <div className="aspect-4/5 bg-sand" />
            <div className="mt-4 h-3 w-16 rounded bg-sand" />
            <div className="mt-2 h-4 w-3/4 rounded bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
