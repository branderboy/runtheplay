"use client";

import { useActionState } from "react";
import { adminLogin, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogin, init);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <label
        htmlFor="admin-key"
        className="text-xs font-bold uppercase tracking-widest text-ink-dim"
      >
        Admin Key
      </label>
      <input
        id="admin-key"
        type="password"
        name="key"
        required
        className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sky-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm font-bold text-danger">{state.message}</p>
      )}
    </form>
  );
}
