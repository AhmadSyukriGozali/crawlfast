export default function AdminLoading() {
  return (
    <main className="admin-shell admin-main">
      <aside className="admin-sidebar" aria-hidden="true">
        <div className="px-5 pb-6 pt-6">
          <span className="text-[17px] font-bold leading-none tracking-[-0.055em] text-white">
            CRAWLFAST<span className="text-[#c9a86a]">.</span>
          </span>
          <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.24em] text-white/30">
            Atelier Console
          </span>
        </div>

        <div className="space-y-2 px-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-9 animate-pulse rounded-lg bg-white/[0.06]"
            />
          ))}
        </div>

        <div className="mt-auto space-y-3 px-5 pb-5 pt-6">
          <div className="h-10 animate-pulse rounded-lg bg-white/[0.05]" />
          <div className="h-20 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
        </div>
      </aside>

      <header className="admin-mobilebar lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-bold leading-none tracking-[-0.055em] text-white">
            CRAWLFAST<span className="text-[#c9a86a]">.</span>
          </span>
          <div className="flex gap-1.5">
            <span className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
            <span className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="h-6 w-16 animate-pulse rounded-full bg-white/[0.08]"
            />
          ))}
        </div>
      </header>

      <div
        className="admin-container space-y-6"
        aria-busy="true"
        aria-label="Memuat panel admin"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <div className="h-2.5 w-24 animate-pulse rounded bg-[#e3ddcf]" />
            <div className="h-9 w-64 max-w-full animate-pulse rounded bg-[#e3ddcf]" />
            <div className="h-3 w-80 max-w-full animate-pulse rounded bg-[#ece7db]" />
          </div>
          <div className="flex gap-2">
            <span className="h-9 w-32 animate-pulse rounded-full border border-[#e4dfd2] bg-[#fffdf8]/70" />
            <span className="h-9 w-24 animate-pulse rounded-full border border-[#e4dfd2] bg-[#fffdf8]/70" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="admin-card h-36 animate-pulse bg-[#faf7f0]"
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <div className="admin-card h-80 animate-pulse bg-[#faf7f0]" />
          <div className="admin-card h-80 animate-pulse bg-[#faf7f0]" />
        </div>

        <div className="admin-card admin-card--flush p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-[#e9e4d8]" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-[#f6f2e9]"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
