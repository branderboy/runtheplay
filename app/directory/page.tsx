import Link from "next/link";
import { searchPodcasts, listCategories } from "@/lib/data/podcasts";
import { PodcastCard } from "@/components/podcast-card";

export const metadata = { title: "Explore Podcasts" };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const results = searchPodcasts(q, category);
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-extrabold">Explore Podcasts</h1>
      <p className="mt-2 text-ink-dim">
        {results.length} Black-creator {results.length === 1 ? "show" : "shows"} —
        mainly hip-hop and culture. Listings are unverified until a creator claims
        them.
      </p>

      {/* Search */}
      <form action="/directory" className="mt-6 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by show, host, or audience…"
          aria-label="Search podcasts"
          className="flex-1 rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange"
        />
        <button
          type="submit"
          className="rounded-lg bg-orange px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-navy"
        >
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <CategoryChip active={!category} href="/directory" label="All" />
        {categories.map((c) => (
          <CategoryChip
            key={c}
            active={category === c}
            href={`/directory?category=${encodeURIComponent(c)}`}
            label={c}
          />
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-ink-faint">
          No shows match that yet. Try a broader search or a different category.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-orange bg-orange text-navy"
          : "border-line bg-navy-2 text-ink-dim hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
