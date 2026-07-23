/**
 * Deterministic, rules-based Ad Planner matcher.
 *
 * Design guarantees:
 *  - Pure function of (plan, podcasts, options) — same inputs, same output.
 *  - Every result carries the factors that produced it (explainable).
 *  - No fabricated reach/price data — unknown price becomes a "contact" bucket,
 *    never an invented number.
 *  - Paid boosts surface as a SEPARATE, labeled "featured" list. They never
 *    change organic scores or reorder organic results.
 */
import {
  ALGORITHM_VERSION,
  WEIGHTS,
  GOAL_PREFERRED_CATEGORIES,
  type FactorKey,
} from "./weights";
import type {
  PlanInput,
  PodcastInput,
  InventoryInput,
  ScoredResult,
  MatchOptions,
  MatchOutput,
  PriceBucket,
} from "./types";

const norm = (s: string) => s.trim().toLowerCase();
const uniq = (xs: string[]) => Array.from(new Set(xs.map(norm))).filter(Boolean);

function overlapRatio(want: string[], have: string[]): number {
  const w = uniq(want);
  if (w.length === 0) return 0.5; // neutral when the buyer gave no signal
  const h = new Set(uniq(have));
  const hit = w.filter((x) => h.has(x)).length;
  return hit / w.length;
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs((a.getTime() - b.getTime()) / 86_400_000);
}

/* ------------------------------ price handling ----------------------------- */

interface PriceEval {
  bucket: PriceBucket;
  score: number;
  bestItemId: string | null;
}

function evaluatePrice(
  inv: InventoryInput[],
  budgetMax: number | null,
): PriceEval {
  const active = inv.filter((i) => i.availabilityStatus === "active");
  if (active.length === 0) {
    return { bucket: "contact", score: 0.5, bestItemId: null };
  }
  // Cheapest known starting price among active items.
  const priced = active
    .filter((i) => i.priceStarting != null)
    .sort((a, b) => (a.priceStarting! - b.priceStarting!));

  if (priced.length === 0) {
    // advertising exists but no published price
    return { bucket: "contact", score: 0.5, bestItemId: active[0].id };
  }

  const cheapest = priced[0];
  if (budgetMax == null) {
    return { bucket: "in_budget", score: 0.9, bestItemId: cheapest.id };
  }
  if (cheapest.priceStarting! > budgetMax) {
    return { bucket: "over_budget", score: 0, bestItemId: cheapest.id };
  }
  // Within budget. Fixed price fully inside → best; "starting_at" is softer.
  const isStartingAt =
    cheapest.pricingModel === "starting_at" || cheapest.priceMax == null;
  if (isStartingAt) {
    return { bucket: "starting_within", score: 0.8, bestItemId: cheapest.id };
  }
  const fullyInside = (cheapest.priceMax ?? cheapest.priceStarting!) <= budgetMax;
  return {
    bucket: "in_budget",
    score: fullyInside ? 1 : 0.85,
    bestItemId: cheapest.id,
  };
}

/* ------------------------------ factor scoring ----------------------------- */

function geographyFit(plan: PlanInput, pod: PodcastInput): number {
  const g = plan.geography;
  if (g.level === "national" || g.level === "none" || !g.value) return 0.7;
  const target = norm(g.value);
  const podCity = norm(pod.geography.city ?? "");
  const podState = norm(pod.geography.state ?? "");
  const isLocalShow = Boolean(podCity || podState);
  if (podCity.includes(target) || podState.includes(target) || target.includes(podState && podState)) {
    return 1;
  }
  // National show still reaches the target market.
  if (!isLocalShow) return 0.6;
  return 0.15; // a different local market
}

function formatFit(plan: PlanInput, pod: PodcastInput): number {
  const wanted = uniq(plan.creativeFormats);
  if (wanted.length === 0) return 0.7; // no preference
  const offered = new Set(pod.inventory.map((i) => norm(i.creativeFormat)));
  if (offered.size > 0) {
    const hit = wanted.some((w) => offered.has(w));
    if (hit) return 1;
    return 0.15; // has inventory, but not this format
  }
  // No structured inventory yet — may still offer it if advertising is available.
  return pod.advertisingAvailable ? 0.4 : 0.1;
}

function mediaFit(plan: PlanInput, pod: PodcastInput): number {
  if (!plan.mediaType || plan.mediaType === "both") return 1;
  if (plan.mediaType === "video") {
    const hasVideoInv = pod.inventory.some(
      (i) => i.mediaType === "video" || i.mediaType === "both",
    );
    return hasVideoInv ? 1 : 0.5; // most shows have a YouTube presence; soft penalty
  }
  return 1; // audio is universally available
}

function goalFit(plan: PlanInput, pod: PodcastInput): number {
  const prefs = GOAL_PREFERRED_CATEGORIES[plan.goal] ?? [];
  if (prefs.length === 0) return 0.5;
  return overlapRatio(prefs, pod.categories) > 0 ? 1 : 0.4;
}

function inventoryAvailability(pod: PodcastInput): number {
  const active = pod.inventory.some((i) => i.availabilityStatus === "active");
  if (active) return 1;
  if (pod.advertisingAvailable) return 0.5;
  return 0.2;
}

function freshness(pod: PodcastInput, ref: Date): number {
  const raw = pod.mostRecentEpisodeDate;
  if (!raw) return 0.4;
  const iso = /^\d{4}-\d{2}$/.test(raw) ? `${raw}-01` : raw;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0.4;
  const days = daysBetween(ref, d);
  if (days <= 30) return 1;
  if (days <= 90) return 0.8;
  if (days <= 120) return 0.6;
  return 0.3;
}

function verification(pod: PodcastInput): number {
  if (pod.verificationStatus === "verified") return 1;
  if (pod.ownershipStatus === "claimed") return 0.7;
  return 0.4;
}

/* --------------------------------- reasons -------------------------------- */

function buildReasons(
  plan: PlanInput,
  pod: PodcastInput,
  f: Record<FactorKey, number>,
  price: PriceEval,
): string[] {
  const out: string[] = [];
  if (f.audienceFit >= 0.5) {
    const shared = uniq(plan.audienceTags).filter((t) =>
      new Set(uniq(pod.audienceTags)).has(t),
    );
    if (shared.length)
      out.push(`Reaches your audience: ${shared.slice(0, 3).join(", ")}`);
  }
  if (f.geographyFit >= 1 && plan.geography.value)
    out.push(`In your target market (${plan.geography.value})`);
  if (f.formatFit >= 1 && plan.creativeFormats.length)
    out.push(`Offers your requested format`);
  if (price.bucket === "contact")
    out.push("Pricing on request, contact the show");
  if (price.bucket === "in_budget") out.push("Fits your budget");
  if (f.freshness >= 0.8) out.push("Publishing consistently");
  if (f.verification >= 1) out.push("Verified profile");
  else if (f.verification >= 0.7) out.push("Claimed profile");
  if (out.length === 0) out.push("Relevant to your campaign");
  return out.slice(0, 4);
}

/* ------------------------------- main matcher ------------------------------ */

export function matchPlan(
  plan: PlanInput,
  podcasts: PodcastInput[],
  options: MatchOptions = {},
): MatchOutput {
  const ref = options.referenceDate ?? new Date();
  const maxFeatured = options.maxFeatured ?? 3;
  const maxPerCategory = options.maxPerCategory ?? 3;
  const limit = options.limit ?? 25;

  let excluded = 0;
  const scored: ScoredResult[] = [];

  for (const pod of podcasts) {
    // Hard filters.
    if (pod.status === "inactive" || pod.status === "archived") {
      excluded++;
      continue;
    }
    const price = evaluatePrice(pod.inventory, plan.budgetMax);
    if (price.bucket === "over_budget") {
      excluded++;
      continue;
    }
    const g = plan.geography;
    const geoScore = geographyFit(plan, pod);
    if (g.localOnly && geoScore < 1) {
      excluded++;
      continue;
    }

    const f: Record<FactorKey, number> = {
      audienceFit: overlapRatio(plan.audienceTags, pod.audienceTags),
      formatFit: Math.min(formatFit(plan, pod), mediaFit(plan, pod)),
      goalFit: goalFit(plan, pod),
      geographyFit: geoScore,
      budgetCompatibility: price.score,
      inventoryAvailability: inventoryAvailability(pod),
      freshness: freshness(pod, ref),
      verification: verification(pod),
      completeness: Math.max(0, Math.min(1, pod.dataFillRatio)),
    };

    const raw = (Object.keys(WEIGHTS) as FactorKey[]).reduce(
      (sum, k) => sum + WEIGHTS[k] * f[k],
      0,
    );
    const score = Math.round(raw * 1000) / 10; // 0..100, one decimal

    scored.push({
      podcastId: pod.id,
      name: pod.name,
      score,
      rank: 0,
      reasons: buildReasons(plan, pod, f, price),
      factorScores: f,
      priceBucket: price.bucket,
      bestInventoryItemId: price.bestItemId,
      isFeatured: false,
    });
  }

  // Sort by organic relevance. Deterministic tiebreaker: name.
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  // Featured layer: boosted shows that pass filters, ranked by their OWN score,
  // shown separately and always labeled. Does not touch organic ordering.
  const podById = new Map(podcasts.map((p) => [p.id, p]));
  const featured: ScoredResult[] = [];
  for (const r of scored) {
    const scopes = podById.get(r.podcastId)?.activeBoostScopes ?? [];
    if (scopes.includes("planner_results") || scopes.includes("all")) {
      featured.push({ ...r, isFeatured: true });
      if (featured.length >= maxFeatured) break;
    }
  }
  const featuredIds = new Set(featured.map((r) => r.podcastId));

  // Organic list excludes the featured rows (they're shown above, labeled),
  // with a light category-diversification cap.
  const perCat = new Map<string, number>();
  const organic: ScoredResult[] = [];
  const overflow: ScoredResult[] = [];
  for (const r of scored) {
    if (featuredIds.has(r.podcastId)) continue;
    const cat = norm(podById.get(r.podcastId)?.categories[0] ?? "uncategorized");
    const n = perCat.get(cat) ?? 0;
    if (n < maxPerCategory) {
      perCat.set(cat, n + 1);
      organic.push(r);
    } else {
      overflow.push(r);
    }
  }
  // Append overflow after the diversified head so nothing is silently dropped.
  const finalOrganic = [...organic, ...overflow]
    .slice(0, limit)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    algorithmVersion: ALGORITHM_VERSION,
    featured: featured.map((r, i) => ({ ...r, rank: i + 1 })),
    organic: finalOrganic,
    excludedCount: excluded,
  };
}
