import type { Order } from "@/features/orders/types";
import { formatDate, money } from "@/features/orders/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

type Props = {
  orders: Order[];
};

export default function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="font-semibold text-slate-700">
          Tidak ada pesanan yang cocok
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Coba ubah kata kunci atau filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Pesanan</th>
            <th className="px-5 py-4 font-semibold">Pelanggan</th>
            <th className="px-5 py-4 font-semibold">Total</th>
            <th className="px-5 py-4 font-semibold">Pembayaran</th>
            <th className="px-5 py-4 font-semibold">Pesanan</th>
            <th className="px-5 py-4 font-semibold">Tanggal</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-t border-slate-100 transition hover:bg-slate-50/80"
            >
              <td className="px-5 py-4">
                <p className="font-bold text-slate-900">
                    <Link
                        href={`/admin/orders/${encodeURIComponent(order.id)}`}
                        className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                        {order.order_number}
                    </Link>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {order.order_items?.length ?? 0} jenis produk
                </p>
              </td>

              <td className="max-w-64 px-5 py-4">
                <p className="font-semibold text-slate-800">
                  {order.customer_name}
                </p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {order.customer_email}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {order.shipping_city}, {order.shipping_province}
                </p>
              </td>

              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                {money.format(Number(order.total_amount) || 0)}
              </td>

              <td className="px-5 py-4">
                <StatusBadge value={order.payment_status} />
                <p className="mt-2 text-xs text-slate-500">
                  {order.payment_gateway}
                </p>
              </td>

              <td className="px-5 py-4">
                <StatusBadge value={order.order_status} />
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                {formatDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}