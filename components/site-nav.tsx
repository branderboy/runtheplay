"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/plan", label: "Ad Planner" },
  { href: "/charts", label: "Charts" },
  { href: "/plays", label: "Plays to Run" },
  { href: "/directory", label: "Explore Podcasts" },
  { href: "/claim", label: "Claim" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Main">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={
              isActive(n.href)
                ? "font-semibold text-white"
                : "text-white/70 transition-colors hover:text-white"
            }
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

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex items-center justify-center rounded-lg p-2 text-white md:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* Mobile menu panel */}
      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-white/10 bg-navy md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-base ${
                  isActive(n.href) ? "bg-white/10 font-semibold text-white" : "text-white/80"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/plan"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-orange px-3 py-3 text-center text-sm font-bold uppercase tracking-wide text-navy"
            >
              Start Planning
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
