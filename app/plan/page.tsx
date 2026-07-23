import { PlannerForm } from "@/components/planner-form";

export const metadata = { title: "Ad Planner" };

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange">
        Ad Planner
      </p>
      <h1 className="max-w-2xl text-balance text-3xl font-extrabold sm:text-4xl">
        Tell us who you need to reach. We'll build the play.
      </h1>
      <p className="mt-3 max-w-xl text-ink-dim">
        Every recommendation explains why it matched. Nothing here is a quoted
        rate — pricing is confirmed directly with each show.
      </p>
      <div className="mt-8">
        <PlannerForm />
      </div>
    </div>
  );
}
