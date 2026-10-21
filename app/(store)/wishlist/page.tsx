import WishlistClient from "./WishlistClient";
import { getStoreProducts } from "@/lib/products/data";

export default async function WishlistPage() {
  const products = await getStoreProducts();

  return <WishlistClient products={products} />;
}
