"use client";

import { useMemo } from "react";
import type { Order } from "@/features/orders/types";
import { formatStatus } from "@/features/orders/utils";

const COLORS = [
  "bg-emerald-500",
  "bg-amber-400",
  "bg-red-400",
  "bg-blue-400",
  "bg-slate-400",
];

export default function StatusChart({
  orders,
}: {
  orders: Order[];
}) {
  const statuses = useMemo(() => {
    const counts = new Map<string, number>();

    for (const order of orders) {
      const label = formatStatus(order.payment_status);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts, ([label, count]) => ({
      label,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [orders]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-bold text-slate-900">
        Status pembayaran
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Distribusi pesanan yang dimuat
      </p>

      <div className="mt-6 space-y-5">
        {statuses.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada data.
          </p>
        ) : (
          statuses.map((status, index) => {
            const percentage =
              (status.count / (orders.length || 1)) * 100;

            return (
              <div key={status.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="capitalize text-slate-600">
                    {status.label}
                  </span>

                  <span className="font-semibold text-slate-900">
                    {status.count} · {Math.round(percentage)}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
        Total pesanan dimuat: {orders.length}
      </p>
    </section>
  );
}