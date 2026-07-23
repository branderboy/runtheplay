import Link from "next/link";
import { CHARTS, computeChart, CHART_WEEK } from "@/lib/charts";
import { ChartTable } from "@/components/chart-table";

export const metadata = {
  title: "Charts",
  description:
    "Weekly rankings of Black-creator podcasts — who's biggest, who's everywhere, sourced and dated.",
};

export default function ChartsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange">
        The Charts · {CHART_WEEK}
      </p>
      <h1 className="max-w-2xl text-balance text-3xl font-extrabold sm:text-4xl">
        The numbers behind the culture's podcasts.
      </h1>
      <p className="mt-3 max-w-2xl text-ink-dim">
        Every ranking is computed from stored public data and dated — the same
        records that power the profiles, so a number never says one thing here
        and another there. Growth and engagement charts arrive as weekly
        snapshots build up.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {CHARTS.map((c) => {
          const entries = computeChart(c.slug);
          return (
            <section key={c.slug}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-lg font-bold">{c.title}</h2>
                  <p className="text-sm text-ink-dim">{c.subtitle}</p>
                </div>
                <Link href={`/charts/${c.slug}`} className="flex-none text-sm text-orange">
                  Full chart →
                </Link>
              </div>
              <ChartTable entries={entries} metricLabel={c.metricLabel} limit={5} />
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-ink-faint">
        Chart positions are earned by the numbers and cannot be purchased. See{" "}
        <Link href="/legal/ranking" className="text-orange">
          how ranking works
        </Link>
        .
      </p>
    </div>
  );
}
