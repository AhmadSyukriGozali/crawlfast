import Link from "next/link";
import {
  BadgePercent,
  Boxes,
  CreditCard,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Shirt,
  Store,
  Tags,
} from "lucide-react";

type AdminSection = "orders" | "products" | "categories" | "discounts" | "payments";

type Props = {
  email: string;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  active?: AdminSection;
};

const NAV_ITEMS: {
  key: AdminSection;
  href: string;
  label: string;
  hint: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    key: "orders",
    href: "/admin",
    label: "Pesanan",
    hint: "Dasbor & transaksi",
    icon: LayoutDashboard,
  },
  {
    key: "products",
    href: "/admin/products",
    label: "Produk",
    hint: "Katalog storefront",
    icon: Shirt,
  },
  {
    key: "categories",
    href: "/admin/categories",
    label: "Kategori",
    hint: "Filter & koleksi",
    icon: Tags,
  },
  {
    key: "discounts",
    href: "/admin/discounts",
    label: "Diskon",
    hint: "Kode promo",
    icon: BadgePercent,
  },
  {
    key: "payments",
    href: "/admin/payments",
    label: "Pembayaran",
    hint: "Midtrans & WhatsApp",
    icon: CreditCard,
  },
];

function BrandMark() {
  return (
    <Link
      href="/admin"
      aria-label="CRAWLFAST Admin — dasbor"
      className="group flex items-center gap-3"
    >
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06]">
        <span className="font-mono text-[13px] font-bold tracking-[-0.06em] text-[#e6d3ae]">
          CF
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b08d57] to-transparent"
        />
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline text-[17px] font-bold leading-none tracking-[-0.055em] text-white">
          CRAWLFAST
          <span className="text-[#c9a86a]">.</span>
        </span>
        <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35">
          Atelier Console
        </span>
      </span>
    </Link>
  );
}

function AccountBlock({
  email,
  loading,
  onLogout,
}: Pick<Props, "email" | "loading" | "onLogout">) {
  const initial = (email || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="admin-account p-3">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#b08d57]/30 bg-[#b08d57]/15 text-[11px] font-bold text-[#e2c896]">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-semibold text-white/85">
            {email || "Administrator"}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/30">
            <span className="h-1 w-1 rounded-full bg-[#8fae7f]" />
            Sesi aktif
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={loading}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
      >
        <LogOut size={12} strokeWidth={1.8} aria-hidden="true" />
        Keluar
      </button>
    </div>
  );
}

export default function AdminHeader({
  email,
  loading,
  onRefresh,
  onLogout,
  active = "orders",
}: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar" aria-label="Panel administrasi">
        <div className="flex items-center justify-between px-5 pb-6 pt-6">
          <BrandMark />
        </div>

        <div className="px-5 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b08d57]/25 bg-[#b08d57]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#d9be8b]">
            <span className="h-1 w-1 rounded-full bg-[#c9a86a]" />
            Admin access
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-5" aria-label="Navigasi admin">
          <p className="admin-sidebar-label mb-2.5">Menu</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="admin-nav-link"
                    data-active={isActive}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <span className="h-1 w-1 rounded-full bg-[#c9a86a]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="admin-sidebar-label mb-2.5 mt-8">Pintasan</p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="admin-nav-link"
                target="_blank"
                rel="noreferrer"
              >
                <Store size={16} strokeWidth={1.7} aria-hidden="true" />
                <span className="flex-1 truncate">Lihat storefront</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="admin-nav-link">
                <Boxes size={16} strokeWidth={1.7} aria-hidden="true" />
                <span className="flex-1 truncate">Kelola katalog</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-auto space-y-3 px-5 pb-5 pt-6">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
          >
            <RefreshCw
              size={13}
              strokeWidth={1.8}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {loading ? "Memuat…" : "Muat ulang"}
          </button>

          <AccountBlock
            email={email}
            loading={loading}
            onLogout={onLogout}
          />

          <p className="text-center text-[9px] uppercase tracking-[0.2em] text-white/20">
            CRAWLFAST · Internal
          </p>
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="admin-mobilebar lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
          <BrandMark />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Muat ulang data"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RefreshCw
                size={15}
                strokeWidth={1.8}
                className={loading ? "animate-spin" : ""}
              />
            </button>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Keluar dari panel admin"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <nav
          aria-label="Navigasi admin"
          className="admin-mobile-nav px-3 pb-2.5"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className="admin-mobile-link"
                data-active={active === item.key}
                aria-current={active === item.key ? "page" : undefined}
              >
                <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
