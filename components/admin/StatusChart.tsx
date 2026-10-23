"use client";

import { useMemo } from "react";
import { PieChart } from "lucide-react";
import type { Order } from "@/features/orders/types";
import { formatStatus } from "@/features/orders/utils";

const PALETTE = ["#7d8a6d", "#c9a86a", "#b9825f", "#7d8ca0", "#b9b5a8"];

export default function StatusChart({ orders }: { orders: Order[] }) {
  const statuses = useMemo(() => {
    const counts = new Map<string, number>();

    for (const order of orders) {
      const label = formatStatus(order.payment_status);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts, ([label, count], index) => ({
      label,
      count,
      color: PALETTE[index % PALETTE.length],
      percentage: orders.length ? (count / orders.length) * 100 : 0,
    })).sort((a, b) => b.count - a.count);
  }, [orders]);

  const gradient = useMemo(() => {
    if (statuses.length === 0) {
      return "conic-gradient(#ece7db 0% 100%)";
    }

    let cursor = 0;
    const stops = statuses.map((status) => {
      const start = cursor;
      cursor += status.percentage;
      return `${status.color} ${start}% ${cursor}%`;
    });

    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, [statuses]);

  return (
    <section className="admin-card admin-card--flush">
      <div className="flex items-start justify-between gap-3 border-b border-[#eee9de] px-5 py-5 sm:px-6">
        <div>
          <p className="admin-eyebrow">Komposisi</p>
          <h2 className="admin-section-title mt-2">Status pembayaran</h2>
          <p className="mt-1 text-xs text-[#6f7064]">
            Distribusi pesanan yang dimuat
          </p>
        </div>

        <span className="admin-icon-tile" data-tone="ink">
          <PieChart size={16} strokeWidth={1.7} aria-hidden="true" />
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {statuses.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-[#3c3d34]">
              Belum ada data
            </p>
            <p className="mt-1 text-xs text-[#6f7064]">
              Status akan muncul setelah pesanan masuk.
            </p>
          </div>
        ) : (
          <>
            <div
              className="relative mx-auto grid h-40 w-40 place-items-center rounded-full"
              style={{ background: gradient }}
              role="img"
              aria-label={`Distribusi ${statuses.length} status pembayaran dari ${orders.length} pesanan`}
            >
              <div className="grid h-[116px] w-[116px] place-items-center rounded-full border border-[#ece7db] bg-[#fffdf8] text-center shadow-[inset_0_2px_10px_rgba(23,24,20,0.04)]">
                <div>
                  <p className="font-display text-3xl leading-none text-[#2f302a]">
                    {orders.length}
                  </p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#747569]">
                    Pesanan
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {statuses.map((status) => (
                <li key={status.label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-[11.5px] capitalize text-[#56584d]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: status.color }}
                      />
                      <span className="truncate">{status.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10.5px] text-[#6b6c61]">
                      {status.count}
                      <span className="ml-1 text-[#b0b0a5]">
                        {Math.round(status.percentage)}%
                      </span>
                    </span>
                  </div>

                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#f0ece2]">
                    <div
                      className="admin-bar h-full rounded-full"
                      style={{
                        width: `${Math.max(status.percentage, 2)}%`,
                        background: status.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="border-t border-[#eee9de] px-5 py-3 text-[10px] uppercase tracking-[0.12em] text-[#76776b] sm:px-6">
        Total pesanan dimuat · {orders.length}
      </p>
    </section>
  );
}
