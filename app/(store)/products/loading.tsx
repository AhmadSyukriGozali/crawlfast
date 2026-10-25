export default function ProductsLoading() {
  return (
    <div className="container-page animate-pulse pb-16 pt-8 sm:pb-20 sm:pt-10" aria-busy="true">
      <span className="sr-only">Memuat koleksi…</span>

      <div className="h-3 w-20 rounded bg-sand" />

      <div className="mt-8 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="h-3 w-40 rounded bg-sand" />
          <div className="mt-4 h-12 w-72 max-w-full rounded bg-sand" />
        </div>
        <div className="space-y-2 lg:justify-self-end">
          <div className="h-3 w-full max-w-md rounded bg-sand" />
          <div className="h-3 w-2/3 rounded bg-sand" />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-9 w-24 rounded border border-line bg-sand/70" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-full rounded border border-line bg-sand/70 sm:w-56" />
          <div className="hidden h-10 w-44 rounded border border-line bg-sand/70 sm:block" />
        </div>
      </div>

      <div className="mt-5 h-3 w-32 rounded bg-sand" />

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <div className="aspect-4/5 bg-sand" />
            <div className="mt-3 h-3 w-16 rounded bg-sand" />
            <div className="mt-2 h-4 w-3/4 rounded bg-sand" />
            <div className="mt-2 h-3 w-20 rounded bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
