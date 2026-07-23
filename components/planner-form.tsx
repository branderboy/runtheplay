"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { runPlan } from "@/lib/actions";
import type { CampaignGoal, MatchOutput } from "@/src/lib/planner/types";
import { Badge } from "./badges";
import { AddToPlanButton, useBasket } from "./basket";

/** Step-by-step campaign wizard — how an ad plan is actually built:
 *  1. Goal  →  2. Budget  →  3. Audience  →  4. Details  →  Results   */

export const GOALS: { value: CampaignGoal; label: string; blurb: string }[] = [
  { value: "brand_awareness", label: "Brand Awareness", blurb: "Get Your Name in the Culture" },
  { value: "product_launch", label: "Product Launch", blurb: "Drop Something New" },
  { value: "music_release", label: "Music Release", blurb: "Push a Single or Project" },
  { value: "event_promotion", label: "Event Promotion", blurb: "Fill the Room" },
  { value: "local_business", label: "Local Business", blurb: "Own Your City" },
  { value: "lead_generation", label: "Lead Generation", blurb: "Drive Signups & Sales" },
];

const BUDGET_PRESETS = [500, 1500, 5000, 10000];

const AUDIENCE_PRESETS = [
  "entrepreneurs",
  "hip-hop",
  "sports",
  "investing",
  "comedy",
  "wellness",
  "fashion",
  "gen z",
];

const FORMATS = [
  { value: "host_read", label: "Host-Read Ad" },
  { value: "sponsored_segment", label: "Sponsored Segment" },
  { value: "sponsored_interview", label: "Sponsored Interview" },
  { value: "branded_episode", label: "Branded Episode" },
];

const priceLabel: Record<string, string> = {
  in_budget: "Fits budget",
  starting_within: "Starting price fits",
  contact: "Contact for Pricing",
  over_budget: "Over budget",
};

const STEPS = ["Goal", "Budget", "Audience", "Details"];

export function PlannerForm({
  initialGoal,
  initialBudget,
  initialAudience,
}: {
  initialGoal?: string;
  initialBudget?: string;
  initialAudience?: string;
} = {}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<CampaignGoal | null>(
    (initialGoal as CampaignGoal) || null,
  );
  const [budget, setBudget] = useState(initialBudget ?? "");
  const [audience, setAudience] = useState(initialAudience ?? "");
  const [formats, setFormats] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [media, setMedia] = useState<"both" | "audio" | "video">("both");
  const [out, setOut] = useState<MatchOutput | null>(null);
  const [pending, start] = useTransition();
  const ran = useRef(false);

  function build(g: CampaignGoal | null = goal) {
    setStep(4);
    start(async () => {
      const result = await runPlan({
        goal: (g ?? "brand_awareness") as CampaignGoal,
        budgetMax: budget ? Number(budget) : null,
        currency: "USD",
        audienceTags: audience.split(",").map((s) => s.trim()).filter(Boolean),
        geography: city.trim()
          ? { level: "metro", value: city.trim(), localOnly: false }
          : { level: "national" },
        creativeFormats: formats,
        mediaType: media,
      });
      setOut(result);
    });
  }

  // Deep-linked from home / a Play: prefill and jump ahead.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (initialGoal && initialBudget && initialAudience) build(initialGoal as CampaignGoal);
    else if (initialGoal) setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const stepBox =
    "rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.2)] sm:p-10";
  const continueBtn =
    "rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0";
  const backBtn =
    "rounded-full border border-slate-200 px-8 py-4 text-sm font-black uppercase tracking-widest text-ink-faint transition-colors hover:border-sky-300 hover:text-sky-500";

  return (
    <div className="mx-auto max-w-3xl">
      {step < 4 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`text-[11px] font-black uppercase tracking-widest ${
                  i === step ? "text-sky-500" : i < step ? "text-ink" : "text-ink-faint"
                }`}
              >
                {i + 1}. {s}
              </span>
            ))}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sky-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {step === 0 && (
        <div className={stepBox}>
          <h2 className="display mb-2 text-2xl text-ink sm:text-3xl">
            What are you promoting?
          </h2>
          <p className="mb-8 font-medium text-ink-dim">
            Every campaign starts with the goal.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                data-goal={g.value}
                onClick={() => {
                  setGoal(g.value);
                  setStep(1);
                }}
                className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-15px_rgba(14,165,233,0.4)] ${
                  goal === g.value
                    ? "border-sky-400 bg-sky-50"
                    : "border-sky-50 bg-white shadow-sm"
                }`}
              >
                <span>
                  <span className="block font-black uppercase tracking-tight text-ink">
                    {g.label}
                  </span>
                  <span className="text-sm font-medium text-ink-dim">{g.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={stepBox}>
          <h2 className="display mb-2 text-2xl text-ink sm:text-3xl">
            What can you spend?
          </h2>
          <p className="mb-8 font-medium text-ink-dim">
            Real plans start under $500. Nothing here is a quoted rate.
          </p>
          <div className="mb-6 flex flex-wrap gap-3">
            {BUDGET_PRESETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(String(b))}
                className={`rounded-full border px-6 py-3 text-sm font-black tabular-nums transition-all ${
                  budget === String(b)
                    ? "border-sky-500 bg-sky-500 text-white shadow-md"
                    : "border-slate-200 bg-white text-ink hover:border-sky-300"
                }`}
              >
                ${b.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-6 text-xl font-black text-sky-400">$</span>
            <input
              type="number"
              name="budget"
              min={100}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Or enter an exact budget"
              aria-label="Budget in dollars"
              className="w-full rounded-2xl border border-transparent bg-navy-2 py-5 pl-12 pr-4 text-lg font-black text-ink outline-none transition-all placeholder:text-ink-faint focus:border-sky-100 focus:bg-sky-50/50"
            />
          </div>
          <div className="mt-8 flex justify-between">
            <button type="button" onClick={back} className={backBtn}>← Back</button>
            <button type="button" onClick={next} disabled={!budget} className={continueBtn}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={stepBox}>
          <h2 className="display mb-2 text-2xl text-ink sm:text-3xl">
            Who are you trying to reach?
          </h2>
          <p className="mb-8 font-medium text-ink-dim">
            Pick interests or type your own.
          </p>
          <div className="mb-6 flex flex-wrap gap-2.5">
            {AUDIENCE_PRESETS.map((t) => {
              const active = audience.toLowerCase().includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setAudience((cur) => {
                      const parts = cur.split(",").map((s) => s.trim()).filter(Boolean);
                      return active
                        ? parts.filter((p) => p.toLowerCase() !== t).join(", ")
                        : [...parts, t].join(", ");
                    })
                  }
                  className={`rounded-full border px-5 py-2.5 text-sm font-black capitalize transition-all ${
                    active
                      ? "border-sky-500 bg-sky-500 text-white shadow-md"
                      : "border-slate-200 bg-white text-ink hover:border-sky-300"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            name="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. entrepreneurs, hip-hop, investing"
            aria-label="Audience to reach"
            className="w-full rounded-2xl border border-transparent bg-navy-2 px-6 py-5 text-lg font-black text-ink outline-none transition-all placeholder:text-ink-faint focus:border-sky-100 focus:bg-sky-50/50"
          />
          <div className="mt-8 flex justify-between">
            <button type="button" onClick={back} className={backBtn}>← Back</button>
            <button type="button" onClick={next} disabled={!audience.trim()} className={continueBtn}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={stepBox}>
          <h2 className="display mb-2 text-2xl text-ink sm:text-3xl">
            Last details.
          </h2>
          <p className="mb-8 font-medium text-ink-dim">
            Optional. Build when ready.
          </p>
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-ink-faint">
              Ad format (optional)
            </p>
            <div className="flex flex-wrap gap-2.5">
              {FORMATS.map((f) => {
                const active = formats.includes(f.value);
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      setFormats((cur) =>
                        active ? cur.filter((x) => x !== f.value) : [...cur, f.value],
                      )
                    }
                    className={`rounded-full border px-5 py-2.5 text-sm font-black transition-all ${
                      active
                        ? "border-sky-500 bg-sky-500 text-white shadow-md"
                        : "border-slate-200 bg-white text-ink hover:border-sky-300"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Target city (optional)"
              aria-label="Target city"
              className="rounded-2xl border border-transparent bg-navy-2 px-6 py-4 font-bold text-ink outline-none transition-all placeholder:text-ink-faint focus:border-sky-100 focus:bg-sky-50/50"
            />
            <select
              value={media}
              onChange={(e) => setMedia(e.target.value as "both" | "audio" | "video")}
              aria-label="Audio or video"
              className="cursor-pointer appearance-none rounded-2xl border border-transparent bg-navy-2 px-6 py-4 font-bold text-ink outline-none transition-all focus:border-sky-100 focus:bg-sky-50"
            >
              <option value="both">Audio or video</option>
              <option value="audio">Audio only</option>
              <option value="video">Video only</option>
            </select>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={back} className={backBtn}>← Back</button>
            <button
              type="submit"
              onClick={() => build()}
              disabled={pending}
              className={continueBtn}
            >
              {pending ? "Building Your Play…" : "Build My Plan →"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="display text-2xl text-ink sm:text-3xl">Your play.</h2>
              <p className="mt-1 text-sm font-bold text-ink-dim">
                {GOALS.find((g) => g.value === goal)?.label ?? "Campaign"}
                {budget && <> · ${Number(budget).toLocaleString()}</>}
                {audience && <> · {audience}</>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setOut(null); setStep(0); }}
              className={backBtn}
            >
              Start over
            </button>
          </div>

          {!out && (
            <div className="rounded-[2rem] border border-dashed border-sky-200 py-16 text-center text-sm font-black uppercase tracking-widest text-ink-faint">
              Building your play…
            </div>
          )}

          {out && (
            <div className="flex flex-col gap-8">
              {out.featured.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-ink-faint">
                    Featured
                  </h3>
                  <div className="flex flex-col gap-3">
                    {out.featured.map((r) => (
                      <ResultRow key={r.podcastId} r={r} featured />
                    ))}
                  </div>
                </section>
              )}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-ink-faint">
                    Recommended · ranked by relevance
                  </h3>
                  <span className="text-xs font-bold text-ink-faint">
                    {out.organic.length} shows · {out.excludedCount} filtered out
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {out.organic.map((r) => (
                    <ResultRow key={r.podcastId} r={r} />
                  ))}
                </div>
              </section>

              {out.organic.length > 0 && <SaveResultsCard organic={out.organic} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  r,
  featured = false,
}: {
  r: MatchOutput["organic"][number];
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-[1.5rem] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-15px_rgba(14,165,233,0.4)] ${
        featured ? "border-orange/40 bg-orange/5" : "border-sky-50 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <Link href={`/podcast/${r.podcastId}`} className="group min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-black uppercase tracking-tight text-ink group-hover:text-sky-600">
              {r.name}
            </h4>
            {featured && <Badge tone="featured">Featured</Badge>}
          </div>
          <p className="mt-1 text-[13px] font-medium text-ink-dim">
            {r.reasons.join(" · ")}
          </p>
        </Link>
        <div className="flex flex-none flex-col items-end gap-1">
          <span className="text-lg font-black tabular-nums text-ink">{r.score}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">
            {priceLabel[r.priceBucket]}
          </span>
        </div>
      </div>
      <div className="mt-4 flex">
        <AddToPlanButton slug={r.podcastId} name={r.name} category={null} />
      </div>
    </div>
  );
}

/* Account moment on results: keep the plan with one email (see docs/logic.md A4). */
function SaveResultsCard({ organic }: { organic: MatchOutput["organic"] }) {
  const { add, items } = useBasket();
  const router = useRouter();
  const inMix = organic.filter((r) => items.some((i) => i.slug === r.podcastId)).length;

  return (
    <div className="rounded-[2rem] border border-sky-100 bg-sky-50/40 p-8 text-center">
      <p className="display mb-2 text-2xl text-ink">Keep This Plan.</p>
      <p className="mx-auto mb-6 max-w-md text-sm font-medium text-ink-dim">
        Save your matches to a free account. One email, no password, your plan
        gets a permanent link you can edit anytime.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            for (const r of organic) {
              add({ slug: r.podcastId, name: r.name, category: null });
            }
            router.push("/basket");
          }}
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5"
        >
          Save All {organic.length} & Create Account
        </button>
        {inMix > 0 && (
          <span className="text-xs font-bold uppercase tracking-widest text-ink-faint">
            {inMix} Already in Your Mix
          </span>
        )}
      </div>
    </div>
  );
}
