"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { runPlan } from "@/lib/actions";
import type { CampaignGoal } from "@/src/lib/planner/types";
import { useBasket } from "./basket";

/** One tap runs the play: matches shows with the play's goal, budget, and
 *  audience, drops them straight into the campaign, and opens it. No
 *  planner detour. */
export function RunPlayButton({
  goal,
  budget,
  audienceTags,
  showCount,
}: {
  goal: string;
  budget: number;
  audienceTags: string[];
  showCount: number;
}) {
  const { add } = useBasket();
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const out = await runPlan({
            goal: goal as CampaignGoal,
            budgetMax: budget,
            currency: "USD",
            audienceTags,
            geography: { level: "national" },
            creativeFormats: [],
            mediaType: "both",
          });
          const picks = [...out.featured, ...out.organic].slice(0, showCount);
          for (const r of picks) {
            add({
              slug: r.podcastId,
              name: r.name,
              category: null,
              artworkUrl: out.profiles[r.podcastId]?.artworkUrl ?? null,
            });
          }
          router.push("/basket");
        })
      }
      className="rounded-full bg-orange px-8 py-4 text-center text-sm font-black uppercase tracking-[0.15em] text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-60"
    >
      {pending ? "Building Your Campaign…" : "+ Add This Play to Your Campaign"}
    </button>
  );
}
