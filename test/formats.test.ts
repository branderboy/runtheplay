import { describe, it, expect } from "vitest";
import { deriveFormats, typicalPlacements } from "@/lib/formats";
import { getAllPodcasts, searchPodcasts } from "@/lib/data/podcasts";
import type { Podcast } from "@/lib/data/podcasts";

function fake(platforms: string[]): Podcast {
  return {
    name: "Test",
    slug: "test",
    shortDescription: null,
    officialWebsite: null,
    artworkUrl: null,
    hosts: [],
    networkName: null,
    independentOrNetwork: null,
    primaryCategory: "Music",
    secondaryCategories: [],
    audienceTags: [],
    country: null,
    stateOrRegion: null,
    city: null,
    publishingFrequency: null,
    mostRecentEpisodeDate: null,
    status: "active",
    advertisingAvailable: null,
    advertisingContactEmail: null,
    advertisingContactUrl: null,
    mediaKitUrl: null,
    platforms: platforms.map((p) => ({ platform: p, url: `https://x/${p}`, followers: null })),
    dataConfidence: null,
    primarySourceUrl: null,
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
  };
}

describe("format derivation", () => {
  it("YouTube => video + clips; Spotify/Apple => audio", () => {
    const f = deriveFormats(fake(["youtube", "spotify"]));
    expect(f.video).toBe(true);
    expect(f.audio).toBe(true);
    expect(f.clips).toBe(true);
    expect(f.label).toBe("Video + Audio");
  });

  it("audio-only show has no video placements", () => {
    const f = deriveFormats(fake(["spotify", "apple"]));
    expect(f.label).toBe("Audio");
    const channels = typicalPlacements(f).map((g) => g.channel);
    expect(channels).toContain("Host-Read");
    expect(channels).not.toContain("Video");
  });

  it("social platforms produce social placements", () => {
    const f = deriveFormats(fake(["youtube", "instagram", "tiktok"]));
    expect(f.social).toEqual(["instagram", "tiktok"]);
    const social = typicalPlacements(f).find((g) => g.channel === "Social");
    expect(social?.placements).toContain("Instagram Post / Reel");
    expect(social?.placements).toContain("TikTok Video");
  });

  it("every real show derives at least one placement group", () => {
    for (const p of getAllPodcasts()) {
      expect(typicalPlacements(deriveFormats(p)).length, p.slug).toBeGreaterThan(0);
    }
  });

  it("directory format filter narrows results without emptying them", () => {
    const all = searchPodcasts().length;
    const video = searchPodcasts(undefined, undefined, "video").length;
    const audioOnly = searchPodcasts(undefined, undefined, "audio").length;
    const social = searchPodcasts(undefined, undefined, "social").length;
    expect(video).toBeGreaterThan(0);
    expect(social).toBeGreaterThan(0);
    expect(video).toBeLessThanOrEqual(all);
    expect(audioOnly + video).toBeLessThanOrEqual(all);
  });
});
