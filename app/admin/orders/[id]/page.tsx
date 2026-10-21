
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
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-6xl animate-pulse">
            <div className="h-8 w-56 rounded bg-slate-200" />
            <div className="mt-6 h-64 rounded-xl bg-slate-200" />
          </div>
        </main>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
