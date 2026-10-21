import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRAWLFAST — Everyday Essentials",
    short_name: "CRAWLFAST",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#1d1e1a",
    lang: "id",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
