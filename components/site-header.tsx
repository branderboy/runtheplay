import Link from "next/link";
import { Wordmark } from "./brand";
import { SiteNav } from "./site-nav";
import { CartButton } from "./basket";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-navy shadow-xl">
      <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Run the Play home"
          className="flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <Wordmark />
        </Link>
        <SiteNav />
        <div className="flex items-center gap-2">
          <CartButton />
          <Link
            href="/plan"
            className="hidden rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5 sm:block"
          >
            Start Planning
          </Link>
        </div>
      </div>
    </header>
  );
}
