// Kategori sekarang dikelola lewat tabel `categories`. Tipe ini sengaja
// dibuat longgar agar kategori baru dari admin langsung bisa dipakai.
export type ProductCategory = string;

export type ProductTag =
  | "BESTSELLER"
  | "NEW ARRIVAL"
  | "POPULAR"
  | "LIMITED";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  tag?: ProductTag;
  image: string;
  imageAlt: string;
  tint: string;
  description: string;
  details: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  featured?: boolean;
  isActive?: boolean;
};

export const PRODUCTS: readonly Product[] = [
  {
    id: 1,
    slug: "essential-boxy-tee",
    name: "Essential Boxy Tee",
    category: "T-Shirts",
    price: 189_000,
    tag: "BESTSELLER",
    image: "/products/essential-boxy-tee.jpg",
    imageAlt: "Kaos katun putih dengan potongan boxy",
    tint: "#e9e5dc",
    description:
      "Kaos esensial dengan siluet boxy yang santai. Bahannya tebal, jatuhnya rapi, dan mudah dipadukan dengan berbagai gaya untuk menemani aktivitas sehari-hari.",
    details: [
      "100% cotton combed 24s",
      "Potongan boxy, unisex fit",
      "Jahitan double-stitch di bagian tepi",
      "Diproduksi lokal di Bandung",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviewCount: 126,
    createdAt: "2026-01-12",
    featured: true,
  },
  {
    id: 2,
    slug: "utility-overshirt",
    name: "Utility Overshirt",
    category: "Outerwear",
    price: 429_000,
    compareAtPrice: 499_000,
    tag: "NEW ARRIVAL",
    image: "/products/utility-overshirt-denim.jpg",
    imageAlt: "Overshirt denim biru dengan potongan relaxed",
    tint: "#e2e4e6",
    description:
      "Overshirt denim serbaguna dengan tampilan modern. Cocok digunakan sebagai lapisan tambahan untuk gaya kasual yang rapi, dengan saku fungsional dan bahan yang nyaman dipakai sepanjang hari.",
    details: [
      "Denim cotton 10 oz dengan finishing washed",
      "Dua saku dada fungsional",
      "Kancing kornia alami",
      "Bisa dipakai sebagai outer maupun shirt",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 84,
    createdAt: "2026-02-02",
    featured: true,
  },
  {
    id: 3,
    slug: "relaxed-straight-pants",
    name: "Relaxed Straight Pants",
    category: "Bottoms",
    price: 349_000,
    image: "/products/relaxed-straight-pants.jpg",
    imageAlt: "Celana straight leg berwarna netral",
    tint: "#e8e5df",
    description:
      "Celana berpotongan straight dengan siluet relaxed yang nyaman. Pilihan versatile untuk tampilan santai maupun smart casual, dengan pinggang elastis tersembunyi.",
    details: [
      "Cotton-linen blend yang breathable",
      "Pinggang elastis dengan drawcord",
      "Dua saku samping dan satu saku belakang",
      "Straight leg dengan panjang cropped",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviewCount: 57,
    createdAt: "2026-01-20",
    featured: true,
  },
  {
    id: 4,
    slug: "everyday-beanie",
    name: "Everyday Beanie",
    category: "Accessories",
    price: 149_000,
    tag: "POPULAR",
    image: "/products/everyday-beanie.jpg",
    imageAlt: "Beanie rajut abu-abu dengan tekstur rib",
    tint: "#e6e3dc",
    description:
      "Beanie rajut dengan tekstur rib yang lembut dan hangat. Potongan satu ukuran yang nyaman dipakai sehari-hari, mudah dipadukan dengan outerwear maupun knitwear.",
    details: [
      "Merino wool blend yang lembut",
      "Double-layer rib untuk kehangatan ekstra",
      "Satu ukuran, nyaman untuk lingkar kepala 54–60 cm",
      "Perawatan: hand wash, keringkan dengan cara dilipat",
    ],
    sizes: ["All Size"],
    rating: 4.9,
    reviewCount: 98,
    createdAt: "2026-02-14",
    featured: true,
  },
  {
    id: 5,
    slug: "heavyweight-crew-tee",
    name: "Heavyweight Crew Tee",
    category: "T-Shirts",
    price: 219_000,
    tag: "NEW ARRIVAL",
    image: "/products/heavyweight-crew-tee.jpg",
    imageAlt: "Kaos heavyweight dengan kerah bulat",
    tint: "#e7e2d8",
    description:
      "Kaos heavyweight dengan gramasi lebih tebal untuk struktur yang lebih tegas. Didesain untuk dipakai berulang kali tanpa kehilangan bentuk.",
    details: [
      "240 gsm cotton heavyweight",
      "Ribbed collar 2 cm",
      "Pre-shrunk, tidak menyusut setelah dicuci",
      "Tersedia dalam warna netral",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviewCount: 41,
    createdAt: "2026-03-01",
  },
  {
    id: 6,
    slug: "denim-chore-jacket",
    name: "Denim Chore Jacket",
    category: "Outerwear",
    price: 589_000,
    tag: "LIMITED",
    image: "/products/denim-chore-jacket.jpg",
    imageAlt: "Chore jacket denim biru dengan saku depan",
    tint: "#e2e4e6",
    description:
      "Chore jacket berbahan denim tebal yang akan semakin indah seiring pemakaian. Potongan relaxed dengan tiga saku depan dan kancing logam, siap menemani aktivitas harian.",
    details: [
      "12 oz cotton denim",
      "Tiga saku depan fungsional",
      "Kancing logam anti-karat",
      "Unlined, cocok untuk iklim tropis",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.9,
    reviewCount: 33,
    createdAt: "2026-02-25",
  },
  {
    id: 7,
    slug: "everyday-jogger-pants",
    name: "Everyday Jogger Pants",
    category: "Bottoms",
    price: 399_000,
    image: "/products/everyday-jogger-pants.jpg",
    imageAlt: "Celana jogger warna rose dengan tapered leg",
    tint: "#e9e6de",
    description:
      "Celana jogger dengan pinggang elastis dan potongan tapered yang nyaman. Bahan lembut dengan ribbed cuff membuatnya pas untuk santai maupun aktivitas harian.",
    details: [
      "Cotton-poly fleece yang lembut",
      "Pinggang elastis dengan drawcord",
      "Tapered leg dengan ribbed cuff",
      "Dua saku samping dan satu saku belakang",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 46,
    createdAt: "2026-03-08",
  },
  {
    id: 8,
    slug: "merino-cardigan",
    name: "Merino Cardigan",
    category: "Knitwear",
    price: 479_000,
    image: "/products/merino-cardigan.jpg",
    imageAlt: "Cardigan rajut krem dengan kancing alami",
    tint: "#eae5da",
    description:
      "Cardigan rajut halus dengan kancing alami dan saku samping. Lapisan ringan yang sempurna untuk pagi sejuk atau ruangan ber-AC.",
    details: [
      "Merino wool blend yang lembut",
      "Kancing alami 18 mm",
      "Ribbed hem dan cuff",
      "Perawatan: hand wash atau dry clean",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviewCount: 29,
    createdAt: "2026-03-15",
  },
  {
    id: 9,
    slug: "denim-shirt",
    name: "Denim Shirt",
    category: "Shirts",
    price: 329_000,
    tag: "POPULAR",
    image: "/products/denim-shirt.jpg",
    imageAlt: "Kemeja denim biru dengan potongan relaxed",
    tint: "#e4e7ea",
    description:
      "Kemeja denim dengan potongan relaxed dan warna washed yang mudah dipadukan. Bisa dipakai sebagai kemeja tunggal atau lapisan luar untuk gaya kasual sehari-hari.",
    details: [
      "100% cotton denim 6 oz",
      "Relaxed fit dengan drop shoulder",
      "Kancing logam anti-karat",
      "Dua saku dada dengan flap",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviewCount: 62,
    createdAt: "2026-03-20",
  },
  {
    id: 10,
    slug: "flight-bomber",
    name: "Flight Bomber",
    category: "Outerwear",
    price: 519_000,
    tag: "NEW ARRIVAL",
    image: "/products/flight-bomber.jpg",
    imageAlt: "Bomber jacket hijau dengan detail patch",
    tint: "#dfe4da",
    description:
      "Bomber jacket bergaya flight dengan detail patch dan siluet yang clean. Ringan, mudah dilipat, dan dirancang untuk menemani perjalanan tanpa memakan ruang.",
    details: [
      "Recycled nylon dengan lapisan ringan",
      "Ribbed cuff dan hem",
      "Dua saku dengan zipper",
      "Water-repellent finishing",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 21,
    createdAt: "2026-04-02",
  },
  {
    id: 11,
    slug: "ribbed-tank",
    name: "Ribbed Tank",
    category: "T-Shirts",
    price: 149_000,
    image: "/products/ribbed-tank-black.jpg",
    imageAlt: "Tank top ribbed hitam dengan scoop neck",
    tint: "#e4e6e8",
    description:
      "Tank top ribbed dengan potongan fitted yang nyaman. Layer sempurna di bawah kemeja atau dipakai tunggal saat cuaca panas.",
    details: [
      "Cotton rib 2x2 yang elastis",
      "Potongan fitted dengan scoop neck",
      "Jahitan rata untuk kenyamanan",
      "Tersedia dalam tiga warna netral",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviewCount: 38,
    createdAt: "2026-04-10",
  },
  {
    id: 12,
    slug: "tailored-shorts",
    name: "Tailored Shorts",
    category: "Bottoms",
    price: 259_000,
    image: "/products/tailored-shorts.jpg",
    imageAlt: "Celana pendek tailored hitam dipadukan kemeja putih",
    tint: "#e6e5e1",
    description:
      "Celana pendek dengan potongan tailored yang rapi, panjang di atas lutut. Nyaman untuk hari panas namun tetap terlihat teratur.",
    details: [
      "Cotton twill ringan",
      "Pinggang dengan karet tersembunyi",
      "Dua saku samping dan satu saku belakang",
      "Inseam 18 cm",
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.4,
    reviewCount: 17,
    createdAt: "2026-04-18",
  },
] as const;

export const CATEGORIES: readonly ProductCategory[] = [
  "T-Shirts",
  "Outerwear",
  "Bottoms",
  "Knitwear",
  "Shirts",
  "Accessories",
];

export const ALL_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "All Size",
] as const;

export const PRODUCT_TAGS: readonly ProductTag[] = [
  "BESTSELLER",
  "NEW ARRIVAL",
  "POPULAR",
  "LIMITED",
];

export function getProductFromList(
  products: readonly Product[],
  slugOrId: string,
): Product | undefined {
  const bySlug = products.find((product) => product.slug === slugOrId);
  if (bySlug) return bySlug;

  if (/^\d+$/.test(slugOrId)) {
    return products.find((product) => product.id === Number(slugOrId));
  }

  return undefined;
}

export function getRelatedProducts(
  products: readonly Product[],
  product: Product,
  limit = 4,
): Product[] {
  const seenImages = new Set<string>([product.image]);

  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id && candidate.category === product.category,
    )
    .concat(products.filter((candidate) => candidate.id !== product.id))
    .filter((candidate, index, list) => {
      if (list.findIndex((item) => item.id === candidate.id) !== index) {
        return false;
      }

      if (seenImages.has(candidate.image)) {
        return false;
      }

      seenImages.add(candidate.image);
      return true;
    })
    .slice(0, limit);
}

export function getFeaturedProducts(
  products: readonly Product[],
  limit = 4,
): Product[] {
  return products.filter((product) => product.featured).slice(0, limit);
}

export function getNewArrivals(
  products: readonly Product[],
  limit = 8,
): Product[] {
  return [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function isProductSize(size: string): boolean {
  return (ALL_SIZES as readonly string[]).includes(size);
}
