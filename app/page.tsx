
import {
  ArrowDownRight,
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Essential Boxy Tee",
    category: "T-Shirts",
    price: "Rp 189.000",
    tag: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e9e5dc]",
  },
  {
    id: 2,
    name: "Utility Overshirt",
    category: "Outerwear",
    price: "Rp 429.000",
    tag: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e6e3dc]",
  },
  {
    id: 3,
    name: "Relaxed Straight Pants",
    category: "Bottoms",
    price: "Rp 349.000",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e8e5df]",
  },
  {
    id: 4,
    name: "Everyday Knit",
    category: "T-Shirts",
    price: "Rp 279.000",
    tag: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=85",
    color: "bg-[#e6e3dc]",
  },
];

const categories = ["All Products", "T-Shirts", "Outerwear", "Bottoms"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20211f]">
      {/* Announcement */}
      <div className="flex min-h-9 items-center justify-center bg-[#20211f] px-4 text-center text-[10px] tracking-[0.16em] text-white sm:text-[11px]">
        EVERYDAY ESSENTIALS, MADE TO LAST.
        <span className="mx-2 text-[#c7cbb9]">·</span>
        DISCOVER THE COLLECTION
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#20211f]/10 bg-[#f5f3ee]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 lg:gap-8">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex items-center justify-center lg:hidden"
            >
              <Menu size={21} strokeWidth={1.6} />
            </button>

            <a
              href="/"
              className="text-[21px] font-black tracking-[-0.08em] sm:text-[25px]"
            >
              CRAWLFAST<span className="text-[#59634b]">.</span>
            </a>

            <nav className="hidden items-center gap-6 text-[11px] font-medium tracking-[0.08em] lg:flex">
              <a href="#collection" className="transition-colors hover:text-[#59634b]">
                SHOP ALL
              </a>
              <a href="#collection" className="transition-colors hover:text-[#59634b]">
                NEW ARRIVALS
              </a>
              <a href="#about" className="transition-colors hover:text-[#59634b]">
                OUR STORY
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              aria-label="Search products"
              className="transition-colors hover:text-[#59634b]"
            >
              <Search size={20} strokeWidth={1.6} />
            </button>
            <a
              href="/account"
              aria-label="Account"
              className="hidden transition-colors hover:text-[#59634b] sm:block"
            >
              <UserRound size={20} strokeWidth={1.6} />
            </a>
            <a
              href="/cart"
              aria-label="Shopping bag"
              className="transition-colors hover:text-[#59634b]"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
            </a>
          </div>
        </div>
      </header>

      {/* Compact hero */}
      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 pb-10 pt-9 sm:px-8 sm:pt-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-12 lg:px-12 lg:pb-14 lg:pt-12">
        <div className="flex flex-col items-start">
          <p className="mb-4 text-[10px] font-semibold tracking-[0.24em] text-[#59634b] sm:text-[11px]">
            CRAWLFAST / COLLECTION 001
          </p>

          <h1 className="max-w-xl text-[43px] font-medium leading-[0.99] tracking-[-0.065em] sm:text-6xl lg:text-[76px]">
            Less, but
            <br />
            <span className="font-serif italic">better.</span>
            <br />
            Made for every day.
          </h1>

          <p className="mt-5 max-w-md text-[13px] leading-6 text-[#66665e] sm:text-sm">
            Everyday essentials for every version of you. Thoughtful
            silhouettes, versatile layers, and pieces that feel like you.
          </p>

          <a
            href="#collection"
            className="group mt-7 inline-flex min-h-12 items-center gap-7 bg-[#20211f] px-5 text-[10px] font-semibold tracking-[0.14em] text-white transition-colors hover:bg-[#59634b]"
          >
            EXPLORE COLLECTION
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>

          <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.1em] text-[#77776f]">
            <span className="h-px w-8 bg-[#59634b]" />
            DESIGNED FOR YOUR EVERYDAY
          </div>
        </div>

        <a
          href="#collection"
          className="group relative block overflow-hidden bg-[#e8e5dc]"
        >
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85"
            alt="Editorial fashion collection"
            className="h-[250px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] sm:h-[340px] lg:h-[365px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-end justify-between right-5 text-white sm:bottom-7 sm:left-7 sm:right-7">
            <div>
              <p className="text-[9px] tracking-[0.2em]">THE NEW EDIT</p>
              <p className="mt-1 text-xl tracking-tight sm:text-2xl">
                Everyday, redefined.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 transition-colors group-hover:bg-white group-hover:text-[#20211f]">
              <ArrowDownRight size={19} />
            </span>
          </div>
        </a>
      </section>

      {/* Brand values */}
      <section className="border-y border-[#20211f]/10">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-4 px-5 py-5 sm:px-8 lg:grid-cols-4 lg:px-12">
          {[
            "DESIGNED FOR EVERYDAY",
            "VERSATILE BY NATURE",
            "LESS, BETTER PIECES",
            "YOUR STYLE, YOUR RULES",
          ].map((item) => (
            <p
              key={item}
              className="text-[9px] font-medium tracking-[0.13em] text-[#66665e] sm:text-[10px]"
            >
              <span className="mr-2 text-[#59634b]">✳</span>
              {item}
            </p>
          ))}
        </div>
      </section>

      {/* Product collection */}
      <section
        id="collection"
        className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12"
      >
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
              CURATED FOR YOU
            </p>
            <h2 className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
              Shop the collection
            </h2>
            <p className="mt-2 text-xs text-[#77776f] sm:text-sm">
              Pieces you will keep reaching for.
            </p>
          </div>

          <a
            href="/shop"
            className="hidden items-center gap-2 pb-1 text-[10px] font-semibold tracking-[0.1em] sm:inline-flex"
          >
            VIEW ALL <ArrowRight size={14} />
          </a>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <a
              key={category}
              href="/shop"
              className={`shrink-0 border px-4 py-2.5 text-[10px] tracking-[0.04em] transition-colors ${
                index === 0
                  ? "border-[#20211f] bg-[#20211f] text-white"
                  : "border-[#20211f]/15 text-[#55564f] hover:border-[#20211f]"
              }`}
            >
              {category}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product) => (
            <article key={product.id} className="group min-w-0">
              <a
                href={`/products/${product.id}`}
                className={`relative block overflow-hidden ${product.color}`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>

                {product.tag && (
                  <span className="absolute left-2 top-2 bg-[#f5f3ee] px-2 py-1 text-[8px] font-semibold tracking-[0.08em] sm:left-3 sm:top-3 sm:text-[9px]">
                    {product.tag}
                  </span>
                )}

                <button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f3ee]/90 transition-colors hover:bg-white sm:right-3 sm:top-3"
                >
                  <Heart size={15} strokeWidth={1.6} />
                </button>

                <div className="absolute inset-x-2 bottom-2 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
                  <span className="flex h-10 items-center justify-center bg-[#f5f3ee]/95 text-[10px] font-semibold tracking-[0.1em]">
                    VIEW PRODUCT
                  </span>
                </div>
              </a>

              <div className="pt-3">
                <p className="mb-1 text-[9px] tracking-[0.08em] text-[#77776f] sm:text-[10px]">
                  {product.category}
                </p>
                <a
                  href={`/products/${product.id}`}
                  className="block text-[12px] font-medium leading-5 sm:text-sm"
                >
                  {product.name}
                </a>
                <p className="mt-1.5 text-[11px] font-semibold sm:text-xs">
                  {product.price}
                </p>
              </div>
            </article>
          ))}
        </div>

        <a
          href="/shop"
          className="mt-8 flex min-h-12 w-full items-center justify-center gap-3 border border-[#20211f]/20 text-[10px] font-semibold tracking-[0.13em] transition-colors hover:bg-[#20211f] hover:text-white sm:hidden"
        >
          VIEW ALL PRODUCTS <ArrowRight size={15} />
        </a>
      </section>

      {/* Brand statement */}
      <section
        id="about"
        className="bg-[#e8e5dc] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#59634b]">
              THE CRAWLFAST PHILOSOPHY
            </p>
            <h2 className="max-w-xl text-3xl leading-tight tracking-[-0.05em] sm:text-4xl">
              Good style starts with
              <br />
              <span className="font-serif italic">knowing what matters.</span>
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-6 text-[#66665e] sm:text-sm">
            Wear what feels right. Build a wardrobe around pieces that work
            together, move with you, and stay relevant beyond the season.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#20211f] px-5 py-9 text-white sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <a href="/" className="text-2xl font-black tracking-[-0.08em]">
              CRAWLFAST<span className="text-[#aab19a]">.</span>
            </a>
            <p className="mt-3 text-[11px] text-white/55">
              Everyday essentials. Uncomplicated style.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] tracking-[0.08em] text-white/75">
            <a href="/shop" className="hover:text-white">SHOP</a>
            <a href="/account" className="hover:text-white">MY ACCOUNT</a>
            <a href="/cart" className="hover:text-white">CART</a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-[1440px] border-t border-white/15 pt-5 text-[10px] text-white/45">
          © 2026 CRAWLFAST. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </main>
  );
}
