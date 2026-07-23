# Legal — status & counsel checklist

**Status:** Draft policies shipped as pages. Not legal advice; review with qualified counsel before launch.

## Pages shipped
- `/legal/privacy` — Privacy Policy (data sources, opt-in newsletter, rights, retention).
- `/legal/terms` — Terms of Service (not a broker/agency, no reach/price guarantees, acceptable use, disclaimers).
- `/legal/data-and-corrections` — sourcing, trust labels, claim, **report incorrect data**, **opt-out / takedown**, outreach-vs-newsletter separation.
- `/legal/ranking` — how organic ranking works and that paid boosts are labeled and never override relevance.

## Operational guarantees these pages make (must stay true in code)
- Newsletter is **double opt-in**; suppression list honored on every send.
- Cold "you were featured" outreach is **separate** from the newsletter and has its own opt-out.
- Estimated figures are **labeled**, never shown as verified or as a quoted rate.
- Boosts are labeled and never reorder organic results (enforced in `src/lib/planner/matcher.ts`).
- Charts cannot be bought.

## Free open-source resource to base the docs on

Legal scope is just two public documents: **Terms & Conditions** and **Privacy Policy**. Rather than rely only on the hand-written drafts, generate a compliant baseline from a free, open resource and then layer in our product-specific clauses (unclaimed profiles, outreach, boosts).

Recommended:
- **nisrulz/app-privacy-policy-generator** (https://github.com/nisrulz/app-privacy-policy-generator) — free hosted wizard, generates **both** a Privacy Policy and Terms & Conditions, with a **GDPR flavor**, exports Markdown/HTML. Note: the *generator tool* is AGPLv3, but that governs the tool's source, not the boilerplate text it outputs; still confirm before relying on it.
- **juro-privacy/free-privacy-notice** (https://github.com/juro-privacy/free-privacy-notice) — open privacy-notice **design patterns** (CC-BY, attribution) for a clearer, user-friendly layout.
- **todogroup/policies** (https://github.com/todogroup/policies) — reputable policy examples for reference.

Workflow: generate the GDPR baseline → merge our custom clauses (from the shipped pages) → counsel review. Keep the two public docs as **Terms & Conditions** and **Privacy Policy**; the Data/Corrections and Ranking pages stay as supporting transparency pages, not separate legal contracts.

## Still needs counsel before launch
- Governing law, venue, and (if used) arbitration/class-waiver clauses.
- CCPA/CPRA notices and "Do Not Sell/Share" mechanics; GDPR/UK-GDPR lawful basis + DSAR process for the podcaster PII we hold.
- Cookie/analytics consent banner if analytics require it in target regions.
- Data Processing Agreements with vendors (email, hosting, analytics).
- Confirm each platform API's display/redistribution terms before showing or storing their data (YouTube, Spotify, Apple, Instagram, TikTok).
- Publicity/defamation review of the unclaimed-profile model and the takedown SLA.
- Real contact addresses/inboxes for privacy@, corrections@, optout@, hello@.
