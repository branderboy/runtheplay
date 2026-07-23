"use client";

import { useActionState } from "react";
import { submitSupportTicket, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

export function SupportForm() {
  const [state, action, pending] = useActionState(submitSupportTicket, init);

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
            htmlFor="sup-email"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Your Email
          </label>
          <input
            id="sup-email"
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sup-topic"
            className="text-xs font-bold uppercase tracking-widest text-ink-dim"
          >
            Topic
          </label>
          <select
            id="sup-topic"
            name="topic"
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sky-400"
          >
            <option value="advertiser">Advertiser Question</option>
            <option value="creator">Creator or Claim Question</option>
            <option value="data">Data Correction</option>
            <option value="other">Something Else</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="sup-msg"
          className="text-xs font-bold uppercase tracking-widest text-ink-dim"
        >
          What Do You Need
        </label>
        <textarea
          id="sup-msg"
          name="message"
          rows={5}
          required
          placeholder="Tell us what's going on."
          className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm font-bold text-danger">{state.message}</p>
      )}
    </form>
  );
}
