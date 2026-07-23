"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runPlan } from "@/lib/actions";
import type { CampaignGoal, MatchOutput } from "@/src/lib/planner/types";
import { Badge } from "./badges";

const GOALS: { value: CampaignGoal; label: string }[] = [
  { value: "brand_awareness", label: "Brand awareness" },
  { value: "product_launch", label: "Product launch" },
  { value: "music_release", label: "Music release" },
  { value: "event_promotion", label: "Event promotion" },
  { value: "local_business", label: "Local business" },
  { value: "lead_generation", label: "Lead generation" },
  { value: "community_nonprofit", label: "Community / nonprofit" },
  { value: "recruiting", label: "Recruiting" },
  { value: "other", label: "Other" },
];

const FORMATS = [
  { value: "host_read", label: "Host-Read Ad" },
  { value: "voice_talent_ad", label: "Voice-Over Ad" },
  { value: "advertiser_supplied_commercial", label: "Commercial Insert" },
  { value: "sponsored_segment", label: "Sponsored Segment" },
  { value: "sponsored_interview", label: "Sponsored Interview" },
  { value: "branded_episode", label: "Branded Episode" },
];

const priceLabel: Record<string, string> = {
  in_budget: "Fits budget",
  starting_within: "Starting price fits",
  contact: "Contact for pricing",
  over_budget: "Over budget",
};

const field =
  "rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange w-full";

export function PlannerForm() {
  const [out, setOut] = useState<MatchOutput | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const geoValue = String(f.get("geoValue") ?? "").trim();
    const input = {
      goal: String(f.get("goal")) as CampaignGoal,
      budgetMax: f.get("budget") ? Number(f.get("budget")) : null,
      currency: "USD",
      audienceTags: String(f.get("audience") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      geography: geoValue
        ? { level: "metro" as const, value: geoValue, localOnly: false }
        : { level: "national" as const },
      creativeFormats: f.getAll("formats").map(String),
      mediaType: String(f.get("media") ?? "both") as "audio" | "video" | "both",
    };
    start(async () => setOut(await runPlan(input)));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-navy-1 p-6">
        <div>
          <label className="mb-1.5 block text-sm text-ink-dim">Campaign goal</label>
          <select name="goal" className={field} defaultValue="product_launch">
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-ink-dim">Budget (USD)</label>
          <input name="budget" type="number" min={0} placeholder="3000" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-ink-dim">Audience to reach</label>
          <input name="audience" placeholder="entrepreneurs, hip-hop, investing" className={field} />
          <p className="mt-1 text-xs text-ink-faint">Comma-separated interests.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-ink-dim">Target city (optional)</label>
          <input name="geoValue" placeholder="Leave blank for national" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-ink-dim">Audio or video</label>
          <select name="media" className={field} defaultValue="both">
            <option value="both">Either</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm text-ink-dim">Ad format</legend>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((fm) => (
              <label key={fm.value} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-navy-2 px-2.5 py-1.5 text-xs">
                <input type="checkbox" name="formats" value={fm.value} className="accent-orange" />
                {fm.label}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-orange px-5 py-3 text-sm font-bold uppercase tracking-wide text-navy disabled:opacity-60"
        >
          {pending ? "Building your play…" : "Build my plan"}
        </button>
      </form>

      <div>
        {!out && (
          <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-line text-sm text-ink-faint">
            Your recommended shows will appear here.
          </div>
        )}
        {out && (
          <div className="flex flex-col gap-6">
            {out.featured.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-orange">Featured</h2>
                <div className="flex flex-col gap-3">
                  {out.featured.map((r) => (
                    <ResultRow key={r.podcastId} r={r} featured />
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink-dim">
                  Recommended · ranked by relevance
                </h2>
                <span className="text-xs text-ink-faint">
                  {out.organic.length} shows · {out.excludedCount} filtered out
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {out.organic.map((r) => (
                  <ResultRow key={r.podcastId} r={r} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
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
    <Link
      href={`/podcast/${r.podcastId}`}
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-colors hover:border-orange/50 ${
        featured ? "border-orange/40 bg-orange/5" : "border-line bg-navy-1"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{r.name}</h3>
          {featured && <Badge tone="featured">Featured</Badge>}
        </div>
        <p className="mt-1 text-[13px] text-ink-dim">{r.reasons.join(" · ")}</p>
      </div>
      <div className="flex flex-none flex-col items-end gap-1">
        <span className="text-lg font-extrabold tabular-nums">{r.score}</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-faint">
          {priceLabel[r.priceBucket]}
        </span>
      </div>
    </Link>
  );
}
