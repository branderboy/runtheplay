/**
 * Plain (DB-independent) types for the Ad Planner matcher so the logic is pure
 * and testable. The server maps Drizzle rows into these shapes before matching.
 */

export type CampaignGoal =
  | "brand_awareness"
  | "product_launch"
  | "music_release"
  | "event_promotion"
  | "local_business"
  | "lead_generation"
  | "community_nonprofit"
  | "recruiting"
  | "other";

export type MediaType = "audio" | "video" | "both";

export interface PlanGeography {
  level: "national" | "regional" | "state" | "metro" | "city" | "none";
  value?: string; // e.g. "Atlanta", "GA"
  localOnly?: boolean; // if true, only shows in the target market qualify
}

export interface PlanInput {
  goal: CampaignGoal;
  budgetMax: number | null;
  budgetMin?: number | null;
  currency?: string;
  audienceTags: string[]; // interests/culture tags the buyer wants to reach
  geography: PlanGeography;
  creativeFormats: string[]; // requested creative_format enum values
  mediaType?: MediaType;
}

export interface InventoryInput {
  id: string;
  creativeFormat: string;
  mediaType: MediaType;
  pricingModel: string;
  priceStarting: number | null;
  priceMax: number | null;
  availabilityStatus: string;
}

export interface PodcastInput {
  id: string;
  name: string;
  slug: string;
  status: string; // active | inactive | archived | rebranded | needs_verification
  ownershipStatus: string; // unclaimed | pending | claimed
  verificationStatus: string; // unverified | verified | disputed
  categories: string[];
  audienceTags: string[];
  geography: { countryCode?: string | null; state?: string | null; city?: string | null };
  mostRecentEpisodeDate?: string | null; // YYYY-MM or YYYY-MM-DD
  advertisingAvailable?: boolean | null;
  dataFillRatio: number; // 0..1 profile completeness
  inventory: InventoryInput[];
  /** Active boost scopes for this show, e.g. ["planner_results"] or ["all"]. */
  activeBoostScopes: string[];
}

export type PriceBucket =
  | "in_budget"
  | "starting_within"
  | "contact"
  | "over_budget";

export interface ScoredResult {
  podcastId: string;
  name: string;
  score: number; // 0..100 organic relevance
  rank: number;
  reasons: string[];
  factorScores: Record<string, number>;
  priceBucket: PriceBucket;
  bestInventoryItemId: string | null;
  isFeatured: boolean; // paid boost — always labeled in the UI
}

export interface MatchOptions {
  referenceDate?: Date; // for deterministic freshness scoring
  maxFeatured?: number; // cap on labeled featured slots
  maxPerCategory?: number; // diversification cap in organic results
  limit?: number; // max organic results returned
}

export interface MatchOutput {
  algorithmVersion: string;
  featured: ScoredResult[]; // labeled "Featured" — boosted, shown separately
  organic: ScoredResult[]; // ranked purely by relevance
  excludedCount: number; // failed hard filters (over budget / local-only miss / inactive)
}
