import Link from "next/link";
import type { ChartEntry } from "@/lib/charts";
import { CoverArt } from "./cover-art";
import { Badge } from "./badges";

export function ChartTable({
  entries,
  metricLabel,
  limit,
}: {
  entries: ChartEntry[];
  metricLabel: string;
  limit?: number;
}) {
  const rows = limit ? entries.slice(0, limit) : entries;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-navy-1">
      {rows.map((e) => (
        <Link
          key={e.slug}
          href={`/podcast/${e.slug}`}
          className="flex items-center gap-4 border-b border-line-soft px-4 py-3 last:border-0 hover:bg-navy-2"
        >
          <span className="w-6 flex-none text-center text-lg font-extrabold tabular-nums text-ink">
            {e.rank}
          </span>
          <CoverArt name={e.name} slug={e.slug} artworkUrl={e.artworkUrl} size={40} radius={9} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{e.name}</span>
            <span className="block truncate text-xs text-ink-dim">
              {e.primaryCategory}
            </span>
          </span>
          <span className="flex-none text-right">
            <span className="block text-base font-extrabold tabular-nums">
              {e.display}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-ink-faint">
              {metricLabel}
            </span>
          </span>
          <span className="hidden flex-none sm:block">
            <Badge tone={e.source === "Estimated" ? "estimated" : "public"}>
              {e.source}
            </Badge>
          </span>
        </Link>
      ))}
    </div>
  );
}
