"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { searchShowsForClaim, type ClaimSearchResult } from "@/lib/actions";
import { CoverArt } from "@/components/cover-art";

/**
 * Yelp-style claim flow: search the real database as you type. Every result
 * shows whether the show is claimed and whether the claim verifies instantly.
 * A miss routes straight into the Get Listed form with the name carried over.
 */
export function ClaimSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState<ClaimSearchResult[] | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = (value: string) => {
    startTransition(async () => {
      setResults(await searchShowsForClaim(value));
    });
  };

  const onChange = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults(null);
      return;
    }
    timer.current = setTimeout(() => run(value), 250);
  };

  useEffect(() => {
    if (initialQuery.trim().length >= 2) run(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl text-left">
      <input
        value={q}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your show's name…"
        aria-label="Search for your show"
        className="w-full rounded-full border border-sky-100 bg-white px-6 py-4 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
      />

      {pending && results === null && (
        <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-ink-faint">
          Checking the database…
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-5 flex flex-col divide-y divide-sky-50 overflow-hidden rounded-[1.5rem] border border-sky-50 bg-white shadow-[0_20px_40px_-20px_rgba(14,165,233,0.2)]">
          {results.map((r) => (
            <li key={r.slug} className="flex items-center gap-4 p-4">
              <CoverArt
                name={r.name}
                slug={r.slug}
                artworkUrl={r.artworkUrl}
                size={44}
                radius={12}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black tracking-tight text-ink">
                  {r.name}
                </p>
                <p className="truncate text-[11px] font-bold text-ink-faint">
                  {r.category ?? "Podcast"} ·{" "}
                  {r.claimStatus === "unclaimed"
                    ? r.hasEmailOnFile
                      ? "Email on File · Instant Verify"
                      : "No Email on File · Manual Review"
                    : r.claimStatus === "pending"
                      ? "A Claim Is Under Review"
                      : "Verified by the Show"}
                </p>
              </div>
              {r.claimStatus === "claimed" ? (
                <span className="flex-none rounded-full bg-sky-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                  Claimed
                </span>
              ) : r.claimStatus === "pending" ? (
                <span className="flex-none rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-ink-faint">
                  Pending
                </span>
              ) : (
                <Link
                  href={`/podcast/${r.slug}#claim`}
                  className="flex-none rounded-full bg-orange px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Claim It
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {results && results.length === 0 && (
        <div className="mt-5 rounded-[1.5rem] border border-sky-50 bg-white p-6 text-center shadow-sm">
          <p className="mb-1 text-sm font-black uppercase tracking-tight text-ink">
            Not in the Database Yet
          </p>
          <p className="mb-4 text-sm font-medium text-ink-dim">
            No show matches "{q}". Get listed free and we'll build your
            profile.
          </p>
          <Link
            href={`/creators?show=${encodeURIComponent(q)}#signup`}
            className="inline-block rounded-full bg-orange px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600"
          >
            Get Listed Free
          </Link>
        </div>
      )}
    </div>
  );
}
