import type { Podcast } from "@/lib/data/podcasts";

/**
 * Derives a show's media formats from its ACTUAL public platform presence —
 * never claimed, always derivable: a YouTube channel means video + clips, a
 * Spotify/Apple feed means audio, IG/TikTok means social amplification.
 */
export interface ShowFormats {
  video: boolean;
  audio: boolean;
  clips: boolean;
  social: string[]; // e.g. ["instagram", "tiktok"]
  label: string; // "Video + Audio" | "Video" | "Audio" | "Podcast"
}

export function deriveFormats(p: Podcast): ShowFormats {
  const has = (x: string) => p.platforms.some((pl) => pl.platform === x);
  const video = has("youtube");
  const audio = has("spotify") || has("apple");
  const social = ["instagram", "tiktok"].filter(has);
  const clips = video || social.length > 0;
  const label =
    video && audio ? "Video + Audio" : video ? "Video" : audio ? "Audio" : "Podcast";
  return { video, audio, clips, social, label };
}

/**
 * Typical ad placements for a show's format set, grouped by channel. These are
 * the industry-standard placement types the format supports — final formats,
 * rates, and availability are confirmed by the show (or via its claimed
 * inventory), so the UI must label these as "typical", not "offered".
 */
export interface PlacementGroup {
  channel: string;
  placements: string[];
}

export function typicalPlacements(f: ShowFormats): PlacementGroup[] {
  const groups: PlacementGroup[] = [];
  if (f.audio || f.video) {
    groups.push({
      channel: "Host-Read",
      placements: ["30–60s Host-Read Ad", "Pre-Roll", "Mid-Roll", "Post-Roll"],
    });
  }
  if (f.video) {
    groups.push({
      channel: "Video",
      placements: [
        "Video Host-Read",
        "30s Video Ad",
        "Product Placement",
        "Branded Segment",
      ],
    });
  }
  if (f.clips) {
    groups.push({
      channel: "Clips",
      placements: ["Sponsored Clip", "Clip Series"],
    });
  }
  if (f.social.length > 0) {
    groups.push({
      channel: "Social",
      placements: [
        ...f.social.map((s) =>
          s === "instagram" ? "Instagram Post / Reel" : "TikTok Video",
        ),
        "Story Mention",
      ],
    });
  }
  return groups;
}
