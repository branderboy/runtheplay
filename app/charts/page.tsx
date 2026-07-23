import Link from "next/link";
import { CHARTS, computeChart, CHART_WEEK } from "@/lib/charts";
import { ChartTable } from "@/components/chart-table";

export const metadata = {
  title: "Charts",
  description:
    "Weekly rankings of Black-creator podcasts. Who's biggest, who's everywhere, sourced and dated.",
};

export default function ChartsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
        The Charts · {CHART_WEEK}
      </p>
      <h1 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
        The numbers behind the culture's podcasts.
      </h1>
      <p className="mt-3 max-w-2xl text-ink-dim">
        Every ranking is computed from stored public data and dated. Same records as the profiles. Growth charts unlock as weekly snapshots build.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {CHARTS.map((c) => {
          const entries = computeChart(c.slug);
          if (entries.length === 0) return null;
          return (
            <section key={c.slug}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-lg font-bold">{c.title}</h2>
                  <p className="text-sm text-ink-dim">{c.subtitle}</p>
                </div>
                <Link href={`/charts/${c.slug}`} className="flex-none text-sm font-semibold text-ink-dim hover:text-ink">
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
        <Link href="/legal/ranking" className="font-semibold text-ink underline underline-offset-2">
          how ranking works
        </Link>
        .
      </p>
    </div>
  );
}
