import Link from "next/link";

type AdminSection = "orders" | "products" | "categories" | "discounts" | "payments";

type Props = {
  email: string;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  active?: AdminSection;
};

const NAV_ITEMS: { key: AdminSection; href: string; label: string }[] = [
  { key: "orders", href: "/admin", label: "Pesanan" },
  { key: "products", href: "/admin/products", label: "Produk" },
  { key: "categories", href: "/admin/categories", label: "Kategori" },
  { key: "discounts", href: "/admin/discounts", label: "Diskon" },
  { key: "payments", href: "/admin/payments", label: "Pembayaran" },
];

export default function AdminHeader({
  email,
  loading,
  onRefresh,
  onLogout,
  active = "orders",
}: Props) {
  return (
    <aside className="border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-light font-black text-ink">
            CF
          </div>

          <div>
            <p className="text-lg font-bold tracking-[-0.04em]">
              CRAWLFAST<span className="text-sage-light">.</span>
            </p>
            <p className="text-xs text-white/45">
              Administration panel
            </p>
          </div>

          <span className="ml-2 rounded-full border border-sage-light/30 bg-sage-light/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-sage-light">
            ADMIN
          </span>
        </div>

        <nav
          aria-label="Navigasi admin"
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                active === item.key
                  ? "bg-white text-ink"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">
              {email || "Admin"}
            </p>
            <p className="text-xs text-slate-400">
              Akun terautentikasi
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Memuat..." : "↻ Muat ulang"}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-sage-light"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}