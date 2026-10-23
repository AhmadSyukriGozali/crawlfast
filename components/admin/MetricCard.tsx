import {
  ArrowUpRight,
  Clock3,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

export type MetricIcon = "orders" | "paid" | "pending" | "revenue";

type IconComponent = typeof ReceiptText;

type Props = {
  title: string;
  value: string;
  description: string;
  icon: MetricIcon;
  tone?: "brass" | "sage" | "clay" | "ink";
  emphasis?: string;
};

const ICONS: Record<MetricIcon, IconComponent> = {
  orders: ReceiptText,
  paid: ArrowUpRight,
  pending: Clock3,
  revenue: Wallet,
};

const TONES: Record<
  NonNullable<Props["tone"]>,
  { tile: "brass" | "sage" | "clay" | "ink"; bar: string }
> = {
  brass: {
    tile: "brass",
    bar: "from-[#c9a86a] to-[#8a6a3a]",
  },
  sage: {
    tile: "sage",
    bar: "from-[#8d9a7d] to-[#5b6650]",
  },
  clay: {
    tile: "clay",
    bar: "from-[#d19a7a] to-[#a95f3d]",
  },
  ink: {
    tile: "ink",
    bar: "from-[#6a6c60] to-[#171814]",
  },
};

export default function MetricCard({
  title,
  value,
  description,
  icon,
  tone = "brass",
  emphasis,
}: Props) {
  const Icon = ICONS[icon];
  const style = TONES[tone];

  return (
    <article className="admin-card admin-hover-lift group relative overflow-hidden p-5">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${style.bar} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b8c80]">
          {title}
        </p>
        <span className="admin-icon-tile" data-tone={style.tile}>
          <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
        </span>
      </div>

      <p className="admin-stat-value mt-5">{value}</p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#ece7db] pt-3">
        <p className="text-[11px] leading-4 text-[#6f7064]">{description}</p>
        {emphasis && (
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#7d5d2f]">
            <TrendingUp size={11} strokeWidth={1.9} aria-hidden="true" />
            {emphasis}
          </span>
        )}
      </div>
    </article>
  );
}
