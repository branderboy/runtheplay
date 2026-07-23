/**
 * Runs the matcher against a small in-memory sample so the planner can be
 * verified without a database. `npx tsx scripts/planner-demo.ts`
 */
import { matchPlan } from "../src/lib/planner/matcher";
import type { PlanInput, PodcastInput } from "../src/lib/planner/types";

const REF = new Date("2026-07-23T00:00:00Z");

const podcasts: PodcastInput[] = [
  {
    id: "p1",
    name: "Earn Your Leisure",
    slug: "earn-your-leisure",
    status: "active",
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
    categories: ["Business"],
    audienceTags: ["entrepreneurs", "black entrepreneurs", "investing"],
    geography: { countryCode: "US" },
    mostRecentEpisodeDate: "2026-07-05",
    advertisingAvailable: true,
    dataFillRatio: 0.62,
    inventory: [],
    activeBoostScopes: [],
  },
  {
    id: "p2",
    name: "Market Mondays",
    slug: "market-mondays",
    status: "active",
    ownershipStatus: "claimed",
    verificationStatus: "verified",
    categories: ["Business"],
    audienceTags: ["investing", "entrepreneurs", "stocks"],
    geography: { countryCode: "US" },
    mostRecentEpisodeDate: "2026-07-14",
    advertisingAvailable: true,
    dataFillRatio: 0.7,
    inventory: [
      {
        id: "inv-mm-1",
        creativeFormat: "host_read",
        mediaType: "both",
        pricingModel: "starting_at",
        priceStarting: 1500,
        priceMax: null,
        availabilityStatus: "active",
      },
    ],
    // Paid boost: appears in a labeled Featured slot in planner results.
    activeBoostScopes: ["planner_results"],
  },
  {
    id: "p3",
    name: "We In Miami Podcast",
    slug: "we-in-miami-podcast",
    status: "active",
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
    categories: ["Society & Culture"],
    audienceTags: ["miami", "hip-hop", "local culture"],
    geography: { countryCode: "US", state: "FL", city: "Miami" },
    mostRecentEpisodeDate: "2026-06-30",
    advertisingAvailable: true,
    dataFillRatio: 0.66,
    inventory: [],
    activeBoostScopes: [],
  },
  {
    id: "p4",
    name: "The Read",
    slug: "the-read",
    status: "active",
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
    categories: ["Comedy"],
    audienceTags: ["pop culture", "lgbtq", "hip-hop"],
    geography: { countryCode: "US" },
    mostRecentEpisodeDate: "2026-07-10",
    advertisingAvailable: true,
    dataFillRatio: 0.62,
    inventory: [],
    activeBoostScopes: [],
  },
  {
    id: "p5",
    name: "Dormant Show (inactive)",
    slug: "dormant-show",
    status: "inactive",
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
    categories: ["Business"],
    audienceTags: ["entrepreneurs"],
    geography: { countryCode: "US" },
    mostRecentEpisodeDate: "2024-01-01",
    advertisingAvailable: false,
    dataFillRatio: 0.3,
    inventory: [],
    activeBoostScopes: [],
  },
];

const plan: PlanInput = {
  goal: "product_launch",
  budgetMax: 3000,
  currency: "USD",
  audienceTags: ["black entrepreneurs", "investing", "entrepreneurs"],
  geography: { level: "national" },
  creativeFormats: ["host_read"],
  mediaType: "both",
};

const out = matchPlan(plan, podcasts, { referenceDate: REF });

console.log(`\nAlgorithm ${out.algorithmVersion} · excluded ${out.excludedCount} (hard filters)\n`);
console.log("FEATURED (paid boost — labeled Sponsored, shown above organic):");
for (const r of out.featured) {
  console.log(`  ★ ${r.name}  score ${r.score}  [${r.priceBucket}]  — ${r.reasons.join(" · ")}`);
}
console.log("\nORGANIC (ranked purely by relevance):");
for (const r of out.organic) {
  console.log(`  ${r.rank}. ${r.name}  score ${r.score}  [${r.priceBucket}]  — ${r.reasons.join(" · ")}`);
}
console.log("");
