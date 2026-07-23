"use client";

import { useActionState } from "react";
import { submitInquiry, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

export function RequestForm({ slug, name }: { slug: string; name: string }) {
  const [state, action, pending] = useActionState(submitInquiry, init);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-green/30 bg-green/10 p-5 text-sm text-ink">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        aria-label="Your email"
        className="rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange"
      />
      <textarea
        name="message"
        required
        rows={4}
        placeholder={`What would you like to run with ${name}? Budget, dates, product…`}
        aria-label="Your message"
        className="rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-danger">{state.message}</p>
      )}
      <p className="text-xs text-ink-faint">
        Run the Play doesn't broker deals — your inquiry goes to the show's own
        contact. Pricing and availability are set by the podcast.
      </p>
    </form>
  );
}
