import { PlannerForm } from "@/components/planner-form";

export const metadata = {
  title: "Ad Planner",
  description:
    "Tell us your goal, budget, and audience. Run the Play builds an explained media plan across Black-creator podcasts.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string; budget?: string; audience?: string }>;
}) {
  const { goal, budget, audience } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
        Ad Planner
      </p>
      <h1 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
        Tell us who you need to reach. We'll build the play.
      </h1>
      <p className="mt-3 max-w-xl text-ink-dim">
        Every recommendation explains why it matched. Nothing here is a quoted
        rate. Pricing is confirmed directly with each show.
      </p>
      <div className="mt-8">
        <PlannerForm
          initialGoal={goal}
          initialBudget={budget}
          initialAudience={audience}
        />
      </div>

      {/* --------------------- Built for media planners --------------------- */}
      <section className="mt-24 border-t border-sky-50 pt-16">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
          Why Media Planners Use Run the Play
        </h2>
        <p className="display max-w-2xl text-3xl text-ink sm:text-4xl">
          Built for Media Planners.
        </p>
        <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-ink-dim">
          Planning podcast campaigns shouldn't require dozens of tabs, endless
          emails, and hours of research. Discover Black podcasts, compare
          sponsorship opportunities, and connect with creators from one
          organized marketplace.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Save Time",
              body: "Stop searching websites, media kits, inboxes, and DMs. Qualified podcast opportunities in one place. Build campaigns faster.",
            },
            {
              title: "Discover Better Opportunities",
              body: "Search by audience, category, location, platform, and sponsorship options. Compare shows side by side. Find the right fit for every campaign.",
            },
            {
              title: "Plan With Confidence",
              body: "Review show information, audience details, and advertising opportunities before reaching out. Less guessing, more planning.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-[2rem] border border-sky-50 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.12)]"
            >
              <h3 className="mb-3 text-lg font-black uppercase tracking-tight text-ink">
                {c.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-ink-dim">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-sky-50 bg-sky-50/30 p-8">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-ink-dim">
            One Sponsorship or a National Campaign, One Place To
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "Find Podcasts",
              "Compare Opportunities",
              "Connect With Creators",
              "Build Smarter Media Plans",
              "Move Faster",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
