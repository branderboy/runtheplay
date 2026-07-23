"use client";

import Link from "next/link";
import { useBasket } from "@/components/basket";

export default function BasketPage() {
  const { items, remove, clear } = useBasket();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
        Your Media Mix
      </p>
      <h1 className="display text-4xl text-ink sm:text-5xl">
        {items.length > 0 ? "Your plan so far." : "Nothing saved yet."}
      </h1>
      <p className="mt-4 max-w-xl text-lg font-medium text-ink-dim">
        {items.length > 0
          ? "Contact each show directly from its profile — pricing and availability are confirmed with the creator, not by Run the Play."
          : "Browse the directory or run the Ad Planner, then add shows to build your media mix."}
      </p>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/directory"
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5"
          >
            Explore Podcasts
          </Link>
          <Link
            href="/plan"
            className="rounded-full border border-sky-100 bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-ink shadow-sm transition-all hover:-translate-y-0.5"
          >
            Ad Planner
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 flex flex-col gap-3">
            {items.map((i) => (
              <li
                key={i.slug}
                className="flex items-center justify-between gap-4 rounded-[2rem] border border-sky-50 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)]"
              >
                <div className="min-w-0">
                  <Link
                    href={`/podcast/${i.slug}`}
                    className="block truncate text-lg font-black uppercase tracking-tight text-ink hover:text-sky-600"
                  >
                    {i.name}
                  </Link>
                  <p className="text-sm font-bold text-ink-faint">
                    {i.category ?? "Podcast"} · Contact for pricing
                  </p>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <Link
                    href={`/podcast/${i.slug}`}
                    className="rounded-full bg-sky-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-sky-600 transition-colors hover:bg-sky-500 hover:text-white"
                  >
                    Contact
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(i.slug)}
                    aria-label={`Remove ${i.name}`}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:border-danger hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={clear}
              className="text-xs font-black uppercase tracking-widest text-ink-faint hover:text-danger"
            >
              Clear all
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              Pricing is set by each show — never by Run the Play
            </p>
          </div>
        </>
      )}
    </div>
  );
}
