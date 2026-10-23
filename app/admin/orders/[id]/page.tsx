"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  return <OrderDetailClient key={id} />;
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="admin-shell admin-main">
          <div className="admin-container max-w-[1200px] space-y-4">
            <div className="h-4 w-40 animate-pulse rounded bg-[#e9e4d8]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#e9e4d8]" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-56 animate-pulse rounded-xl bg-[#e9e4d8]" />
              <div className="h-56 animate-pulse rounded-xl bg-[#e9e4d8]" />
            </div>
          </div>
        </main>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
