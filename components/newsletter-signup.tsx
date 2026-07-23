"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

export function NewsletterSignup({
  edition = "buyer",
}: {
  edition?: "buyer" | "creator";
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, init);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="edition" value={edition} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          className="flex-1 rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-navy disabled:opacity-60"
        >
          {pending ? "…" : "Keep me in the loop"}
        </button>
      </div>
      <p className="text-xs text-ink-faint">
        Weekly. Double opt-in — we'll confirm before sending. Unsubscribe anytime.
      </p>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-green" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
