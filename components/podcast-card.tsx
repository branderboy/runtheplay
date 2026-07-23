import Link from "next/link";
import type { Podcast } from "@/lib/data/podcasts";
import { CoverArt } from "./cover-art";
import { AddToPlanButton } from "./basket";

function reach(p: Podcast): string | null {
  const fmt = (n: number, label: string) =>
    n >= 1e6
      ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M ${label}`
      : `${Math.round(n / 1e3)}K ${label}`;
  const yt = p.platforms.find((x) => x.platform === "youtube")?.followers;
  if (yt) return fmt(yt, "Subs");
  const ig = p.platforms.find((x) => x.platform === "instagram")?.followers;
  if (ig) return fmt(ig, "Followers");
  return null;
}

export function PodcastCard({ p }: { p: Podcast }) {
  const r = reach(p);
  return (
    <div className="group relative flex h-full flex-col rounded-[2rem] border border-sky-50 bg-white p-7 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(14,165,233,0.25)]">
      <Link
        href={`/podcast/${p.slug}`}
        className="mb-6 flex items-center gap-4"
        aria-label={`View ${p.name}`}
      >
        <CoverArt name={p.name} slug={p.slug} artworkUrl={p.artworkUrl} size={56} radius={16} />
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-lg font-black uppercase leading-none tracking-tight text-ink group-hover:text-sky-600">
            {p.name}
          </h3>
          <p className="truncate text-sm font-bold text-ink-faint">
            {p.hosts.length ? p.hosts.slice(0, 2).join(", ") : p.primaryCategory}
          </p>
        </div>
      </Link>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-sky-50 bg-white p-4 shadow-sm">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-ink-faint">
            Audience
          </span>
          <span className="text-lg font-black tabular-nums text-ink">
            {r ?? "—"}
          </span>
        </div>
        <div className="rounded-2xl border border-sky-50 bg-white p-4 shadow-sm">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-ink-faint">
            Format
          </span>
          <span className="text-sm font-black text-ink">
            {p.primaryCategory ?? "Podcast"}
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="text-xs font-black uppercase leading-tight tracking-widest text-ink-faint">
          Contact for
          <br />
          pricing
        </div>
        <AddToPlanButton slug={p.slug} name={p.name} category={p.primaryCategory} />
      </div>
    </div>
  );
}
