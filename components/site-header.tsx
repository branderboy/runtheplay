import Link from "next/link";
import { Wordmark } from "./brand";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Run the Play home">
          <Wordmark />
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
