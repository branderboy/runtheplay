"use client";

import { useActionState } from "react";
import { submitListingRequest, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

/** Sign-up form for creators whose show is not in the directory yet. */
export function GetListedForm() {
  const [state, action, pending] = useActionState(submitListingRequest, init);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-sm font-bold text-ink">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="listing-show"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Show Name
          </label>
          <input
            id="listing-show"
            name="showName"
            required
            placeholder="Your Podcast"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="listing-name"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Your Name
          </label>
          <input
            id="listing-name"
            name="contactName"
            placeholder="Host or manager"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="listing-email"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Business Email
          </label>
          <input
            id="listing-email"
            type="email"
            name="email"
            required
            placeholder="booking@show.com"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="listing-url"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Show Link
          </label>
          <input
            id="listing-url"
            name="showUrl"
            placeholder="https://youtube.com/@yourshow"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-orange px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Get Listed Free"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm font-bold text-danger">{state.message}</p>
      )}
      <p className="text-xs font-medium text-ink-faint">
        Listing is free and stays free. We review every show against our scope:
        Black creators, culture first, no politics. Mixed-host shows qualify
        with at least one Black host.
      </p>
    </form>
  );
}
