import { PlannerForm } from "@/components/planner-form";

export const metadata = { title: "Ad Planner" };

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
    </div>
  );
}
