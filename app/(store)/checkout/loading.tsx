export default function CheckoutLoading() {
  return (
    <div className="container-page animate-pulse pb-16 pt-8 sm:pb-20 sm:pt-10" aria-busy="true">
      <span className="sr-only">Memuat checkout…</span>

      <div className="h-2.5 w-36 rounded bg-sand" />

      <div className="mt-6 border-b border-line pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="h-2.5 w-24 rounded bg-sand" />
            <div className="mt-4 h-11 w-56 rounded bg-sand" />
          </div>
          <div className="h-3 w-52 rounded bg-sand" />
        </div>
        <div className="mt-4 h-3 w-full max-w-xl rounded bg-sand" />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div className="space-y-10">
          {Array.from({ length: 3 }, (_, section) => (
            <section key={section}>
              <div className="mb-5 border-b border-line pb-3">
                <div className="h-5 w-52 rounded bg-sand" />
                <div className="mt-2 h-3 w-72 max-w-full rounded bg-sand" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {Array.from({ length: section === 1 ? 3 : 2 }, (_, field) => (
                  <div key={field} className="space-y-2">
                    <div className="h-3 w-28 rounded bg-sand" />
                    <div className="h-12 w-full border border-line bg-sand/60" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="border border-line p-5 sm:p-7">
          <div className="h-5 w-40 rounded bg-sand" />
          <div className="mt-4 h-20 border border-line bg-sand/50" />
          <div className="mt-5 space-y-4 border-y border-line py-5">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <div className="aspect-4/5 w-16 shrink-0 bg-sand" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-sand" />
                  <div className="h-3 w-1/2 rounded bg-sand" />
                  <div className="h-3 w-1/3 rounded bg-sand" />
                </div>
              </div>
            ))}
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
