"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PlanRef = { id: string; count: number; at: string };

/**
 * My Plans: saved-plan links tracked in this browser. Email magic-link
 * access replaces this as the account door once Resend is wired.
 */
export default function MyPlansPage() {
  const [plans, setPlans] = useState<PlanRef[] | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("rtp-my-plans") ?? "[]");
      setPlans(Array.isArray(raw) ? raw.reverse() : []);
    } catch {
      setPlans([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
        Your Account
      </p>
      <h1 className="display text-4xl text-ink sm:text-5xl">My Plans.</h1>
      <p className="mt-4 max-w-xl text-lg font-medium text-ink-dim">
        Every plan you save gets a permanent link. The ones saved in this
        browser are listed here.
      </p>

      {plans && plans.length === 0 && (
        <div className="mt-10 rounded-[2rem] border border-sky-50 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-bold text-ink-dim">
            No plans saved in this browser yet. Build a media mix, then save it
            from the Finalize Plan step.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/plan"
              className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5"
            >
              Run the Ad Planner
            </Link>
            <Link
              href="/directory"
              className="rounded-full border border-sky-100 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-ink shadow-sm transition-all hover:-translate-y-0.5"
            >
              Explore Podcasts
            </Link>
          </div>
        </div>
      )}

      {plans && plans.length > 0 && (
        <ul className="mt-10 flex flex-col gap-3">
          {plans.map((p) => (
            <li key={p.id}>
              <Link
                href={`/plans/${p.id}`}
                className="flex items-center justify-between gap-4 rounded-[2rem] border border-sky-50 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.25)]"
              >
                <div>
                  <p className="text-lg font-black uppercase tracking-tight text-ink">
                    {p.count} {p.count === 1 ? "Show" : "Shows"} Media Mix
                  </p>
                  <p className="text-sm font-bold text-ink-faint">
                    Saved{" "}
                    {new Date(p.at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-sky-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-sky-600">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
