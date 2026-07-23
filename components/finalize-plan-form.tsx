"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { finalizePlan, type ActionState } from "@/lib/actions";
import { useBasket } from "@/components/basket";

const init: ActionState = { ok: false, message: "" };

/**
 * The advertiser account moment (A4 in docs/logic.md): planning is open,
 * finalizing creates the account and saves the plan.
 */
export function FinalizePlanForm() {
  const { items } = useBasket();
  const [state, action, pending] = useActionState(finalizePlan, init);

  // Track saved plans in this browser so /plans can list them.
  useEffect(() => {
    if (!state.ok || !state.planId) return;
    try {
      const key = "rtp-my-plans";
      const list = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(list) && !list.some((p) => p?.id === state.planId)) {
        list.push({ id: state.planId, count: items.length, at: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [state.ok, state.planId, items.length]);

  if (state.ok) {
    return (
      <div className="rounded-[2rem] border border-sky-200 bg-sky-50 p-8">
        <p className="mb-2 text-sm font-black uppercase tracking-tight text-ink">
          Plan Saved
        </p>
        <p className="text-sm font-medium text-ink-dim">{state.message}</p>
        {state.planId && (
          <Link
            href={`/plans/${state.planId}`}
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5"
          >
            Open My Plan
          </Link>
        )}
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-[2rem] border border-sky-50 bg-white p-8 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.15)]"
    >
      <p className="mb-1 text-sm font-black uppercase tracking-tight text-ink">
        Finalize Your Plan
      </p>
      <p className="mb-6 text-sm font-medium text-ink-dim">
        Save your media mix to an account. One email, no password, your plan
        gets a permanent link.
      </p>
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="fin-name"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Your Name
          </label>
          <input
            id="fin-name"
            name="name"
            placeholder="First and last"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="fin-company"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Company
          </label>
          <input
            id="fin-company"
            name="company"
            placeholder="Brand or agency"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="fin-email"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Business Email
          </label>
          <input
            id="fin-email"
            type="email"
            name="email"
            required
            placeholder="you@brand.com"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending || items.length === 0}
        className="mt-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save My Plan"}
      </button>
      {state.message && !state.ok && (
        <p className="mt-3 text-sm font-bold text-danger">{state.message}</p>
      )}
    </form>
  );
}
