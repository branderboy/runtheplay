/**
 * Deterministic, brand-consistent generated cover art. Each show gets its own
 * accent (seeded by slug) over the navy brand ground, so all 66 feel like one
 * system while staying visually distinct — no external image assets, no rights
 * issues. Real artwork replaces this the moment a creator uploads one.
 */

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

// Brand-locked accents only: sky/blue family + orange. No off-palette hues.
const HUES = [199, 207, 217, 226, 17, 24];

export interface Accent {
  h: number;
  accent: string;
  accentDeep: string;
  glow: string;
}

export function accentFor(slug: string): Accent {
  const h = HUES[hashString(slug) % HUES.length];
  return {
    h,
    accent: `hsl(${h} 74% 56%)`,
    accentDeep: `hsl(${h} 68% 38%)`,
    glow: `hsl(${h} 80% 58%)`,
  };
}

export function initials(name: string): string {
  return (
    name
      .replace(/^the\s+/i, "")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "RTP"
  );
}
