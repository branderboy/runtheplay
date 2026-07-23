import type { Podcast } from "@/lib/data/podcasts";
import { accentFor, hashString } from "@/lib/cover";
import { CoverArt } from "./cover-art";
import { Badge } from "./badges";

export function ProfileHero({ p }: { p: Podcast }) {
  const a = accentFor(p.slug);
  const id = `hero-${hashString(p.slug).toString(36)}`;
  const seed = hashString(p.slug);
  const glowX = 0.15 + ((seed % 60) / 100); // 0.15–0.75
  const rot = (seed % 50) - 25;
  const location = [p.city, p.stateOrRegion].filter(Boolean).join(", ");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line">
      {/* Generated background */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 170"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a.accentDeep} />
            <stop offset="0.55" stopColor="#0c1c30" />
            <stop offset="1" stopColor="#0a1524" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx={glowX} cy="0.2" r="0.7">
            <stop offset="0" stopColor={a.glow} stopOpacity="0.5" />
            <stop offset="1" stopColor={a.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="170" fill={`url(#${id}-bg)`} />
        <rect width="400" height="170" fill={`url(#${id}-glow)`} />
        <g
          transform={`rotate(${rot} 330 150)`}
          stroke={a.accent}
          strokeWidth="2.5"
          fill="none"
          opacity="0.4"
        >
          <path d="M250 175 A70 70 0 0 1 320 105" />
          <path d="M262 185 A88 88 0 0 1 350 97" opacity="0.6" />
          <path d="M276 196 A108 108 0 0 1 384 88" opacity="0.4" />
        </g>
      </svg>

      {/* Scrim for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />

      {/* Overlay content */}
      <div className="relative flex items-end gap-4 p-5 pt-24 sm:p-7 sm:pt-28">
        <div className="flex-none rounded-2xl ring-1 ring-white/10">
          <CoverArt
            name={p.name}
            slug={p.slug}
            artworkUrl={p.artworkUrl}
            size={84}
            radius={16}
          />
        </div>
        <div className="min-w-0 pb-1">
          <h1 className="text-balance text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {p.name}
          </h1>
          <p className="mt-1 truncate text-sm text-white/75">
            {p.primaryCategory}
            {location ? ` · ${location}` : ""}
            {p.hosts.length ? ` · ${p.hosts.slice(0, 3).join(", ")}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="unclaimed">Unclaimed</Badge>
            <Badge tone="public">Public source</Badge>
            {p.advertisingAvailable && (
              <Badge tone="contact">Advertising available</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
