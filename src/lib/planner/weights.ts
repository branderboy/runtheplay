/**
 * Versioned, deterministic scoring weights. Bump ALGORITHM_VERSION whenever a
 * weight or factor changes so recommendation_runs stay reproducible.
 */
export const ALGORITHM_VERSION = "v1";

export const WEIGHTS = {
  audienceFit: 0.28,
  formatFit: 0.15,
  goalFit: 0.12,
  geographyFit: 0.12,
  budgetCompatibility: 0.12,
  inventoryAvailability: 0.08,
  freshness: 0.05,
  verification: 0.04,
  completeness: 0.04,
} as const;

export type FactorKey = keyof typeof WEIGHTS;

/** Goal → categories the goal favors (used by goalFit). */
export const GOAL_PREFERRED_CATEGORIES: Record<string, string[]> = {
  music_release: ["music", "hip-hop", "music interviews", "music commentary"],
  product_launch: ["business", "society & culture", "music", "comedy"],
  event_promotion: ["society & culture", "music", "comedy", "sports"],
  local_business: ["society & culture", "music", "sports"],
  brand_awareness: ["society & culture", "music", "sports", "comedy"],
  lead_generation: ["business"],
  community_nonprofit: ["society & culture", "religion & spirituality"],
  recruiting: ["business", "society & culture"],
  other: [],
};
