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

## Still needs counsel before launch
- Governing law, venue, and (if used) arbitration/class-waiver clauses.
- CCPA/CPRA notices and "Do Not Sell/Share" mechanics; GDPR/UK-GDPR lawful basis + DSAR process for the podcaster PII we hold.
- Cookie/analytics consent banner if analytics require it in target regions.
- Data Processing Agreements with vendors (email, hosting, analytics).
- Confirm each platform API's display/redistribution terms before showing or storing their data (YouTube, Spotify, Apple, Instagram, TikTok).
- Publicity/defamation review of the unclaimed-profile model and the takedown SLA.
- Real contact addresses/inboxes for privacy@, corrections@, optout@, hello@.
