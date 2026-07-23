# Monetization & Ranking

**Status:** Spec · implemented in schema (`listing_boosts`, `subscriptions`) and matcher (`src/lib/planner`)

## Model — free to list, pay to boost (Yelp-style)

Every qualifying Black creator gets a **free** listing built from public data. Revenue comes from **boosting positioning**, not from listing. A show pays to be **featured** on one or more surfaces:

| Surface | What a boost does |
|---|---|
| **Directory** | Featured slot at the top of relevant browse/category pages |
| **Planner results** | Featured slot above the organic recommendations |
| **Newsletter** | Featured placement in the weekly buyer edition |
| **All** | All three |

This is close to Yelp's model: the underlying listing and its data are free and organic; paid placement buys **visibility**, not a better organic rank.

## The one hard rule

> **Paid placement is always labeled, and never silently overrides relevance.**

This is not optional polish — it's in the Design Brief, the Content/SEO strategy, and the product principles. Concretely:

1. **Boosts are a separate, labeled layer.** A featured result is rendered in its own "Featured" / "Sponsored" slot with a visible label. It is *not* mixed into organic results unlabeled.
2. **Boosts never change organic scores.** The matcher computes organic relevance with zero knowledge of who paid. Featured shows are selected *after* scoring and lifted into the labeled slot; the organic list is sorted purely by relevance and the featured rows are removed from it (shown above instead), so nothing is double-counted or reordered by money.
3. **Match reasons stay honest.** A featured card shows the same real match reasons as any other — it never fabricates fit.
4. **Caps.** A small number of featured slots (default 3) so results don't become an ad wall.

## How the matcher enforces it (`src/lib/planner/matcher.ts`)

```
score every eligible show on relevance  →  organic ranking (blind to boosts)
        │
        ├─ pick boosted shows that pass the same hard filters
        │     → rank them by THEIR OWN relevance score
        │     → return as `featured[]` (UI labels them)
        │
        └─ return the rest as `organic[]`, relevance-sorted, diversified
```

`matchPlan()` returns `{ featured, organic }` as two separate arrays. The UI renders `featured` in a labeled band and `organic` below. Because featured selection reads `activeBoostScopes` only *after* scoring, a boost can win a slot but can never lift a show's organic score or bump a more relevant show down the organic list.

## Data model

- **`listing_boosts`** — `podcast_id`, `scope` (directory / planner_results / newsletter / all), `status`, `priority`, `starts_at`, `ends_at`, optional `subscription_id`. An active boost = status `active` and now within `[starts_at, ends_at]`.
- **`subscriptions`** — Stripe-backed recurring boost products (`boost_directory`, `boost_planner_results`, `boost_newsletter`, `boost_all`).

At query time each surface asks: *which podcasts have an active boost whose scope covers me?* — and lifts those into the labeled slot.

## Relationship to the earlier subscription idea

The original blueprint floated a $10/$20 claim/inventory subscription. This boost model supersedes it as the **primary** revenue line: claiming and publishing inventory stay **free** (they improve the directory and planner, which is the flywheel), and money is charged for **positioning**. A claim/inventory subscription can still be added later, but boosts are the Yelp-style core.

## Guardrails to carry into the UI

- Featured/Sponsored label on every boosted card, in directory, planner, and newsletter.
- Boosts never appear in a context where they'd read as an editorial ranking (e.g. the weekly data charts stay organic and unpaid — a paid chart position would break the trust the charts exist to build).
- Disclose the model on a public "How ranking and featured placement work" page.
