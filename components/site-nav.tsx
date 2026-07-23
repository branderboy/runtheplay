"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/plan", label: "Planner" },
  { href: "/charts", label: "Charts" },
  { href: "/plays", label: "Plays" },
  { href: "/directory", label: "Directory" },
  { href: "/creators", label: "For Creators" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop nav */}
      <nav
        className="hidden items-center space-x-8 md:flex lg:space-x-10"
        aria-label="Main"
      >
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              isActive(n.href)
                ? "text-sky-400"
                : "text-white/70 hover:text-sky-400"
            }`}
          >
            {n.label}
          </Link>
        ))}
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
          className="absolute inset-x-0 top-full border-b border-white/10 bg-navy shadow-xl md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest ${
                  isActive(n.href)
                    ? "bg-white/10 text-sky-400"
                    : "text-white/80"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/plan"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3.5 text-center text-xs font-black uppercase tracking-widest text-white"
            >
              Start Planning
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
