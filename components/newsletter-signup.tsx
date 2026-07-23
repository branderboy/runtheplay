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
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="ENTER WORK EMAIL"
          aria-label="Email address"
          className="flex-1 rounded-full border border-transparent bg-navy-2 px-7 py-4 text-sm font-bold uppercase tracking-widest text-ink shadow-inner outline-none transition-all placeholder:text-ink-faint focus:border-sky-200 focus:bg-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sky-500 px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)] disabled:opacity-60"
        >
          {pending ? "…" : "Keep Me in the Loop"}
        </button>
      </div>
      <p className="text-xs font-medium text-ink-faint">
        Weekly. Confirmed opt-in. Unsubscribe anytime.
      </p>
      {state.message && (
        <p className={`text-sm font-bold ${state.ok ? "text-sky-600" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
