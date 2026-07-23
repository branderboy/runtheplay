import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "How Ranking & Featured Placement Work" };

export default function RankingPage() {
  return (
    <LegalPage title="How Ranking & Featured Placement Work" updated="July 23, 2026">
      <p>
        We want you to trust what you see here, so here is exactly how results
        are ordered and what a paid boost does.
      </p>

      <h2>Organic results are ranked by relevance</h2>
      <p>
        In the Ad Planner and directory, shows are ranked by a{" "}
        <strong>transparent, rules-based score</strong> — audience fit, format
        fit, goal, geography, budget compatibility, inventory, freshness,
        verification, and profile completeness. Every recommendation explains why
        it matched. The scoring does not know or care who has paid.
      </p>

      <h2>Boosts buy visibility, not a better rank</h2>
      <p>
        Listing is free. A creator can pay to <strong>boost</strong> their
        listing's visibility on specific surfaces — the directory, planner
        results, or the newsletter. A boost places the listing in a{" "}
        <strong>clearly labeled "Featured" slot</strong>. It does not change the
        show's organic score and does not push more relevant shows down the
        organic list.
      </p>

      <h2>What a boost never does</h2>
      <ul>
        <li>It never appears unlabeled.</li>
        <li>It never rewrites match scores or match reasons.</li>
        <li>It never buys a false claim of editorial endorsement.</li>
        <li>
          It never affects our weekly data charts — chart positions are earned by
          the numbers and cannot be purchased.
        </li>
      </ul>

      <h2>Why we do it this way</h2>
      <p>
        The whole point of Run the Play is trustworthy data on shows the industry
        overlooks. If money could quietly reorder results, that trust would be
        worthless. Featured placement is a labeled ad — never a thumb on the
        scale.
      </p>
    </LegalPage>
  );
}
