import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-bold text-ink-dim">Run the Play</span> — Advertising
          Made Simple for the Culture.
        </p>
        <nav className="flex gap-5">
          <Link href="/directory" className="hover:text-ink-dim">Directory</Link>
          <Link href="/plan" className="hover:text-ink-dim">Ad Planner</Link>
          <Link href="/claim" className="hover:text-ink-dim">Claim a profile</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-10 text-xs text-ink-faint/70">
        Listings are built from public sources and shown unverified until a
        creator claims them. Prices and availability are set by each show, not by
        Run the Play.
      </div>
    </footer>
  );
}
