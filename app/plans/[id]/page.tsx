import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan } from "@/lib/plan-store";
import { getPodcastBySlug, type Podcast } from "@/lib/data/podcasts";
import { similarShows } from "@/lib/categories";
import { removePlanItem, addPlanItem } from "@/lib/actions";
import { CoverArt } from "@/components/cover-art";

export const metadata = { title: "Saved Plan" };

/** Suggestions grow from what's already in the plan: same categories, real shows. */
function suggestFor(items: { slug: string }[], limit = 4): Podcast[] {
  const inPlan = new Set(items.map((i) => i.slug));
  const tally = new Map<string, { p: Podcast; score: number }>();
  for (const i of items) {
    const pod = getPodcastBySlug(i.slug);
    if (!pod) continue;
    for (const s of similarShows(pod, 12)) {
      if (inPlan.has(s.slug)) continue;
      const cur = tally.get(s.slug);
      tally.set(s.slug, { p: s, score: (cur?.score ?? 0) + 1 });
    }
  }
  return [...tally.values()]
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(Boolean(b.p.artworkUrl)) - Number(Boolean(a.p.artworkUrl)) ||
        a.p.name.localeCompare(b.p.name),
    )
    .slice(0, limit)
    .map((x) => x.p);
}

export default async function SavedPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const plan = await getPlan(id);
  if (!plan) notFound();

  const suggestions = suggestFor(plan.items);
  const created = new Date(plan.createdAt);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-baseline justify-between gap-4">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
          Saved Plan{plan.company ? ` · ${plan.company}` : ""}
        </p>
        <Link
          href="/plans"
          className="text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:text-sky-500"
        >
          My Plans →
        </Link>
      </div>
      <h1 className="display text-4xl text-ink sm:text-5xl">Your Media Mix.</h1>
      <p className="mt-4 max-w-xl text-lg font-medium text-ink-dim">
        {plan.items.length} {plan.items.length === 1 ? "show" : "shows"} saved
        {Number.isFinite(created.getTime()) && created.getTime() > 0
          ? ` on ${created.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
          : ""}
        . Edit it here anytime. Contact each show from its profile. Pricing is
        confirmed with the creator.
      </p>

      {plan.items.length === 0 && (
        <p className="mt-10 rounded-[2rem] border border-sky-50 bg-white p-6 text-sm font-bold text-ink-dim shadow-sm">
          This plan is empty. Add shows from the suggestions below or run the{" "}
          <Link href="/plan" className="text-sky-500 hover:text-sky-600">
            Ad Planner
          </Link>
          .
        </p>
      )}

      <ul className="mt-10 flex flex-col gap-3">
        {plan.items.map((i) => {
          const p = getPodcastBySlug(i.slug);
          return (
            <li
              key={i.slug}
              className="flex items-center justify-between gap-4 rounded-[2rem] border border-sky-50 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <CoverArt
                  name={i.name}
                  slug={i.slug}
                  artworkUrl={p?.artworkUrl}
                  size={44}
                  radius={12}
                />
                <div className="min-w-0">
                  <Link
                    href={`/podcast/${i.slug}`}
                    className="block truncate text-lg font-black uppercase tracking-tight text-ink hover:text-sky-600"
                  >
                    {i.name}
                  </Link>
                  <p className="text-sm font-bold text-ink-faint">
                    {i.category ?? p?.primaryCategory ?? "Podcast"} · Contact
                    for Pricing
                  </p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-3">
                <Link
                  href={`/podcast/${i.slug}#contact`}
                  className="rounded-full bg-sky-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-sky-600 transition-colors hover:bg-sky-500 hover:text-white"
                >
                  Contact
                </Link>
                <form action={removePlanItem}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <input type="hidden" name="slug" value={i.slug} />
                  <button
                    type="submit"
                    aria-label={`Remove ${i.name}`}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-ink-faint transition-colors hover:border-danger hover:text-danger"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>

      {suggestions.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
            Suggested Additions
          </h2>
          <p className="mb-6 max-w-xl text-sm font-medium text-ink-dim">
            Same categories as the shows already in your plan. Real shows from
            the directory, one tap to add.
          </p>
          <ul className="flex flex-col gap-3">
            {suggestions.map((s) => (
              <li
                key={s.slug}
                className="flex items-center justify-between gap-4 rounded-[2rem] border border-sky-50 bg-white p-5 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <CoverArt
                    name={s.name}
                    slug={s.slug}
                    artworkUrl={s.artworkUrl}
                    size={44}
                    radius={12}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/podcast/${s.slug}`}
                      className="block truncate text-lg font-black uppercase tracking-tight text-ink hover:text-sky-600"
                    >
                      {s.name}
                    </Link>
                    <p className="truncate text-sm font-bold text-ink-faint">
                      {s.primaryCategory ?? "Podcast"}
                      {s.hosts.length ? ` · ${s.hosts.slice(0, 2).join(", ")}` : ""}
                    </p>
                  </div>
                </div>
                <form action={addPlanItem} className="flex-none">
                  <input type="hidden" name="planId" value={plan.id} />
                  <input type="hidden" name="slug" value={s.slug} />
                  <button
                    type="submit"
                    className="rounded-full bg-orange px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    + Add
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/plan"
          className="rounded-full border border-sky-100 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-ink shadow-sm transition-all hover:-translate-y-0.5"
        >
          Get Fresh Suggestions in the Planner
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
          This Link Is Your Plan's Permanent Home
        </p>
      </div>
    </div>
  );
}
