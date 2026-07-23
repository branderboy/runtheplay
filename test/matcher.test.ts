import { describe, it, expect } from "vitest";
import { matchPlan } from "@/src/lib/planner/matcher";
import type { PlanInput, PodcastInput } from "@/src/lib/planner/types";

const REF = new Date("2026-07-23T00:00:00Z");

function pod(overrides: Partial<PodcastInput> & { id: string }): PodcastInput {
  return {
    name: overrides.id,
    slug: overrides.id,
    status: "active",
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
    categories: ["Business"],
    audienceTags: ["entrepreneurs"],
    geography: { countryCode: "US" },
    mostRecentEpisodeDate: "2026-07-01",
    advertisingAvailable: true,
    dataFillRatio: 0.6,
    inventory: [],
    activeBoostScopes: [],
    ...overrides,
  };
}

const plan: PlanInput = {
  goal: "product_launch",
  budgetMax: 3000,
  audienceTags: ["entrepreneurs"],
  geography: { level: "national" },
  creativeFormats: [],
};

describe("matchPlan", () => {
  it("is deterministic — same input, same output", () => {
    const pods = [pod({ id: "a" }), pod({ id: "b" }), pod({ id: "c" })];
    const r1 = matchPlan(plan, pods, { referenceDate: REF });
    const r2 = matchPlan(plan, pods, { referenceDate: REF });
    expect(r1).toEqual(r2);
  });

  it("hard-filters inactive and archived shows", () => {
    const pods = [
      pod({ id: "live" }),
      pod({ id: "dead", status: "inactive" }),
      pod({ id: "gone", status: "archived" }),
    ];
    const r = matchPlan(plan, pods, { referenceDate: REF });
    const ids = r.organic.map((x) => x.podcastId);
    expect(ids).toContain("live");
    expect(ids).not.toContain("dead");
    expect(ids).not.toContain("gone");
    expect(r.excludedCount).toBe(2);
  });

  it("excludes shows priced over budget; unknown price becomes contact, never a number", () => {
    const pods = [
      pod({
        id: "too-expensive",
        inventory: [
          {
            id: "i1",
            creativeFormat: "host_read",
            mediaType: "audio",
            pricingModel: "flat_rate",
            priceStarting: 50_000,
            priceMax: 50_000,
            availabilityStatus: "active",
          },
        ],
      }),
      pod({ id: "no-price" }),
    ];
    const r = matchPlan(plan, pods, { referenceDate: REF });
    expect(r.organic.map((x) => x.podcastId)).not.toContain("too-expensive");
    const noPrice = r.organic.find((x) => x.podcastId === "no-price");
    expect(noPrice?.priceBucket).toBe("contact");
  });

  it("boosts go to a labeled featured list and never change organic scores", () => {
    const base = [pod({ id: "a" }), pod({ id: "b" }), pod({ id: "c" })];
    const noBoost = matchPlan(plan, base, { referenceDate: REF });
    const withBoost = matchPlan(
      plan,
      base.map((p) =>
        p.id === "b" ? { ...p, activeBoostScopes: ["planner_results"] } : p,
      ),
      { referenceDate: REF },
    );
    // b is featured and marked
    expect(withBoost.featured.map((x) => x.podcastId)).toEqual(["b"]);
    expect(withBoost.featured[0].isFeatured).toBe(true);
    // b's score is identical to its unboosted score — money can't buy rank
    const scoreUnboosted = noBoost.organic.find((x) => x.podcastId === "b")!.score;
    expect(withBoost.featured[0].score).toBe(scoreUnboosted);
    // remaining organic keeps the same relative order as before
    const beforeOrder = noBoost.organic
      .map((x) => x.podcastId)
      .filter((id) => id !== "b");
    const afterOrder = withBoost.organic.map((x) => x.podcastId);
    expect(afterOrder).toEqual(beforeOrder);
  });

  it("every result explains itself", () => {
    const r = matchPlan(plan, [pod({ id: "a" })], { referenceDate: REF });
    for (const row of [...r.featured, ...r.organic]) {
      expect(row.reasons.length).toBeGreaterThan(0);
    }
  });

  it("localOnly geography excludes other markets", () => {
    const pods = [
      pod({ id: "atl", geography: { countryCode: "US", state: "GA", city: "Atlanta" } }),
      pod({ id: "mia", geography: { countryCode: "US", state: "FL", city: "Miami" } }),
    ];
    const r = matchPlan(
      { ...plan, geography: { level: "city", value: "Atlanta", localOnly: true } },
      pods,
      { referenceDate: REF },
    );
    expect(r.organic.map((x) => x.podcastId)).toEqual(["atl"]);
  });
});
