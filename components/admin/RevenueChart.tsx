"use client";

import { useMemo } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Order } from "@/features/orders/types";
import { isPaid, money, shortDate } from "@/features/orders/utils";

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;

    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

export default function RevenueChart({ orders }: { orders: Order[] }) {
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
  const width = 600;
  const height = 210;
  const left = 14;
  const right = width - 14;
  const top = 18;
  const bottom = height - 34;

  const coordinates = points.map((point, index) => ({
    x: left + (index * (right - left)) / (points.length - 1),
    y: bottom - (point.revenue / max) * (bottom - top),
  }));

  const linePath = smoothPath(coordinates);
  const areaPath = `${linePath} L ${right} ${bottom} L ${left} ${bottom} Z`;

  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const totalCount = points.reduce((sum, point) => sum + point.count, 0);
  const bestDay = points.reduce(
    (best, point) => (point.revenue > best.revenue ? point : best),
    points[0],
  );

  return (
    <section className="admin-card admin-card--flush">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee9de] px-5 py-5 sm:px-6">
        <div>
          <p className="admin-eyebrow">Arus kas</p>
          <h2 className="admin-section-title mt-2">Tren pembayaran</h2>
          <p className="mt-1 text-xs text-[#6f7064]">
            7 hari terakhir · hanya pembayaran terkonfirmasi
          </p>
        </div>

        <span className="admin-chip" data-tone="warn">
          <Sparkles size={10} strokeWidth={2} aria-hidden="true" />
          {money.format(totalRevenue)}
        </span>
      </div>

      <div className="px-3 pt-4 sm:px-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Grafik pendapatan tujuh hari terakhir"
          className="h-auto w-full overflow-visible"
        >
          <defs>
            <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b08d57" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#b08d57" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#b08d57" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="adminRevenueLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8d9a7d" />
              <stop offset="55%" stopColor="#b08d57" />
              <stop offset="100%" stopColor="#a95f3d" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((step) => {
            const y = top + ((bottom - top) * step) / 3;

            return (
              <line
                key={step}
                x1={left}
                x2={right}
                y1={y}
                y2={y}
                stroke="#ebe5d8"
                strokeDasharray="2 6"
              />
            );
          })}

          <path d={areaPath} fill="url(#adminRevenueFill)" />

          <path
            d={linePath}
            fill="none"
            stroke="url(#adminRevenueLine)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coordinates.map((point, index) => (
            <g key={points[index].key}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill="#b08d57"
                opacity={points[index].revenue > 0 ? 0.12 : 0}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3.2"
                fill="#fffdf8"
                stroke="#8a6a3a"
                strokeWidth="2"
              >
                <title>
                  {points[index].label}: {money.format(points[index].revenue)}
                </title>
              </circle>
            </g>
          ))}

          {points.map((point, index) => (
            <text
              key={point.key}
              x={coordinates[index].x}
              y={height - 8}
              fill="#747569"
              fontSize="9.5"
              letterSpacing="0.06em"
              textAnchor="middle"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-[#eee9de] bg-[#eee9de]">
        <div className="bg-[#fffdf8] px-4 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
            Transaksi
          </p>
          <p className="mt-1.5 flex items-baseline gap-1 text-lg font-semibold text-[#2f302a]">
            {totalCount}
            <ArrowUpRight
              size={12}
              strokeWidth={2}
              className="text-[#7d8a6d]"
              aria-hidden="true"
            />
          </p>
        </div>

        <div className="bg-[#fffdf8] px-4 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
            Omzet
          </p>
          <p className="mt-1.5 truncate text-lg font-semibold text-[#2f302a]">
            {money.format(totalRevenue)}
          </p>
        </div>

        <div className="bg-[#fffdf8] px-4 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747569]">
            Hari terbaik
          </p>
          <p className="mt-1.5 truncate text-lg font-semibold text-[#2f302a]">
            {bestDay?.revenue ? bestDay.label : "—"}
          </p>
        </div>
      </div>

      <table className="sr-only">
        <caption>Pendapatan tujuh hari terakhir</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Transaksi</th>
            <th scope="col">Pendapatan</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.label}</th>
              <td>{point.count}</td>
              <td>{money.format(point.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
