import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/catalog";
import { SITE } from "@/lib/site";

const STATIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/shipping", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/returns", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/size-guide", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE.url}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...PRODUCTS.map((product) => ({
      url: `${SITE.url}/products/${product.slug}`,
      lastModified: new Date(`${product.createdAt}T00:00:00+07:00`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
