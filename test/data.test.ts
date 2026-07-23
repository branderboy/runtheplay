import { describe, it, expect } from "vitest";
import { getAllPodcasts, listCategories, searchPodcasts, toPlannerInput } from "@/lib/data/podcasts";

describe("seed data integrity", () => {
  const pods = getAllPodcasts();

  it("loads the full seed (60+ shows)", () => {
    expect(pods.length).toBeGreaterThanOrEqual(60);
  });

  it("slugs are unique and well-formed", () => {
    const slugs = pods.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("NEEDS_VERIFICATION never leaks into displayed fields", () => {
    for (const p of pods) {
      const values = [
        p.name,
        p.shortDescription,
        p.primaryCategory,
        p.networkName,
        ...p.hosts,
        ...p.audienceTags,
        ...p.platforms.map((x) => x.url),
      ];
      for (const v of values) {
        if (v) expect(v.toUpperCase()).not.toContain("NEEDS_VERIFICATION");
      }
    }
  });

  it("real Spotify cover art is overlaid for 50+ shows", () => {
    const withArt = pods.filter((p) => p.artworkUrl?.includes("spotifycdn") || p.artworkUrl?.startsWith("/covers/"));
    expect(withArt.length).toBeGreaterThanOrEqual(50);
  });

  it("every show has a name, category, and at least one platform link", () => {
    for (const p of pods) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.primaryCategory).toBeTruthy();
      expect(p.platforms.length).toBeGreaterThan(0);
    }
  });

  it("search finds shows by name and host", () => {
    expect(searchPodcasts("drink champs").length).toBeGreaterThan(0);
    expect(searchPodcasts("shannon sharpe").length).toBeGreaterThan(0);
    expect(searchPodcasts("zzz-no-such-show").length).toBe(0);
  });

  it("categories are non-empty and deduped", () => {
    const cats = listCategories();
    expect(cats.length).toBeGreaterThan(5);
    expect(new Set(cats).size).toBe(cats.length);
  });

  it("planner adapter produces valid input for every show", () => {
    for (const p of pods) {
      const input = toPlannerInput(p);
      expect(input.id).toBe(p.slug);
      expect(input.dataFillRatio).toBeGreaterThanOrEqual(0);
      expect(input.dataFillRatio).toBeLessThanOrEqual(1);
    }
  });
});
