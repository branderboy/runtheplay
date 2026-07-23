import Link from "next/link";
import { searchPodcasts, listCategories } from "@/lib/data/podcasts";
import { PodcastCard } from "@/components/podcast-card";

export const metadata = { title: "The Directory" };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const results = searchPodcasts(q, category);
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
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-ink-faint">
          Showing <span className="text-sky-500">{results.length}</span> creators
        </div>
      </div>

      {/* Search */}
      <form
        action="/directory"
        className="flex flex-col gap-3 rounded-[2rem] border border-sky-100 bg-white p-3 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.2)] md:flex-row"
      >
        {category && <input type="hidden" name="category" value={category} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by show, host, or audience…"
          aria-label="Search podcasts"
          className="flex-1 rounded-2xl border border-transparent bg-navy-2 px-6 py-4 text-base font-black text-ink outline-none transition-all placeholder:text-ink-faint focus:border-sky-100 focus:bg-sky-50/50"
        />
        <button
          type="submit"
          className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5"
        >
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="mt-5 flex flex-wrap gap-2">
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
