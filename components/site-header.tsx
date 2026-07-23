import Link from "next/link";
import { Wordmark } from "./brand";

const nav = [
  { href: "/plan", label: "Ad Planner" },
  { href: "/charts", label: "Charts" },
  { href: "/plays", label: "Plays to Run" },
  { href: "/directory", label: "Explore Podcasts" },
  { href: "/claim", label: "Claim" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Run the Play home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-white/70 transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/plan"
            className="rounded-lg bg-orange px-3.5 py-2 text-[13px] font-bold uppercase tracking-wide text-navy"
          >
            Start Planning
          </Link>
        </nav>
      </div>
    </header>
  );
}
