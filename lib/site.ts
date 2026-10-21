export const SITE = {
  name: "CRAWLFAST",
  legalName: "CRAWLFAST Store",
  tagline: "Everyday essentials, made to last.",
  description:
    "CRAWLFAST menghadirkan pakaian esensial dengan siluet modern, bahan nyaman, dan desain yang tahan tren. Temukan tee, outerwear, dan bottoms untuk gaya sehari-hari.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000",
  locale: "id_ID",
  email: "hello@crawlfast.store",
  instagram: "https://www.instagram.com/crawlfast.std/",
  whatsapp: "https://wa.me/6281292377128",
  city: "Jakarta, Indonesia",
} as const;

export const STORE_NAV = [
  { href: "/products", label: "Belanja" },
  { href: "/products?sort=new", label: "New Arrivals" },
  { href: "/about", label: "Tentang" },
  { href: "/faq", label: "Bantuan" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: "/products", label: "Semua produk" },
    { href: "/products?category=Outerwear", label: "Outerwear" },
    { href: "/products?category=T-Shirts", label: "T-Shirts" },
    { href: "/products?category=Bottoms", label: "Bottoms" },
    { href: "/wishlist", label: "Wishlist" },
  ],
  help: [
    { href: "/faq", label: "FAQ" },
    { href: "/track", label: "Lacak pesanan" },
    { href: "/shipping", label: "Pengiriman" },
    { href: "/returns", label: "Pengembalian" },
    { href: "/size-guide", label: "Panduan ukuran" },
  ],
  company: [
    { href: "/about", label: "Tentang kami" },
    { href: "/contact", label: "Kontak" },
    { href: "/privacy", label: "Kebijakan privasi" },
    { href: "/terms", label: "Syarat & ketentuan" },
  ],
} as const;
