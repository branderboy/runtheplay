import { describe, it, expect } from "vitest";
import { getAllPlays } from "@/lib/data/plays";

const GOALS = new Set([
  "brand_awareness",
  "product_launch",
  "music_release",
  "event_promotion",
  "local_business",
  "lead_generation",
  "community_nonprofit",
  "recruiting",
  "other",
]);

describe("plays library integrity", () => {
  const plays = getAllPlays();

  it("contains the full 50-play library", () => {
    expect(plays.length).toBe(50);
  });

  it("slugs are unique", () => {
    const slugs = plays.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every budget allocation sums exactly to its budget", () => {
    for (const p of plays) {
      const sum = p.budgetAllocation.reduce((n, a) => n + a.amount, 0);
      expect(sum, p.slug).toBe(p.budget);
    }
  });

  it("goals come only from the campaign-goal enum (no politics)", () => {
    for (const p of plays) {
      expect(GOALS.has(p.goal), `${p.slug}: ${p.goal}`).toBe(true);
    }
  });

  it("every play has a media mix and objective", () => {
    for (const p of plays) {
      expect(p.mediaMix.length).toBeGreaterThan(0);
      expect(p.objective.length).toBeGreaterThan(10);
    }
  });
});
