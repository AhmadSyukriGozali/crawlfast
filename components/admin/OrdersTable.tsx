import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import type { Order } from "@/features/orders/types";
import { formatDate, money } from "@/features/orders/utils";
import StatusBadge from "@/components/admin/StatusBadge";

type Props = {
  orders: Order[];
};

function initials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-[#e4dfd2] bg-[#f8f5ed] text-[#8b8c80]">
          <Inbox size={20} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm font-semibold text-[#3c3d34]">
          Tidak ada pesanan yang cocok
        </p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-[#6f7064]">
          Coba ubah kata kunci, rentang tanggal, atau filter status.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Pesanan</th>
            <th>Pelanggan</th>
            <th>Total</th>
            <th>Pembayaran</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th aria-label="Aksi" />
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => {
            const itemCount = order.order_items?.length ?? 0;

            return (
              <tr key={order.id} className="group">
                <td>
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.id)}`}
                    className="group/link inline-flex flex-col"
                  >
                    <span className="font-mono text-[12px] font-semibold tracking-[-0.01em] text-[#3c3d34] transition-colors group-hover/link:text-[#8a6a3a]">
                      {order.order_number}
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#76776b]">
                      {itemCount} jenis produk
                    </span>
                  </Link>
                </td>

                <td className="max-w-64">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e4dfd2] bg-gradient-to-br from-[#f4efe3] to-[#eae3d4] text-[10px] font-bold text-[#6c6759]">
                      {initials(order.customer_name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-[#2f302a]">
                        {order.customer_name}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-[#6f7064]">
                        {order.customer_email}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-[#76776b]">
                        {order.shipping_city}, {order.shipping_province}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap">
                  <span className="text-[13px] font-semibold text-[#2f302a]">
                    {money.format(Number(order.total_amount) || 0)}
                  </span>
                </td>

                <td>
                  <StatusBadge value={order.payment_status} />
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em] text-[#76776b]">
                    {order.payment_gateway || "—"}
                  </p>
                </td>

                <td>
                  <StatusBadge value={order.order_status} />
                </td>

                <td className="whitespace-nowrap text-[11.5px] text-[#6b6c61]">
                  {formatDate(order.created_at)}
                </td>

                <td className="text-right">
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.id)}`}
                    aria-label={`Buka pesanan ${order.order_number}`}
                    className="inline-grid h-8 w-8 place-items-center rounded-lg border border-transparent text-[#76776b] transition group-hover:border-[#e4dfd2] group-hover:bg-white group-hover:text-[#8a6a3a]"
                  >
                    <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
