import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-bold text-ink-dim">Run the Play</span> — Advertising
          Made Simple for the Culture.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/directory" className="hover:text-ink-dim">Directory</Link>
          <Link href="/charts" className="hover:text-ink-dim">Charts</Link>
          <Link href="/plan" className="hover:text-ink-dim">Ad Planner</Link>
          <Link href="/claim" className="hover:text-ink-dim">Claim a profile</Link>
          <Link href="/legal/ranking" className="hover:text-ink-dim">How ranking works</Link>
          <Link href="/legal/data-and-corrections" className="hover:text-ink-dim">Data & corrections</Link>
          <Link href="/legal/privacy" className="hover:text-ink-dim">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-ink-dim">Terms</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-10 text-xs text-ink-faint/70">
        Listings are built from public sources and shown unverified until a
        creator claims them. Prices and availability are set by each show, not by
        Run the Play. Estimated figures are labeled and are not quoted rates.
      </div>
    </footer>
  );
}
