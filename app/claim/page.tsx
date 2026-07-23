import Link from "next/link";
import { searchPodcasts } from "@/lib/data/podcasts";

export const metadata = { title: "Claim Your Profile" };

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? searchPodcasts(q).slice(0, 12) : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink-dim">
        For creators
      </p>
      <h1 className="text-3xl font-extrabold">Claim your profile</h1>
      <p className="mt-3 text-ink-dim">
        Listing is free. Find your show, then verify with your public business
        email — if it matches what's on file, you're verified instantly.
      </p>

      <form action="/claim" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search for your show…"
          aria-label="Search for your show"
          className="flex-1 rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange"
        />
        <button
          type="submit"
          className="rounded-lg bg-orange px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-navy"
        >
          Find it
        </button>
      </form>

      {q && (
        <div className="mt-8">
          {results.length === 0 ? (
            <p className="text-ink-faint">
              No match. Your show may not be listed yet — email hello@runtheplay
              to get added.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line-soft overflow-hidden rounded-2xl border border-line">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/podcast/${p.slug}#claim`}
                    className="flex items-center justify-between bg-navy-1 px-5 py-4 hover:bg-navy-2"
                  >
                    <span>
                      <span className="font-bold">{p.name}</span>
                      <span className="ml-2 text-sm text-ink-faint">
                        {p.primaryCategory}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-ink-dim hover:text-ink">
                      Claim →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
