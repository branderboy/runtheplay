import { describe, it, expect } from "vitest";
import { thesis, caseStudies, partnerships } from "@/lib/data/thesis";

describe("thesis data sheet (the site's WHY)", () => {
  it("every stat carries a value, label, and source — no unsourced claims", () => {
    for (const s of [...thesis.whyItWorks, ...thesis.growth]) {
      expect(s.value.length, s.id).toBeGreaterThan(0);
      expect(s.label.length, s.id).toBeGreaterThan(0);
      expect(s.source.length, s.id).toBeGreaterThan(0);
    }
  });

  it("the arbitrage numbers are coherent (mid-tier under outliers)", () => {
    const a = thesis.arbitrage;
    expect(a.midTier.cpmHigh).toBeLessThan(a.outliers.cpmLow + a.outliers.cpmHigh);
    expect(a.midTier.cpmLow).toBeLessThan(a.outliers.cpmLow);
    expect(a.outliers.cpmLow).toBeLessThan(a.outliers.cpmHigh);
    expect(a.midTier.cpmLow).toBeLessThan(a.midTier.cpmHigh);
  });

  it("positioning and sources exist", () => {
    expect(thesis.positioning.premise.length).toBeGreaterThan(50);
    expect(thesis.sources.length).toBeGreaterThan(2);
  });
});

describe("case studies data sheet", () => {
  it("every case study has a real source URL — nothing unsourced ships", () => {
    expect(caseStudies.length).toBeGreaterThanOrEqual(8);
    for (const c of caseStudies) {
      expect(c.sourceUrl, c.brand || c.show).toMatch(/^https:\/\//);
      expect(c.sourceTitle.length, c.brand || c.show).toBeGreaterThan(0);
      expect(c.summary.length, c.brand || c.show).toBeGreaterThan(20);
    }
  });

  it("has enough partnerships to fill the receipts section", () => {
    expect(partnerships.length).toBeGreaterThanOrEqual(5);
  });

  it("source URLs are unique (no duplicated receipts)", () => {
    const urls = caseStudies.map((c) => c.sourceUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
