import Link from "next/link";
import { getAllPodcasts } from "@/lib/data/podcasts";
import { thesis } from "@/lib/data/thesis";
import { CoverArt } from "@/components/cover-art";
import { GetListedForm } from "@/components/get-listed-form";
import { ClaimSearch } from "@/components/claim-search";

export const metadata = {
  title: "For Creators",
  description:
    "Claim your show or get listed free on Run the Play. A structured way to add ad revenue, even incremental income, on your terms.",
};

/** The creator journey, mirroring the product: Directory, Planner, Charts. */
const JOURNEY = [
  {
    step: "01",
    title: "Connect",
    kicker: "The Creator Directory",
    body: "Your show gets a landing profile with your platforms, reach, formats, and how to book you. Free, forever.",
    href: "/directory",
    linkLabel: "See the Directory",
  },
  {
    step: "02",
    title: "Plan",
    kicker: "Ad Planner & Marketplace",
    body: "Advertisers come here for structured access to alternative media. They build plans by goal, budget, and audience. Publish your real inventory and rates so the plans that match you book you.",
    href: "/plan",
    linkLabel: "See the Planner",
  },
  {
    step: "03",
    title: "Grow",
    kicker: "Charts, Metrics & Results",
    body: "Every booking is revenue you were not getting one-off. Weekly public charts and sourced receipts make your case, and chart positions can never be bought.",
    href: "/charts",
    linkLabel: "See the Charts",
  },
];

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const podcasts = getAllPodcasts();
  const covers = podcasts.filter((p) => p.artworkUrl).slice(0, 6);
  const revenueStat = thesis.growth[0];

  return (
    <div>
      {/* ------------------------------- Hero ------------------------------- */}
      <header className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 to-white pb-20 pt-16">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-sky-100 bg-sky-50 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600 shadow-sm">
            For Creators
          </div>
          <h1 className="display mx-auto mb-6 max-w-4xl text-5xl leading-[1.02] text-ink md:text-7xl">
            Connect.{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
              Plan.
            </span>{" "}
            Grow.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-ink-dim md:text-xl">
            The growth network for Black-creator podcasts. A structured way to
            add ad revenue, even incremental income. You set the rates.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#claim"
              className="rounded-full bg-orange px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-1 hover:bg-orange-600"
            >
              Claim Your Show
            </a>
            <a
              href="#signup"
              className="rounded-full border border-sky-100 bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-ink shadow-sm transition-all hover:-translate-y-1"
            >
              Get Listed Free
            </a>
          </div>

          {/* The owner's network illustration */}
          <div className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-[2rem] border border-sky-50 bg-white shadow-[0_30px_60px_-20px_rgba(14,165,233,0.25)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/creators-network.webp"
              alt="The Run the Play creator journey: the creator directory connects shows with brands, the ad planner and marketplace turn budgets into campaigns, and campaign metrics show the results"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </header>

      {/* ---------------------- The journey, in three steps ---------------------- */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {JOURNEY.map((j) => (
              <div
                key={j.step}
                className="flex h-full flex-col rounded-[2.5rem] border border-sky-50 bg-white p-10 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.08)]"
              >
                <span className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-ink-faint">
                  {j.step}
                </span>
                <h2 className="display mb-2 text-3xl text-ink">{j.title}</h2>
                <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-sky-500">
                  {j.kicker}
                </p>
                <p className="mb-8 text-sm font-medium leading-relaxed text-ink-dim">
                  {j.body}
                </p>

                {/* Real product proof per step, no invented numbers */}
                {j.step === "01" && (
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {covers.map((p) => (
                        <span
                          key={p.slug}
                          className="inline-block overflow-hidden rounded-full border-2 border-white shadow-sm"
                        >
                          <CoverArt
                            name={p.name}
                            slug={p.slug}
                            artworkUrl={p.artworkUrl}
                            size={40}
                            radius={20}
                          />
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-ink-dim">
                      {podcasts.length} Shows Listed
                    </span>
                  </div>
                )}
                {j.step === "02" && (
                  <div className="mt-auto flex flex-wrap gap-2">
                    {["$500", "$1.5K", "$5K", "$10K"].map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-black tabular-nums text-sky-700"
                      >
                        {b}
                      </span>
                    ))}
                    <span className="w-full pt-1 text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                      The Planner's Budget Steps
                    </span>
                  </div>
                )}
                {j.step === "03" && revenueStat && (
                  <div className="mt-auto">
                    <span className="block text-3xl font-black tabular-nums tracking-tight text-ink">
                      {revenueStat.value}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                      {revenueStat.label} · {revenueStat.source}
                    </span>
                  </div>
                )}

                <Link
                  href={j.href}
                  className="mt-8 text-xs font-black uppercase tracking-widest text-sky-500 transition-colors hover:text-sky-600"
                >
                  {j.linkLabel} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ Use case: get discovered by brands ------------------ */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 rounded-[3rem] border border-sky-50 bg-sky-50/30 p-10 md:p-14 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                Get Discovered
              </h2>
              <p className="display mb-6 text-3xl text-ink md:text-4xl">
                Discoverable by Brands.
              </p>
              <p className="max-w-xl text-base font-medium leading-relaxed text-ink-dim">
                Stop waiting for agencies to find a media kit buried in your
                bio. Your profile puts your show in front of brands actively
                looking for Black podcast inventory. Audience, pricing,
                formats, and sponsorship opportunities in one place.
                Advertisers find you instead of the other way around.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "More Sponsor Opportunities",
                "Less Cold Outreach",
                "A Professional Media Profile",
                "Direct Inquiries",
              ].map((t) => (
                <div
                  key={t}
                  className="rounded-[1.5rem] border border-sky-50 bg-white p-6 text-sm font-black uppercase tracking-tight text-ink shadow-sm"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ Claim ------------------------------ */}
      <section className="bg-sky-50/30 py-20" id="claim">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
            Already Listed?
          </h2>
          <p className="display mb-4 text-4xl text-ink md:text-5xl">
            Claim Your Show.
          </p>
          <p className="mx-auto mb-8 max-w-xl text-lg font-medium text-ink-dim">
            Find your show, then verify with your public business email. If it
            matches what's on file, you're verified instantly.
          </p>
          <ClaimSearch />
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-ink-faint">
            Claiming Unlocks Your Real Inventory, Rates, and Availability
          </p>
        </div>
      </section>

      {/* ------------------------------ Sign up ------------------------------ */}
      <section className="bg-white py-20" id="signup">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                Not Listed Yet?
              </h2>
              <p className="display mb-6 text-4xl text-ink md:text-5xl">
                List Your Show Free.
              </p>
              <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-ink-dim">
                {thesis.story.problem} Run the Play puts independent culture
                shows in front of the buyers, together.
              </p>
              <ul className="space-y-4">
                {[
                  "A landing profile with your platforms and reach",
                  "Placement in planner results that match your audience",
                  "Eligibility for the weekly public charts",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-4 text-base font-bold text-ink-dim"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-500">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2.5rem] border border-sky-50 bg-white p-8 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.15)] md:p-10">
              <GetListedForm initialShowName={show ?? ""} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------- Use case: manage sponsorships (the RTP vision) ------------- */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
            Manage Sponsorships
          </h2>
          <p className="display mx-auto mb-6 max-w-3xl text-4xl text-ink md:text-5xl">
            Turn Conversations Into Campaigns.
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-ink-dim">
            Most sponsorships live in emails, DMs, spreadsheets, and PDFs. Run
            the Play is one place to receive campaign requests, share your
            media kit, answer questions, and manage brand conversations.
          </p>
          <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <span className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Campaign Requests · Live
            </span>
            {["Deliverables", "Contracts", "Payments", "Performance Reporting"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-ink-faint"
                >
                  {t} · On the Roadmap
                </span>
              ),
            )}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-xl font-black uppercase tracking-tight text-ink">
            The Operating System for Podcast Sponsorships.
          </p>
        </div>
      </section>

      {/* --------------------------- Boosts, honestly --------------------------- */}
      <section className="bg-sky-50/30 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="display mb-4 text-3xl text-ink">
            Free to List. Boost When Ready.
          </p>
          <p className="mx-auto mb-6 max-w-xl text-base font-medium text-ink-dim">
            A paid boost buys labeled visibility, never a better rank. Organic
            results stay earned and the charts can never be bought.
          </p>
          <Link
            href="/legal/ranking"
            className="text-xs font-black uppercase tracking-widest text-sky-500 transition-colors hover:text-sky-600"
          >
            How Ranking and Featured Placement Work →
          </Link>
        </div>
      </section>
    </div>
  );
}
