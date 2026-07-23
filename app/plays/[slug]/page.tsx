import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllPlays,
  getPlayBySlug,
  plannerLink,
  money,
} from "@/lib/data/plays";

export function generateStaticParams() {
  return getAllPlays().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPlayBySlug(slug);
  if (!p) return { title: "Play not found" };
  return { title: p.title, description: p.objective };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPlayBySlug(slug);
  if (!p) notFound();

  const allocTotal = p.budgetAllocation.reduce((n, a) => n + a.amount, 0);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/plays" className="text-sm text-ink-faint hover:text-ink-dim">
        ← Plays to Run
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-3xl font-extrabold tabular-nums text-orange">
          {money(p.budget)}
        </span>
        <span className="rounded-full border border-line bg-navy-2 px-3 py-1 text-xs font-semibold text-ink-dim">
          {p.businessType}
        </span>
        <span className="rounded-full border border-line bg-navy-2 px-3 py-1 text-xs font-semibold text-ink-dim">
          {p.tier} · {p.geography}
        </span>
      </div>

      <h1 className="mt-3 text-balance text-3xl font-extrabold">{p.title}</h1>
      <p className="mt-3 text-lg text-ink-dim">{p.objective}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {p.audienceTags.map((t) => (
          <span key={t} className="rounded-lg border border-line bg-navy-2 px-3 py-1 text-sm">
            {t}
          </span>
        ))}
      </div>

      {/* Media mix */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Recommended media mix
        </h2>
        <div className="flex flex-col divide-y divide-line-soft overflow-hidden rounded-2xl border border-line">
          {p.mediaMix.map((m, i) => (
            <div key={i} className="flex items-start justify-between gap-4 bg-navy-1 px-5 py-4">
              <div>
                <div className="font-semibold">{m.channel}</div>
                <div className="mt-0.5 text-sm text-ink-dim">{m.detail}</div>
              </div>
              <div className="flex-none text-lg font-extrabold tabular-nums text-orange">
                {m.count}×
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Budget allocation */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Budget allocation
        </h2>
        <div className="overflow-hidden rounded-2xl border border-line">
          {p.budgetAllocation.map((a, i) => {
            const pct = Math.round((a.amount / allocTotal) * 100);
            return (
              <div key={i} className="bg-navy-1 px-5 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{a.label}</span>
                  <span className="tabular-nums text-ink-dim">
                    {money(a.amount)} · {pct}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-2">
                  <div className="h-full bg-orange" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between bg-navy-2 px-5 py-3 text-sm font-bold">
            <span>Total</span>
            <span className="tabular-nums">{money(allocTotal)}</span>
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Why this works
        </h2>
        <p className="text-ink-dim">{p.whyItWorks}</p>
        {p.restrictionsNote && (
          <p className="mt-3 rounded-xl border border-orange/30 bg-orange/5 px-4 py-3 text-sm text-ink-dim">
            <strong className="text-ink">Note:</strong> {p.restrictionsNote}
          </p>
        )}
      </section>

      {/* CTAs */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href={plannerLink(p)}
          className="rounded-lg bg-orange px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-navy"
        >
          Customize this play
        </Link>
        {p.shopCategories.map((c) => (
          <Link
            key={c}
            href={`/directory?category=${encodeURIComponent(c)}`}
            className="rounded-lg border border-line px-6 py-3 text-center text-sm font-bold uppercase tracking-wide hover:border-orange/50"
          >
            Shop {c}
          </Link>
        ))}
      </div>
    </div>
  );
}
