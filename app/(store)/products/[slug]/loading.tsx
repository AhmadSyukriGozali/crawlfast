export default function ProductDetailLoading() {
  return (
    <div className="container-page animate-pulse pb-16 pt-6 sm:pb-20" aria-busy="true">
      <span className="sr-only">Memuat produk…</span>

      <div className="h-2.5 w-48 rounded bg-sand" />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="aspect-4/5 w-full bg-sand" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-20 border border-line bg-sand/60" />
            ))}
          </div>
        </div>

        <div className="lg:pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="h-2.5 w-24 rounded bg-sand" />
            <div className="h-2.5 w-28 rounded bg-sand" />
          </div>
          <div className="mt-4 h-12 w-3/4 rounded bg-sand" />
          <div className="mt-4 h-6 w-32 rounded bg-sand" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full rounded bg-sand" />
            <div className="h-3 w-11/12 rounded bg-sand" />
            <div className="h-3 w-2/3 rounded bg-sand" />
          </div>

          <div className="mt-8 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-12 border border-line bg-sand/60" />
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="h-14 w-full border border-line bg-sand/60 sm:w-36" />
            <div className="h-14 flex-1 bg-sand" />
            <div className="hidden h-14 w-14 border border-line bg-sand/60 sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
