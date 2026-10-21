import Link from "next/link";

export default function Logo({
  className = "",
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="CRAWLFAST — beranda"
      className={`inline-flex items-baseline text-[22px] font-black leading-none tracking-[-0.075em] sm:text-[26px] ${inverted ? "text-white" : "text-ink"} ${className}`}
    >
      CRAWLFAST
      <span
        aria-hidden="true"
        className={inverted ? "text-sage-light" : "text-sage"}
      >
        .
      </span>
    </Link>
  );
}
