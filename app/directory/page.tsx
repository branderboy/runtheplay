import Link from "next/link";
import { searchPodcasts, listCategories } from "@/lib/data/podcasts";
import { PodcastCard } from "@/components/podcast-card";

export const metadata = { title: "The Directory" };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; format?: string }>;
}) {
  const { q, category, format } = await searchParams;
  const results = searchPodcasts(q, category, format);
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-sky-50 pb-8 md:flex-row md:items-end">
        <div>
          <h1 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
            01 / The Directory
          </h1>
          <p className="display text-4xl text-ink md:text-6xl">
            Your media mix.
          </p>
          <p className="mt-4 max-w-xl text-base font-medium text-ink-dim">
            No more scrolling Instagram, searching YouTube, and emailing one by
            one. Independent Black podcasts, organized into one searchable
            marketplace.
          </p>
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-ink-faint">
          Showing <span className="text-sky-500">{results.length}</span> creators
        </div>
      </div>

      {/* Active filter (set from the homepage campaign bar) */}
      {q && (
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600">
            Filter: {q}
          </span>
          <Link
            href="/directory"
            className="text-xs font-black uppercase tracking-widest text-ink-faint hover:text-danger"
          >
            Clear ✕
          </Link>
        </div>
      )}

      {/* Format chips — audio / video / social support */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-ink-faint">
          Format
        </span>
        {[
          ["", "All"],
          ["video", "Video"],
          ["audio", "Audio only"],
          ["social", "Social support"],
        ].map(([value, label]) => (
          <CategoryChip
            key={label}
            active={(format ?? "") === value}
            href={`/directory?${new URLSearchParams({
              ...(category ? { category } : {}),
              ...(value ? { format: value } : {}),
            }).toString()}`}
            label={label}
          />
        ))}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-ink-faint">
          Category
        </span>
        <CategoryChip
          active={!category}
          href={`/directory${format ? `?format=${format}` : ""}`}
          label="All"
        />
        {categories.map((c) => (
          <CategoryChip
            key={c}
            active={category === c}
            href={`/directory?${new URLSearchParams({
              category: c,
              ...(format ? { format } : {}),
            }).toString()}`}
            label={c}
          />
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="mt-16 rounded-[2rem] border border-dashed border-sky-100 py-20 text-center text-lg font-bold uppercase tracking-widest text-ink-faint">
          No matching media found. Try adjusting your search.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <PodcastCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
        active
          ? "border-sky-500 bg-sky-500 text-white shadow-md"
          : "border-slate-200 bg-white text-ink-dim hover:border-sky-300 hover:text-sky-500"
      }`}
    >
      {label}
    </Link>
  );
}
