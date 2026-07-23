# Run the Play — working rules

## Design rules (non-negotiable)
- **The UI conveys trust, space, and reliability.** North star: Uber's use of
  space, Apple's calm precision. Generous whitespace, calm surfaces, real
  numbers with sources. Nothing loud, nothing fake, nothing cramped.
- **WHITE BACKGROUND ONLY.** No dark sections, no navy bands, no "dark mode"
  panels anywhere in the page body. The ONLY dark surface on the site is the
  navbar (because the logo sits on navy). Everything else: white ground,
  sky-50 tints for section rhythm.
- Never use a cheap dark-background layout as a shortcut for real UI design. Design the section properly on white.
- No cheesy AI-generic design: no dark glassy panels, no purple/green/off-palette
  hues, no gradient walls. Palette is: white ground, slate ink, sky/blue primary,
  orange strictly for Add-to-Plan / creator CTAs / one gradient display word.
- The design language is the owner's template: Inter font-black uppercase
  tracking-tighter display type, pill buttons, rounded-[2rem]+ cards,
  border-sky-50/100 hairlines, soft sky shadows.
- The owner's template is a LAYOUT REFERENCE — adapt it to the real product and
  real data, don't copy its sample content.

## Content rules (non-negotiable)
- The site carries three currents at once: emotion (the culture's story),
  opportunity (the arbitrage and the plan), and social proof (real receipts).
  Advertisers must see the community's value; creators must be shown as able
  to deliver.
- Copy style: short, punchy sentences. No emoji icons in the UI. No em-dashes.
- Headlines, subheads, and card labels use Title Case. Never lowercase-first
  display copy; it reads low value.
- Voice: a community for the underdogs. Never cheap SaaS talk. The culture's
  own words, from mission.md. Underdog pride, receipts, and a plan.
- **Real data only. Nothing fake, ever.** No invented metrics, prices, views,
  or case studies. Every stat and case study carries a named source (enforced
  by unit tests). Unverifiable = excluded, not approximated.
- Prices show "Contact for pricing" until a creator publishes real rates via
  the claim flow.
- The site's argument comes from data/thesis.json + data/case_studies.json +
  mission.md (the aggregation story). Copy pulls from those sheets, not from
  generic SaaS marketing language.
- Mission framing: independent creators are the heroes; the problem is
  concentrated ad access ("Big business buys culture in bulk. Small players
  negotiate one by one."); Run the Play is the guide that aggregates.

## Engineering rules
- Every change must pass: `npm run typecheck`, `npm test` (vitest),
  `npm run build`, and `npm run test:e2e` before pushing. CI enforces this.
- Push to the working branch AND `main` (owner's workflow).
- Cover art is served from /public/covers (auto-downloaded by the artwork
  workflow). Never hotlink as the primary source.
- The seed CSV in data/seed is the source of truth until the DB is flipped on;
  scope: at least one Black host, no politics, no faith (both enforced on the
  whole roster, not just new adds). Also OUT of scope for roster expansion:
  food, film/TV recap, and regional shows (owner's call, 2026-07-23). Mainly
  hip-hop and urban culture; national or global reach.
