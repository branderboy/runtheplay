import Link from "next/link";
import { getPlaysByTier, money, type Play } from "@/lib/data/plays";

export const metadata = {
  title: "Plays to Run",
  description:
    "Ready-made campaign examples by business type and budget. Study them, then make one yours.",
};

const tierBlurb: Record<string, string> = {
  Starter: "Local businesses and first-time buyers — small budgets, real reach.",
  Growth: "Brands and apps scaling with regional and national culture audiences.",
  Pro: "Bigger pushes built on sponsorship and repetition inside trusted voices.",
  National: "Assemble many loyal culture audiences into one national campaign.",
};

export default function PlaysPage() {
  const groups = getPlaysByTier();
  const total = groups.reduce((n, g) => n + g.plays.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange">
        Plays to Run
      </p>
      <h1 className="max-w-2xl text-balance text-3xl font-extrabold sm:text-4xl">
        See the play. Understand the strategy. Make it yours.
      </h1>
      <p className="mt-3 max-w-2xl text-ink-dim">
        {total} ready-made campaign examples across business types and budgets.
        Each shows the objective, media mix, budget split, and why it works —
        then drops into the Ad Planner so you can customize it.
      </p>

      {groups.length === 0 && (
        <p className="mt-10 text-ink-faint">Plays are being prepared.</p>
      )}

      {groups.map((g) => (
        <section key={g.tier} className="mt-12">
          <div className="mb-1 flex items-baseline gap-3">
            <h2 className="text-xl font-bold">{g.tier}</h2>
            <span className="text-xs text-ink-faint">{g.plays.length} plays</span>
          </div>
          <p className="mb-5 text-sm text-ink-dim">{tierBlurb[g.tier]}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.plays.map((p) => (
              <PlayCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PlayCard({ p }: { p: Play }) {
  return (
    <Link
      href={`/plays/${p.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-navy-1 p-5 transition-colors hover:border-orange/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-extrabold tabular-nums text-orange">
          {money(p.budget)}
        </span>
        <span className="rounded-full border border-line bg-navy-2 px-2.5 py-0.5 text-[11px] font-semibold text-ink-dim">
          {p.businessType}
        </span>
      </div>
      <h3 className="text-[15px] font-bold leading-tight">{p.title}</h3>
      <p className="line-clamp-3 text-[13px] leading-snug text-ink-dim">
        {p.objective}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {p.mediaMix.slice(0, 4).map((m, i) => (
          <span
            key={i}
            className="rounded-md border border-line bg-navy-2 px-2 py-0.5 text-[10px] text-ink-dim"
          >
            {m.count}× {m.channel}
          </span>
        ))}
      </div>
    </Link>
  );
}
