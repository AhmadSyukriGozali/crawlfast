export default function CartLoading() {
  return (
    <div className="container-page animate-pulse pb-16 pt-8 sm:pb-20 sm:pt-10" aria-busy="true">
      <span className="sr-only">Memuat keranjang…</span>

      <div className="h-2.5 w-32 rounded bg-sand" />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="h-2.5 w-24 rounded bg-sand" />
          <div className="mt-4 h-11 w-64 max-w-full rounded bg-sand" />
        </div>
        <div className="h-3 w-16 rounded bg-sand" />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="h-3 w-32 rounded bg-sand" />
            <div className="h-3 w-20 rounded bg-sand" />
          </div>

          <div className="divide-y divide-line border-y border-line">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex gap-4 py-5 sm:gap-6">
                <div className="aspect-4/5 w-[104px] shrink-0 bg-sand sm:w-[136px]" />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-sand" />
                    <div className="h-3 w-24 rounded bg-sand" />
                    <div className="h-3 w-20 rounded bg-sand" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-9 w-24 border border-line bg-sand/60" />
                    <div className="h-4 w-20 rounded bg-sand" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="border border-line p-5 sm:p-7">
          <div className="h-5 w-40 rounded bg-sand" />
          <div className="mt-4 h-16 border border-line bg-sand/50" />
          <div className="mt-5 space-y-3.5 border-b border-line pb-5">
            <div className="h-3 w-full rounded bg-sand" />
            <div className="h-3 w-5/6 rounded bg-sand" />
          </div>
          <div className="flex items-center justify-between gap-4 py-5">
            <div className="h-4 w-16 rounded bg-sand" />
            <div className="h-5 w-24 rounded bg-sand" />
          </div>
          <div className="h-12 w-full rounded bg-sand" />
        </aside>
      </div>
    </div>
  );
}
