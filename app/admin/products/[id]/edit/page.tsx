import { notFound } from "next/navigation";
import ProductForm from "@/features/products/components/ProductForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  if (!/^\d{1,10}$/.test(id)) notFound();

  const productId = Number(id);

  if (!Number.isSafeInteger(productId) || productId <= 0) notFound();

  return <ProductForm productId={productId} />;
}
