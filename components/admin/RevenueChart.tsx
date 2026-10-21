"use client";

import { useMemo } from "react";
import type { Order } from "@/features/orders/types";
import {
  isPaid,
  money,
  shortDate,
} from "@/features/orders/utils";

export default function RevenueChart({
  orders,
}: {
  orders: Order[];
}) {
  const points = useMemo(() => {
    const today = new Date();

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

      return {
        key,
        label: shortDate(date),
        revenue: 0,
        count: 0,
      };
    });

    const byDate = new Map(days.map((day) => [day.key, day]));

    for (const order of orders) {
      if (!isPaid(order.payment_status)) continue;

      const date = new Date(order.paid_at || order.created_at);
      if (Number.isNaN(date.getTime())) continue;

      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

      const day = byDate.get(key);

      if (day) {
        day.revenue += Number(order.total_amount) || 0;
        day.count += 1;
      }
    }

    return days;
  }, [orders]);

  const max = Math.max(...points.map((point) => point.revenue), 1);
  const width = 560;
  const height = 190;
  const left = 12;
  const right = width - 12;
  const top = 16;
  const bottom = height - 28;

  const coordinates = points.map((point, index) => ({
    x: left + (index * (right - left)) / (points.length - 1),
    y: bottom - (point.revenue / max) * (bottom - top),
  }));

  const linePath = coordinates
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${right} ${bottom} L ${left} ${bottom} Z`;

  const totalRevenue = points.reduce(
    (sum, point) => sum + point.revenue,
    0,
  );

  const totalCount = points.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">
            Tren pembayaran
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            7 hari terakhir · berdasarkan pesanan yang dimuat
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Pembayaran berhasil
        </span>
      </div>

      <div className="mt-6 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Grafik pembayaran berhasil selama tujuh hari terakhir"
          className="h-auto w-full overflow-visible"
        >
          {[0, 1, 2, 3].map((step) => {
            const y = top + ((bottom - top) * step) / 3;

            return (
              <line
                key={step}
                x1={left}
                x2={right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 5"
              />
            );
          })}

          <path d={areaPath} fill="#10b981" opacity="0.10" />

          <path
            d={linePath}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coordinates.map((point, index) => (
            <circle
              key={points[index].key}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#ffffff"
              stroke="#059669"
              strokeWidth="2.5"
            >
              <title>
                {points[index].label}:{" "}
                {money.format(points[index].revenue)}
              </title>
            </circle>
          ))}

          {points.map((point, index) => (
            <text
              key={point.key}
              x={coordinates[index].x}
              y={height - 5}
              fill="#64748b"
              fontSize="10"
              textAnchor="middle"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Pembayaran berhasil
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {totalCount}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Omzet dalam grafik
          </p>
          <p className="mt-1 break-words text-lg font-bold text-slate-900">
            {money.format(totalRevenue)}
          </p>
        </div>
      </div>
    </section>
  );
}