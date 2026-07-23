import playsData from "@/data/plays.json";

export interface MediaMixItem {
  channel: string;
  count: number;
  detail: string;
}
export interface AllocItem {
  label: string;
  amount: number;
}
export interface Play {
  slug: string;
  title: string;
  businessType: string;
  tier: "Starter" | "Growth" | "Pro" | "National";
  goal: string;
  budget: number;
  geography: string;
  audienceTags: string[];
  objective: string;
  mediaMix: MediaMixItem[];
  budgetAllocation: AllocItem[];
  whyItWorks: string;
  shopCategories: string[];
  restrictionsNote?: string;
}

const TIER_ORDER: Play["tier"][] = ["Starter", "Growth", "Pro", "National"];

const plays = playsData as Play[];

export function getAllPlays(): Play[] {
  return [...plays].sort(
    (a, b) =>
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
      a.budget - b.budget,
  );
}

export function getPlayBySlug(slug: string): Play | undefined {
  return plays.find((p) => p.slug === slug);
}

export function getPlaysByTier(): { tier: Play["tier"]; plays: Play[] }[] {
  return TIER_ORDER.map((tier) => ({
    tier,
    plays: getAllPlays().filter((p) => p.tier === tier),
  })).filter((g) => g.plays.length > 0);
}

/** Deep-links a play's parameters into the Ad Planner. */
export function plannerLink(p: Play): string {
  const q = new URLSearchParams({
    goal: p.goal,
    budget: String(p.budget),
    audience: p.audienceTags.join(", "),
  });
  return `/plan?${q.toString()}`;
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
