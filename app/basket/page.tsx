"use client";

import Link from "next/link";
import { useBasket } from "@/components/basket";
import { FinalizePlanForm } from "@/components/finalize-plan-form";
import { CoverArt } from "@/components/cover-art";

export default function BasketPage() {
  const { items, remove, clear } = useBasket();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-baseline justify-between gap-4">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
          Your Media Mix
        </p>
        <Link
          href="/plans"
          className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500"
        >
          My Plans →
        </Link>
      </div>
      <h1 className="display text-4xl text-ink sm:text-5xl">
        {items.length > 0 ? "Your Plan So Far." : "Nothing Saved Yet."}
      </h1>
      <p className="mt-4 max-w-xl text-lg font-medium text-ink-dim">
        {items.length > 0
          ? "Contact each show from its profile. Pricing is confirmed with the creator."
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
                className="flex flex-col gap-4 rounded-[2rem] border border-sky-50 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <Link
                  href={`/podcast/${i.slug}`}
                  className="group flex min-w-0 items-center gap-5"
                >
                  <CoverArt
                    name={i.name}
                    slug={i.slug}
                    artworkUrl={i.artworkUrl ?? `/covers/${i.slug}.jpg`}
                    size={72}
                    radius={18}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xl font-black uppercase tracking-tight text-ink group-hover:text-sky-600 sm:text-2xl">
                      {i.name}
                    </span>
                    <span className="mt-1 block text-sm font-bold text-ink-dim">
                      {i.category ?? "Podcast"} · Contact for Pricing
                    </span>
                  </span>
                </Link>
                <div className="flex flex-none items-center gap-3">
                  <Link
                    href={`/podcast/${i.slug}#contact`}
                    className="rounded-full bg-sky-50 px-6 py-3 text-sm font-black uppercase tracking-widest text-sky-600 transition-colors hover:bg-sky-500 hover:text-white"
                  >
                    Contact
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(i.slug)}
                    aria-label={`Remove ${i.name}`}
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black uppercase tracking-widest text-ink-faint transition-colors hover:border-danger hover:text-danger"
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
              Clear All
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              Pricing Is Set by Each Show, Never by Run the Play
            </p>
          </div>

          <div className="mt-10">
            <FinalizePlanForm />
          </div>
        </>
      )}
    </div>
  );
}
