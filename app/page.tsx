import Link from "next/link";
import { getAllPodcasts, listCategories } from "@/lib/data/podcasts";
import { getAllPlays, money } from "@/lib/data/plays";
import { computeChart, CHART_WEEK } from "@/lib/charts";
import { PodcastCard } from "@/components/podcast-card";
import { ChartTable } from "@/components/chart-table";
import { NewsletterSignup } from "@/components/newsletter-signup";

export default function HomePage() {
  const podcasts = getAllPodcasts();
  const featured = podcasts.slice(0, 6);
  const categories = listCategories();
  const plays = getAllPlays();
  const samplePlays = [
    plays.find((p) => p.tier === "Starter"),
    plays.find((p) => p.tier === "Growth"),
    plays.find((p) => p.tier === "Pro"),
  ].filter(Boolean).slice(0, 3);
  const topChart = computeChart("youtube-subscribers").slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange">
            Advertising Made Simple for the Culture
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Build a podcast ad plan with Black creators.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-dim">
            Tell us your goal, audience, and budget. Run the Play organizes the
            right hip-hop and culture podcasts — reach, formats, and how to
            contact them directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="rounded-lg bg-orange px-6 py-3 text-sm font-bold uppercase tracking-wide text-navy"
            >
              Start Planning
            </Link>
            <Link
              href="/directory"
              className="rounded-lg border border-line px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:border-orange/50"
            >
              Explore Podcasts
            </Link>
          </div>
          <p className="mt-6 text-sm text-ink-faint">
            {podcasts.length} shows and counting · {categories.length} categories
          </p>
        </div>

        {/* Live mini-chart */}
        {topChart.length > 0 && (
          <div className="rounded-3xl border border-line bg-navy-1 p-5 shadow-sm">
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  Top YouTube Subscribers
                </h2>
                <p className="text-xs text-ink-faint">{CHART_WEEK}</p>
              </div>
              <Link href="/charts" className="text-sm text-orange">
                All charts →
              </Link>
            </div>
            <ChartTable entries={topChart} metricLabel="Subs" />
          </div>
        )}
      </section>

      {/* Featured shows */}
      <section className="py-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Recently added</h2>
          <Link href="/directory" className="text-sm text-orange">
            See all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PodcastCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* Plays to Run */}
      {samplePlays.length > 0 && (
        <section className="py-10">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <h2 className="text-xl font-bold">Plays to Run</h2>
              <p className="mt-1 text-sm text-ink-dim">
                Not sure where to start? Copy a proven campaign for your budget.
              </p>
            </div>
            <Link href="/plays" className="text-sm text-orange">
              All plays →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {samplePlays.map((p) => (
              <Link
                key={p!.slug}
                href={`/plays/${p!.slug}`}
                className="flex flex-col gap-2 rounded-2xl border border-line bg-navy-1 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-md"
              >
                <span className="text-2xl font-extrabold tabular-nums text-orange">
                  {money(p!.budget)}
                </span>
                <h3 className="text-[15px] font-bold leading-tight">{p!.title}</h3>
                <p className="line-clamp-2 text-[13px] text-ink-dim">{p!.objective}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Keep in the loop */}
      <section className="my-16 rounded-3xl border border-line bg-navy-2 p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold">Keep in the loop</h2>
            <p className="mt-3 text-ink-dim">
              Weekly charts, new shows open to advertising, and budget-based
              campaign ideas — the culture's media, in your inbox.
            </p>
          </div>
          <NewsletterSignup edition="buyer" />
        </div>
      </section>

      {/* Creator CTA */}
      <section className="mb-8 flex flex-col items-start gap-4 rounded-3xl border border-orange/30 bg-orange/5 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Are you a creator?</h2>
          <p className="mt-2 max-w-xl text-ink-dim">
            Listing is free. Claim your profile to control your info, add your
            advertising options, and choose how brands reach you.
          </p>
        </div>
        <Link
          href="/claim"
          className="flex-none rounded-lg bg-orange px-6 py-3 text-sm font-bold uppercase tracking-wide text-navy"
        >
          Claim Your Profile
        </Link>
      </section>
    </div>
  );
}
