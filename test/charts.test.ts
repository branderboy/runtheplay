import { describe, it, expect } from "vitest";
import { CHARTS, computeChart } from "@/lib/charts";

describe("charts data engine", () => {
  // Overlay-fed charts are legitimately empty until their weekly data source
  // has run at least once (and the UI hides empty charts).
  const OVERLAY_FED = new Set(["viral-clips"]);

  it("every defined chart computes non-empty, correctly ranked entries", () => {
    for (const c of CHARTS) {
      const entries = computeChart(c.slug);
      if (entries.length === 0) {
        expect(OVERLAY_FED.has(c.slug), `${c.slug} should not be empty`).toBe(true);
        continue;
      }
      expect(entries.length, c.slug).toBeLessThanOrEqual(15);
      // ranks are 1..n and values sorted descending
      entries.forEach((e, i) => {
        expect(e.rank).toBe(i + 1);
        if (i > 0) expect(entries[i - 1].value).toBeGreaterThanOrEqual(e.value);
        expect(e.display.length).toBeGreaterThan(0);
        expect(["Public", "Estimated"]).toContain(e.source);
      });
    }
  });

  it("every chart has a methodology (charts must be defensible)", () => {
    for (const c of CHARTS) {
      expect(c.methodology.length).toBeGreaterThan(20);
    }
  });

  it("unknown chart slug returns empty, not a crash", () => {
    expect(computeChart("nope")).toEqual([]);
  });
});
