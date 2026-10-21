import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { getStoreCategories } from "@/lib/categories/data";
import { getStoreProducts } from "@/lib/products/data";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, categories] = await Promise.all([
    getStoreProducts(),
    getStoreCategories(),
  ]);
  const productCategories = categories
    .filter((category) =>
      products.some((product) => product.category === category.name),
    )
    .map((category) => category.name);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <SiteHeader products={products} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter categories={productCategories} />
    </div>
  );
}
