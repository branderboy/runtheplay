import Link from "next/link";
import type { Podcast } from "@/lib/data/podcasts";
import { Badge } from "./badges";
import { CoverArt } from "./cover-art";

function reach(p: Podcast): string | null {
  const yt = p.platforms.find((x) => x.platform === "youtube")?.followers;
  if (yt) return `${(yt / 1e6).toFixed(yt >= 1e6 ? 1 : 0)}M YouTube`.replace("0M", "M");
  const ig = p.platforms.find((x) => x.platform === "instagram")?.followers;
  if (ig) return `${Math.round(ig / 1e3)}K Instagram`;
  return null;
}

export function PodcastCard({ p }: { p: Podcast }) {
  const r = reach(p);
  return (
    <Link
      href={`/podcast/${p.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-navy-1 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex-none">
          <CoverArt name={p.name} slug={p.slug} artworkUrl={p.artworkUrl} size={48} radius={12} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold leading-tight">{p.name}</h3>
          <p className="mt-0.5 truncate text-[12px] text-ink-dim">
            {p.primaryCategory ?? "Podcast"}
            {p.city ? ` · ${p.city}` : ""}
          </p>
        </div>
      </div>

      {p.shortDescription && (
        <p className="line-clamp-2 text-[13px] leading-snug text-ink-dim">
          {p.shortDescription}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge tone="unclaimed">Unclaimed</Badge>
        {p.advertisingAvailable ? (
          <Badge tone="contact">Advertising available</Badge>
        ) : null}
        {r && <span className="text-[11px] text-ink-faint">{r}</span>}
      </div>
    </Link>
  );
}
