"use client";

import { useActionState } from "react";
import { updateStudioDetails, type ActionState } from "@/lib/actions";

const init: ActionState = { ok: false, message: "" };

export function StudioDetailsForm({
  studioId,
  thumbnailUrl,
  description,
  contactEmail,
}: {
  studioId: string;
  thumbnailUrl: string | null;
  description: string | null;
  contactEmail: string | null;
}) {
  const [state, action, pending] = useActionState(updateStudioDetails, init);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="studioId" value={studioId} />
      <div className="flex flex-col gap-2">
        <label
          htmlFor="st-thumb"
          className="text-xs font-bold uppercase tracking-widest text-ink-dim"
        >
          Thumbnail Image URL
        </label>
        <input
          id="st-thumb"
          name="thumbnailUrl"
          defaultValue={thumbnailUrl ?? ""}
          placeholder="https://... (square art works best)"
          className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="st-desc"
          className="text-xs font-bold uppercase tracking-widest text-ink-dim"
        >
          Show Details
        </label>
        <textarea
          id="st-desc"
          name="description"
          rows={4}
          defaultValue={description ?? ""}
          placeholder="What the show is, who listens, why brands book you."
          className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="st-email"
          className="text-xs font-bold uppercase tracking-widest text-ink-dim"
        >
          Booking Email
        </label>
        <input
          id="st-email"
          type="email"
          name="contactEmail"
          defaultValue={contactEmail ?? ""}
          placeholder="booking@show.com"
          className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Details"}
        </button>
        {state.message && (
          <p
            className={`text-sm font-bold ${state.ok ? "text-sky-600" : "text-danger"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
