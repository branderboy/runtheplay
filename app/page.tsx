import Link from "next/link";
import { getAllPodcasts, getPodcastBySlug, listCategories } from "@/lib/data/podcasts";
import { PlatformLogos } from "@/components/platform-logos";
import { getAllPlays, money } from "@/lib/data/plays";
import { computeChart } from "@/lib/charts";
import { listCategoryGroups } from "@/lib/categories";
import { thesis, partnerships } from "@/lib/data/thesis";
import { PodcastCard } from "@/components/podcast-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { CoverArt, CoverImage } from "@/components/cover-art";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export default function HomePage() {
  const podcasts = getAllPodcasts();
  const featured = podcasts.slice(0, 6);
  const categories = listCategories();
  const plays = getAllPlays();
  const samplePlays = [
    plays.find((p) => p.tier === "Starter"),
    plays.find((p) => p.tier === "Growth"),
    plays.find((p) => p.tier === "Pro"),
  ].filter((p): p is NonNullable<typeof p> => Boolean(p));
  const categoryGroups = listCategoryGroups().filter((c) => c.indexable);

  // Real aggregation demo: five actual mid-tier shows and their combined reach.
  const midTierShows = podcasts
    .map((p) => ({
      p,
      total: p.platforms.reduce((n, x) => n + (x.followers ?? 0), 0),
    }))
    .filter((x) => x.total >= 10_000 && x.total <= 700_000)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const combinedReach = midTierShows.reduce((n, x) => n + x.total, 0);

  const fmtCount = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : `${Math.round(n / 1e3)}K`;

  // Hero collage: real shows, real covers, real public numbers. Columns are
  // bottom-aligned so the stagger happens at the top and nothing gets clipped.
  const reachRank = new Map(
    computeChart("combined-reach").map((e) => [e.slug, e.rank]),
  );
  const heroTile = (
    slug: string,
    aspect: string,
    badge?: "subscribers" | "reach",
  ) => {
    const show = getPodcastBySlug(slug);
    if (!show) return null;
    const yt = show.platforms.find((x) => x.platform === "youtube")?.followers;
    const rank = reachRank.get(slug);
    const badgeData =
      badge === "subscribers" && yt
        ? { value: fmtCount(yt), label: "Subscribers" }
        : badge === "reach" && rank
          ? { value: `#${rank}`, label: "Reach" }
          : undefined;
    return { show, aspect, badge: badgeData };
  };
  const collageColumns = [
    [
      heroTile("the-read", "aspect-square"),
      heroTile("drink-champs", "aspect-[4/5]"),
      heroTile("therapy-for-black-girls", "aspect-square"),
    ],
    [
      heroTile("earn-your-leisure", "aspect-[4/5]", "subscribers"),
      heroTile("the-pivot-podcast", "aspect-[3/4]", "reach"),
    ],
    [
      heroTile("market-mondays", "aspect-square"),
      heroTile("club-shay-shay", "aspect-[4/5]", "subscribers"),
      heroTile("caresha-please", "aspect-square"),
    ],
  ].map((col) => col.filter((t): t is NonNullable<typeof t> => t !== null));

  // Receipts cluster: the actual shows brands bought, with real public numbers.
  const receiptShows = [
    { slug: "all-the-smoke", brand: "DraftKings" },
    { slug: "million-dollaz-worth-of-game", brand: "Barstool Sports" },
    { slug: "the-pivot-podcast", brand: "Fanatics" },
  ]
    .map(({ slug, brand }) => {
      const show = getPodcastBySlug(slug);
      if (!show) return null;
      const yt = show.platforms.find((x) => x.platform === "youtube")?.followers;
      return { show, brand, subs: yt ? fmtCount(yt) : null };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          slogan: "Advertising Made Simple for the Culture",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/directory?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* ------------------------------- Hero ------------------------------- */}
      <header className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 to-white pb-24 pt-16">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-blue-200/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center justify-center gap-3 rounded-full border border-sky-100 bg-sky-50 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600 shadow-sm lg:justify-start">
                The Urban Podcast Network
              </div>
              <h1 className="display mb-6 text-4xl leading-[1.05] text-ink md:text-5xl lg:text-[3.6rem]">
                Promote Your{" "}
                <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                  Brand
                </span>
                <br />
                Through the Podcasts Driving the Culture.
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg font-medium leading-relaxed tracking-tight text-ink-dim md:text-xl lg:mx-0">
                {thesis.story.heroSub}
              </p>
              <div className="flex items-center justify-center lg:justify-start">
                <Link
                  href="#campaign-builder"
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_-10px_rgba(14,165,233,0.6)] transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  Start Building
                </Link>
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-ink-faint">
                {thesis.story.publicLine}
              </p>
            </div>

            {/* Right: real-show collage, bottom-aligned so nothing clips */}
            <div className="relative mx-auto mt-10 w-full max-w-xl lg:mx-0 lg:ml-auto lg:mt-0">
              <div className="pointer-events-none absolute inset-4 z-0 scale-105 rounded-[3rem] bg-gradient-to-tr from-sky-400/20 to-blue-300/20 blur-2xl" />
              <div className="relative z-10 flex items-end justify-center gap-3 sm:gap-4">
                {collageColumns.map((col, ci) => (
                  <div key={ci} className="flex w-1/3 flex-col gap-3 sm:gap-4">
                    {col.map((t) => (
                      <HeroTile key={t.show.slug} tile={t} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --------------------- Platform logos strip --------------------- */}
      <PlatformLogos />

      {/* ------------------------ WHY WE EXIST — the thesis ------------------------ */}
      <section className="bg-white py-24" id="why">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
            Why We Exist
          </h2>
          <p className="display max-w-4xl text-3xl leading-[1.1] text-ink sm:text-5xl">
            {thesis.story.problem}
          </p>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-ink-dim">
            {thesis.positioning.premise}
          </p>
          <p className="mt-6 max-w-3xl border-l-4 border-sky-400 pl-5 text-lg font-bold leading-relaxed text-ink">
            {thesis.story.fragmentation}
          </p>

          {/* The receipts — why podcast ads work */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {thesis.whyItWorks.map((s) => (
              <div
                key={s.id}
                className="rounded-[1.5rem] border border-sky-50 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)]"
              >
                <div className="text-4xl font-black tracking-tighter text-sky-500">
                  {s.value}
                </div>
                <div className="mt-2 text-sm font-black uppercase tracking-tight text-ink">
                  {s.label}
                </div>
                <div className="mt-2 text-xs font-medium leading-relaxed text-ink-dim">
                  {s.detail}
                </div>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                  {s.source}
                </div>
              </div>
            ))}
          </div>

          {/* The arbitrage — CPM comparison */}
          <div className="mt-12 rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.2)] sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="mb-6">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-black uppercase tracking-tight text-ink-dim">
                      {thesis.arbitrage.outliers.label}
                    </span>
                    <span className="text-xl font-black tabular-nums text-ink-dim">
                      ${thesis.arbitrage.outliers.cpmLow}–${thesis.arbitrage.outliers.cpmHigh}{" "}
                      <span className="text-xs font-bold text-ink-faint">CPM</span>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-full rounded-full bg-slate-300" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-ink-faint">
                    {thesis.arbitrage.outliers.note}
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-black uppercase tracking-tight text-sky-600">
                      {thesis.arbitrage.midTier.label}
                    </span>
                    <span className="text-xl font-black tabular-nums text-sky-600">
                      ${thesis.arbitrage.midTier.cpmLow}–${thesis.arbitrage.midTier.cpmHigh}{" "}
                      <span className="text-xs font-bold text-sky-400">CPM</span>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      style={{
                        width: `${Math.round(
                          (thesis.arbitrage.midTier.cpmHigh /
                            thesis.arbitrage.outliers.cpmHigh) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-ink-faint">
                    {thesis.arbitrage.midTier.note}
                  </p>
                </div>
              </div>
              <div className="max-w-sm flex-none">
                <p className="text-lg font-medium leading-relaxed text-ink-dim">
                  {thesis.arbitrage.conclusion}
                </p>
                <p className="display mt-4 text-2xl text-ink">
                  Same trust engine.{" "}
                  <span className="text-orange">A fraction of the price.</span>
                  <br />
                  That's the play.
                </p>
              </div>
            </div>
          </div>

          {/* The aggregation play — real shows, real combined reach */}
          {midTierShows.length >= 3 && (
            <div className="mt-12">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                The Aggregation Play
              </h3>
              <p className="display mb-8 max-w-3xl text-2xl text-ink sm:text-3xl">
                {thesis.story.journey}
              </p>
              <div className="flex flex-wrap items-stretch gap-3">
                {midTierShows.map(({ p, total }, i) => (
                  <div key={p.slug} className="flex items-center gap-3">
                    <Link
                      href={`/podcast/${p.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-sky-50 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200"
                    >
                      <CoverArt name={p.name} slug={p.slug} artworkUrl={p.artworkUrl} size={40} radius={11} />
                      <span>
                        <span className="block max-w-36 truncate text-xs font-black uppercase tracking-tight text-ink">
                          {p.name}
                        </span>
                        <span className="text-xs font-bold tabular-nums text-ink-dim">
                          {fmtCount(total)} reach
                        </span>
                      </span>
                    </Link>
                    <span className="text-xl font-black text-ink-faint">
                      {i < midTierShows.length - 1 ? "+" : "="}
                    </span>
                  </div>
                ))}
                <div className="flex items-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.5)]">
                  <span>
                    <span className="block text-2xl font-black tabular-nums text-white">
                      {fmtCount(combinedReach)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                      combined reach
                    </span>
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-ink-faint">
                Five real shows. Public counts, combined. {thesis.story.power}
              </p>
            </div>
          )}

          <p className="mt-10 text-[11px] font-bold uppercase tracking-widest text-ink-faint">
            Sources: {thesis.sources.join(" · ")}
          </p>
        </div>
      </section>

      {/* ------------------------- Campaign builder ------------------------- */}
      <section
        id="campaign-builder"
        className="relative z-40 mx-auto mb-20 mt-14 max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        {/* Campaign builder — Step 1 of the real planning flow: pick your goal */}
        <p className="mb-6 text-center text-sm font-black uppercase tracking-widest text-ink-dim">
          The Fastest Way to Discover, Compare, and Plan Advertising Across
          Black Podcasts
        </p>
        <div className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.3)] sm:p-10">
          <div className="mb-8 text-center">
            <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-sky-500">
              Step 1 of 4
            </p>
            <h2 className="display text-3xl text-ink sm:text-4xl">
              What are you promoting?
            </h2>
            <p className="mt-2 font-medium text-ink-dim">
              Pick a goal. Budget and audience next. Then your plan.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["brand_awareness", "Brand Awareness", "Get Your Name in the Culture"],
              ["product_launch", "Product Launch", "Drop Something New"],
              ["music_release", "Music Release", "Push a Single or Project"],
              ["event_promotion", "Event Promotion", "Fill the Room"],
              ["local_business", "Local Business", "Own Your City"],
              ["lead_generation", "Lead Generation", "Drive Signups & Sales"],
            ].map(([value, label, blurb]) => (
              <Link
                key={value}
                href={`/plan?goal=${value}`}
                className="flex items-center gap-4 rounded-2xl border border-sky-50 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_10px_30px_-15px_rgba(14,165,233,0.4)]"
              >
                <span>
                  <span className="block font-black uppercase tracking-tight text-ink">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-ink-dim">{blurb}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-ink-faint">
          <span>Try a play:</span>
          {[
            ["$500 Local Business", "/plan?goal=local_business&budget=500&audience=local culture"],
            ["$1,500 Music Release", "/plan?goal=music_release&budget=1500&audience=hip-hop, music fans"],
            ["$5,000 Product Launch", "/plan?goal=product_launch&budget=5000&audience=entrepreneurs, investing"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 transition-colors hover:border-sky-300 hover:text-sky-500"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- This week's charts — 3 side by side ---------------- */}
      <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
              This Week's Charts
            </h2>
            <p className="display text-3xl text-ink sm:text-4xl">
              The numbers behind the culture.
            </p>
          </div>
          <Link
            href="/charts"
            className="text-sm font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500"
          >
            All charts →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ["youtube-subscribers", "Top YouTube Subscribers", "Subs"],
            ["instagram-followers", "Top Instagram Followers", "Followers"],
            ["combined-reach", "Biggest Combined Reach", "Total"],
          ].map(([slug, title, unit]) => {
            const entries = computeChart(slug).slice(0, 5);
            return (
              <div
                key={slug}
                className="rounded-[2rem] border border-sky-50 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)]"
              >
                <h3 className="mb-4 px-1 text-sm font-black uppercase tracking-tight text-ink">
                  {title}
                </h3>
                <ol>
                  {entries.map((e) => (
                    <li key={e.slug}>
                      <Link
                        href={`/podcast/${e.slug}`}
                        className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-sky-50/60"
                      >
                        <span className="w-5 text-center text-base font-black tabular-nums text-sky-500">
                          {e.rank}
                        </span>
                        <CoverArt name={e.name} slug={e.slug} artworkUrl={e.artworkUrl} size={36} radius={10} />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-black uppercase tracking-tight text-ink">
                          {e.name}
                        </span>
                        <span className="flex-none text-[13px] font-black tabular-nums text-ink">
                          {e.display}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link
                  href={`/charts/${slug}`}
                  className="mt-4 block rounded-full bg-sky-50 py-2.5 text-center text-[11px] font-black uppercase tracking-widest text-sky-600 transition-colors hover:bg-sky-500 hover:text-white"
                >
                  Full {unit} chart →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------- 01 / Directory -------------------------- */}
      <section className="bg-white py-16" id="directory-preview">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 border-b border-sky-50 pb-8 md:flex-row md:items-end">
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                01 / The Directory
              </h2>
              <h3 className="display text-4xl text-ink md:text-6xl">
                Your media mix.
              </h3>
              <p className="mt-4 max-w-2xl text-base font-medium text-ink-dim">
                Finding Black podcasts shouldn't take scrolling Instagram,
                searching YouTube, and emailing creators one by one. We help
                advertisers find the right audience faster.
              </p>
              <p className="mt-3 text-lg font-black uppercase tracking-tight text-ink">
                Less Searching. Better Ad Placements.
              </p>
            </div>
            <Link
              href="/directory"
              className="text-sm font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500"
            >
              All {podcasts.length} creators →
            </Link>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            {[
              "Discover by Audience and Category",
              "Compare Sponsorship Opportunities",
              "Request Campaigns Directly",
              "Build Media Plans Faster",
              "Trusted Voices, Engaged Listeners",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PodcastCard key={p.slug} p={p} />
            ))}
          </div>

          {categoryGroups.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3">
              {categoryGroups.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-ink-dim transition-colors hover:border-sky-300 hover:text-sky-500"
                >
                  {c.name} <span className="text-ink-faint">{c.shows.length}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------- 02 / Plays to Run ------------------------- */}
      <section className="bg-sky-50/30 py-24" id="plays-preview">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                02 / Plays to Run
              </h2>
              <h3 className="display text-5xl text-ink md:text-7xl">
                Study the strategy.
              </h3>
            </div>
            <p className="max-w-sm text-xl font-medium leading-relaxed text-ink-dim md:text-right">
              Ready-made campaign examples. See the play. Understand the
              strategy. Make it yours.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {samplePlays.map((p, i) => (
              <div
                key={p.slug}
                className="group flex h-full flex-col rounded-[2.5rem] border border-sky-50 bg-white p-10 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(14,165,233,0.2)]"
              >
                <div className="mb-8 inline-block self-start rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600">
                  Play 0{i + 1}
                </div>
                <div className="mb-3 text-5xl font-black tracking-tighter text-ink">
                  {money(p.budget)}
                </div>
                <h4 className="display mb-8 text-2xl text-ink">{p.title}</h4>
                <div className="mb-8">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                    Target audience
                  </span>
                  <span className="inline-block rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-black capitalize text-sky-700">
                    {p.audienceTags.slice(0, 2).join(" · ")}
                  </span>
                </div>
                <ul className="mt-auto space-y-3">
                  {p.mediaMix.slice(0, 3).map((m, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 rounded-xl border border-sky-50 bg-white p-3 text-sm font-bold text-ink-dim shadow-sm"
                    >
                      <span className="text-sky-500">✓</span>
                      {m.count}× {m.channel}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/plays/${p.slug}`}
                  className="mt-10 w-full rounded-full bg-sky-50 py-5 text-center text-sm font-black uppercase tracking-widest text-sky-700 transition-all hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white hover:shadow-lg"
                >
                  Customize Play
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/plays"
              className="text-sm font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500"
            >
              All {plays.length} plays →
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------- Real receipts — documented partnerships ----------------- */}
      <section className="bg-white py-24" id="receipts">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="max-w-3xl">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                The Receipts
              </h2>
              <p className="display text-4xl text-ink md:text-5xl">
                Big brands already run this play.
              </p>
              <p className="mt-4 text-lg font-medium text-ink-dim">
                Documented partnerships on culture podcasts. Every one sourced.
              </p>
            </div>

            {/* The actual shows the brands below bought, floating card style */}
            <div className="flex items-start justify-center gap-5 sm:gap-7 lg:justify-end">
              {receiptShows.map((r, i) => (
                <ReceiptCard
                  key={r.show.slug}
                  r={r}
                  className={i === 1 ? "mt-12" : i === 2 ? "mt-5" : ""}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partnerships.slice(0, 6).map((c) => (
              <div
                key={c.sourceUrl}
                className="flex h-full flex-col rounded-[2rem] border border-sky-50 bg-white p-7 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.12)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-lg font-black uppercase tracking-tight text-ink">
                    {c.brand}
                  </span>
                  {c.year && (
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-600">
                      {c.year}
                    </span>
                  )}
                </div>
                <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-sky-500">
                  × {c.show}
                </p>
                <p className="mb-4 text-sm font-medium leading-relaxed text-ink-dim">
                  {c.summary}
                </p>
                {c.outcome && (
                  <p className="mb-4 text-sm font-bold text-ink">{c.outcome}</p>
                )}
                <a
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-[11px] font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500"
                >
                  Source: {c.sourceTitle}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- 03 / The Loop --------------------------- */}
      <section className="relative overflow-hidden bg-white py-24" id="creators">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Brands: newsletter */}
            <div className="relative flex flex-col justify-center overflow-hidden rounded-[3rem] border border-sky-100 bg-white p-10 shadow-[0_20px_50px_-10px_rgba(14,165,233,0.05)] md:p-14">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ink-faint">
                03 / The Loop
              </h2>
              <h3 className="display mb-8 text-5xl text-ink lg:text-6xl">
                For
                <br />
                Brands
              </h3>
              <ul className="mb-10 space-y-5">
                {[
                  "New media opportunities",
                  "Weekly independent charts",
                  "Budget-based campaign ideas",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-4 text-lg font-bold uppercase tracking-tight text-ink-dim"
                  >
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-500">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <NewsletterSignup edition="buyer" />
            </div>

            {/* Creators: claim */}
            <div className="relative flex flex-col justify-center overflow-hidden rounded-[3rem] bg-gradient-to-br from-orange-400 to-orange-600 p-10 text-white shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] md:p-14 lg:-translate-y-6">
              <div className="mb-8 inline-flex items-center self-start rounded-full border border-white/30 bg-white/20 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
                Media Owners
              </div>
              <h3 className="display relative z-10 mb-6 text-5xl text-white drop-shadow-md lg:text-6xl">
                Was your show featured?
              </h3>
              <p className="relative z-10 mb-10 max-w-md text-xl font-medium leading-relaxed text-white/90">
                We already put your show in front of the market. Claim your
                profile free and control what they see next.
              </p>
              <Link
                href="/claim"
                className="relative z-10 self-start rounded-full bg-white px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-orange-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                Claim Free Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Hero collage tile: real cover, real name and hosts, optional real-number badge. */
function HeroTile({
  tile,
}: {
  tile: {
    show: {
      slug: string;
      name: string;
      artworkUrl: string | null;
      hosts: string[];
    };
    aspect: string;
    badge?: { value: string; label: string };
  };
}) {
  const { show, aspect, badge } = tile;
  return (
    <Link
      href={`/podcast/${show.slug}`}
      className={`group relative block overflow-hidden rounded-[1.25rem] border border-sky-50 bg-navy shadow-[0_20px_40px_-20px_rgba(14,165,233,0.35)] transition-transform duration-500 hover:-translate-y-1 ${aspect}`}
    >
      <CoverImage
        name={show.name}
        slug={show.slug}
        artworkUrl={show.artworkUrl}
        className="transition-transform duration-700 group-hover:scale-105"
      />
      {badge && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-xl bg-white/95 px-2.5 py-1.5 text-center shadow-md backdrop-blur">
          <span className="block text-xs font-black tabular-nums leading-tight text-ink">
            {badge.value}
          </span>
          <span className="block text-[8px] font-bold uppercase tracking-widest text-ink-faint">
            {badge.label}
          </span>
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-navy via-navy/50 to-transparent p-3 pt-10">
        <span className="block text-[13px] font-black leading-tight text-white drop-shadow">
          {show.name}
        </span>
        {show.hosts.length > 0 && (
          <span className="mt-0.5 block truncate text-[10px] font-medium text-white/75">
            {show.hosts.slice(0, 3).join(", ")}
          </span>
        )}
      </span>
    </Link>
  );
}

/* Receipts floating card: a show a brand actually bought, with real numbers. */
function ReceiptCard({
  r,
  className = "",
}: {
  r: {
    show: {
      slug: string;
      name: string;
      artworkUrl: string | null;
      hosts: string[];
    };
    brand: string;
    subs: string | null;
  };
  className?: string;
}) {
  const { show, brand, subs } = r;
  return (
    <Link
      href={`/podcast/${show.slug}`}
      className={`group relative block w-36 rounded-[1.5rem] border border-sky-50 bg-white p-3 shadow-[0_20px_40px_-20px_rgba(14,165,233,0.25)] transition-transform duration-500 hover:-translate-y-1 sm:w-44 ${className}`}
    >
      {subs && (
        <span className="absolute -left-3 top-5 z-10 rounded-xl bg-white px-2.5 py-1.5 text-center shadow-md">
          <span className="block text-xs font-black tabular-nums leading-tight text-ink">
            {subs}
          </span>
          <span className="block text-[8px] font-bold uppercase tracking-widest text-ink-faint">
            Subscribers
          </span>
        </span>
      )}
      <span className="relative block aspect-square overflow-hidden rounded-xl bg-navy">
        <CoverImage
          name={show.name}
          slug={show.slug}
          artworkUrl={show.artworkUrl}
          className="transition-transform duration-700 group-hover:scale-105"
        />
      </span>
      <span className="block px-1 pb-1 pt-3">
        <span className="block truncate text-sm font-black tracking-tight text-ink">
          {show.name}
        </span>
        <span className="block truncate text-[11px] font-medium text-ink-faint">
          {show.hosts.slice(0, 2).join(", ")}
        </span>
        <span className="mt-2 inline-block rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-sky-600">
          × {brand}
        </span>
      </span>
    </Link>
  );
}
