import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorProfile } from "@/lib/creator-store";
import { getPodcastBySlug } from "@/lib/data/podcasts";
import {
  addStudioInventory,
  removeStudioInventory,
  setStudioStatus,
} from "@/lib/actions";
import { StudioDetailsForm } from "@/components/studio-details-form";
import { CoverArt } from "@/components/cover-art";

export const metadata = {
  title: "Creator Studio",
  robots: { index: false, follow: false },
};

const PLACEMENTS = [
  "Guest Appearance",
  "30–60s Host-Read Ad",
  "Pre-Roll",
  "Mid-Roll",
  "Post-Roll",
  "Video Host-Read",
  "30s Video Ad",
  "Product Placement",
  "Branded Segment",
  "Sponsored Clip",
  "Clip Series",
  "Instagram Post",
  "TikTok Post",
];

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const profile = await getCreatorProfile(id);
  if (!profile) notFound();

  const pod = getPodcastBySlug(profile.podcastSlug);
  const displayName = profile.showName ?? pod?.name ?? "Your Show";
  const art = profile.thumbnailUrl ?? pod?.artworkUrl ?? null;
  const listed = Boolean(pod);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {/* Studio hero: text + thumbnail, no hero image for now */}
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <CoverArt
            name={displayName}
            slug={profile.podcastSlug}
            artworkUrl={art}
            size={84}
            radius={20}
          />
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
              Creator Studio
            </p>
            <h1 className="display text-3xl text-ink sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-1 text-sm font-bold text-ink-dim">
              {listed ? "Listed in the directory" : "In scope review, not live yet"}
              {" · "}
              {profile.status === "published"
                ? "Inventory Published"
                : "Draft, not public"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {listed && (
            <Link
              href={`/podcast/${profile.podcastSlug}`}
              className="rounded-full border border-sky-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-ink shadow-sm transition-all hover:-translate-y-0.5"
            >
              View Public Profile
            </Link>
          )}
          <form action={setStudioStatus}>
            <input type="hidden" name="studioId" value={profile.id} />
            <input
              type="hidden"
              name="status"
              value={profile.status === "published" ? "draft" : "published"}
            />
            <button
              type="submit"
              className={`rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 ${
                profile.status === "published"
                  ? "bg-slate-400 hover:bg-slate-500"
                  : "bg-orange hover:bg-orange-600"
              }`}
            >
              {profile.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-sm font-medium text-ink-dim">
        This page is your dashboard. Everything you publish here replaces the
        public-source data on your profile: your thumbnail, your description,
        and your real ad inventory with your rates. Bookmark this link.
      </p>

      {/* Details */}
      <section className="mt-10 rounded-[2rem] border border-sky-50 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.12)]">
        <h2 className="mb-6 text-lg font-black uppercase tracking-tight text-ink">
          Show Details
        </h2>
        <StudioDetailsForm
          studioId={profile.id}
          thumbnailUrl={profile.thumbnailUrl}
          description={profile.description}
          contactEmail={profile.contactEmail}
        />
      </section>

      {/* Inventory */}
      <section className="mt-8 rounded-[2rem] border border-sky-50 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.12)]">
        <h2 className="mb-2 text-lg font-black uppercase tracking-tight text-ink">
          Your Ad Inventory
        </h2>
        <p className="mb-6 text-sm font-medium text-ink-dim">
          The placements you actually sell, at your rates. This is what turns
          "Contact for Pricing" into a bookable line item.
        </p>

        {profile.inventory.length > 0 && (
          <ul className="mb-6 flex flex-col gap-3">
            {profile.inventory.map((item, i) => (
              <li
                key={`${item.placement}-${i}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-sky-50 bg-sky-50/30 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight text-ink">
                    {item.placement}
                  </p>
                  <p className="text-sm font-bold text-ink-dim">
                    {item.rate}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </p>
                </div>
                <form action={removeStudioInventory} className="flex-none">
                  <input type="hidden" name="studioId" value={profile.id} />
                  <input type="hidden" name="index" value={i} />
                  <button
                    type="submit"
                    aria-label={`Remove ${item.placement}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:border-danger hover:text-danger"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form
          action={addStudioInventory}
          className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <input type="hidden" name="studioId" value={profile.id} />
          <div className="flex flex-col gap-2">
            <label
              htmlFor="inv-placement"
              className="text-xs font-bold uppercase tracking-widest text-ink-dim"
            >
              Placement
            </label>
            <select
              id="inv-placement"
              name="placement"
              className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sky-400"
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="inv-rate"
              className="text-xs font-bold uppercase tracking-widest text-ink-dim"
            >
              Rate
            </label>
            <input
              id="inv-rate"
              name="rate"
              placeholder="$500 flat, $25 CPM…"
              className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="inv-notes"
              className="text-xs font-bold uppercase tracking-widest text-ink-dim"
            >
              Notes
            </label>
            <input
              id="inv-notes"
              name="notes"
              placeholder="Optional"
              className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-sky-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-orange px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600"
          >
            + Add
          </button>
        </form>
      </section>

      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-ink-faint">
        Publish to Put Your Inventory and Rates on Your Public Profile
      </p>
    </div>
  );
}
