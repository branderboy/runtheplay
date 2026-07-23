import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CHARTS,
  getChart,
  computeChart,
  CHART_WEEK,
  CAPTURE_DATE,
} from "@/lib/charts";
import { ChartTable } from "@/components/chart-table";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return CHARTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getChart(slug);
  return c ? { title: c.title, description: c.subtitle } : { title: "Chart" };
}

export default async function ChartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getChart(slug);
  if (!c) notFound();
  const entries = computeChart(slug);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${c.title} — ${CHART_WEEK}`,
          url: `${SITE_URL}/charts/${c.slug}`,
          itemListElement: entries.map((e) => ({
            "@type": "ListItem",
            position: e.rank,
            name: e.name,
            url: `${SITE_URL}/podcast/${e.slug}`,
          })),
        }}
      />
      <Link href="/charts" className="text-sm text-ink-faint hover:text-ink-dim">
        ← All charts
      </Link>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-orange">
        {CHART_WEEK}
      </p>
      <h1 className="mt-1 text-balance text-3xl font-extrabold">{c.title}</h1>
      <p className="mt-2 text-ink-dim">{c.subtitle}</p>

      <div className="mt-8">
        <ChartTable entries={entries} metricLabel={c.metricLabel} />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-navy-2 p-5 text-sm text-ink-dim">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Methodology
        </h2>
        <p>{c.methodology}</p>
        <p className="mt-2 text-xs text-ink-faint">
          Source: public platform data · Captured {CAPTURE_DATE} · Positions
          cannot be purchased.
        </p>
      </div>
    </div>
  );
}
