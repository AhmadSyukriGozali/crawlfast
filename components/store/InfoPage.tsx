import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InfoPage({
  eyebrow,
  title,
  accent,
  description,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="container-page pb-16 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-sage"
      >
        <ArrowLeft size={14} />
        Beranda
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-4 max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
          {title}
          {accent && (
            <>
              {" "}
              <span className="serif-accent">{accent}</span>
            </>
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft">
          {description}
        </p>
      </header>

      <div className={`mt-8 ${wide ? "" : "max-w-3xl"}`}>{children}</div>
    </div>
  );
}
