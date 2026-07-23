"use client";

import { useActionState } from "react";
import { submitClaim, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

export function ClaimForm({ slug, name }: { slug: string; name: string }) {
  const [state, action, pending] = useActionState(submitClaim, init);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm font-bold text-ink">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <label className="text-sm text-ink-dim" htmlFor={`role-${slug}`}>
        Your role
      </label>
      <select
        id={`role-${slug}`}
        name="role"
        className="rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink focus:border-orange"
      >
        <option value="owner">Owner</option>
        <option value="host">Host</option>
        <option value="producer">Producer</option>
        <option value="manager">Manager / rep</option>
      </select>
      <label className="text-sm text-ink-dim" htmlFor={`email-${slug}`}>
        {name}'s business email
      </label>
      <input
        id={`email-${slug}`}
        type="email"
        name="email"
        required
        placeholder="booking@show.com"
        className="rounded-lg border border-line bg-navy-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-orange"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-orange px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Claim this profile"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-danger">{state.message}</p>
      )}
      <p className="text-xs text-ink-faint">
        If your email matches the public business contact we have on file, you're
        verified instantly. Otherwise a person reviews your claim.
      </p>
    </form>
  );
}
