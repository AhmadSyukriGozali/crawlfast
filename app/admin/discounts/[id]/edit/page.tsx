import { notFound } from "next/navigation";
import DiscountForm from "@/features/discounts/components/DiscountForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EditDiscountPage({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) notFound();

  return <DiscountForm discountId={id} />;
}
