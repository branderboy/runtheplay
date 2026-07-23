import { describe, it, expect } from "vitest";
import { allocateBudget } from "@/src/lib/planner/allocate";

const CPM = { cpmLow: 25, cpmHigh: 50 };

const slate = [
  { podcastId: "a", name: "A", score: 90 },
  { podcastId: "b", name: "B", score: 60 },
  { podcastId: "c", name: "C", score: 30 },
];

describe("allocateBudget", () => {
  it("splits the full budget, no dollar lost to rounding", () => {
    const out = allocateBudget(1500, slate, CPM);
    expect(out).not.toBeNull();
    const sum = out!.lines.reduce((n, l) => n + l.dollars, 0);
    expect(sum).toBe(1500);
  });

  it("allocates proportionally to score, strongest match first", () => {
    const out = allocateBudget(1800, slate, CPM)!;
    expect(out.lines[0].dollars).toBeGreaterThan(out.lines[1].dollars);
    expect(out.lines[1].dollars).toBeGreaterThan(out.lines[2].dollars);
  });

  it("computes impressions from the sourced CPM range, low <= high", () => {
    const out = allocateBudget(1000, slate, CPM)!;
    for (const l of out.lines) {
      expect(l.impressionsLow).toBeLessThanOrEqual(l.impressionsHigh);
      expect(l.impressionsLow).toBe(Math.round((l.dollars / 50) * 1000));
      expect(l.impressionsHigh).toBe(Math.round((l.dollars / 25) * 1000));
    }
  });

  it("returns null with no budget or an empty slate", () => {
    expect(allocateBudget(0, slate, CPM)).toBeNull();
    expect(allocateBudget(NaN, slate, CPM)).toBeNull();
    expect(allocateBudget(1000, [], CPM)).toBeNull();
  });

  it("caps the slate at maxShows", () => {
    const big = Array.from({ length: 10 }, (_, i) => ({
      podcastId: String(i),
      name: `S${i}`,
      score: 100 - i,
    }));
    expect(allocateBudget(1000, big, CPM)!.lines).toHaveLength(5);
  });
});
