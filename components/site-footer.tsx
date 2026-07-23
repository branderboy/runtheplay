import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 overflow-hidden border-t border-sky-50 bg-white py-24 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-20 text-center md:text-left">
          <div className="pointer-events-none absolute -left-10 top-[-50%] h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
          <h2 className="display relative z-10 mb-8 text-[14vw] leading-[0.85] text-ink md:text-[8rem]">
            RUN THE{" "}
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
              PLAY.
            </span>
          </h2>
          <p className="display relative z-10 max-w-3xl text-2xl leading-snug tracking-tight text-slate-300 md:text-4xl">
            Your budget does not have to be massive.
            <br />
            <span className="text-ink">Your plan has to be smart.</span>
          </p>
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-10 border-t-2 border-sky-50 pt-12 md:flex-row md:items-end">
          <nav className="flex flex-wrap gap-x-8 gap-y-4 md:gap-x-12" aria-label="Footer">
            <Link href="/plan" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Planner</Link>
            <Link href="/charts" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Charts</Link>
            <Link href="/plays" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Plays</Link>
            <Link href="/directory" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Directory</Link>
            <Link href="/claim" className="text-xs font-black uppercase tracking-widest text-sky-500 transition-colors hover:text-sky-600">Claim Profile</Link>
            <Link href="/legal/ranking" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">How Ranking Works</Link>
            <Link href="/legal/data-and-corrections" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Data &amp; Corrections</Link>
            <Link href="/legal/privacy" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Privacy</Link>
            <Link href="/legal/terms" className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500">Terms</Link>
          </nav>
          <div className="rounded-full bg-sky-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-ink-faint">
            © 2026 Run the Play
          </div>
        </div>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-ink-faint">
          Listings are built from public sources and shown unverified until a
          creator claims them. Prices and availability are set by each show, not
          by Run the Play. Estimated figures are labeled and are not quoted
          rates.
        </p>
      </div>
    </footer>
  );
}
