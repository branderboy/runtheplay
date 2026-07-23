# Run the Play — The Two Loops

The product is two loops that must close into each other. The advertiser loop
ends in money sent. The podcaster loop ends in money received and proof
published. The proof feeds the next advertiser. Anything on the site that does
not move a user one row down these tables is a silo.

## Podcaster Loop (Yelp model)

| # | State | The Podcaster Sees | Action | System Does | Next State | Built? |
|---|-------|--------------------|--------|-------------|------------|--------|
| P1 | Not in database | Claim search: "Not in the database yet" | Submits Get Listed form | Stores listing_request, flags for scope review | P2 | LIVE |
| P2 | Listing requested | Confirmation message | Waits | Owner reviews scope (Black creators, no politics), adds to seed | P3 | OPEN: review is manual, no owner notification email |
| P3 | Listed, unclaimed, no email on file | Search result: "Unclaimed · No Email on File · Manual Review" | Claims from profile | Stores claim as pending manual review | P5 | LIVE |
| P4 | Listed, unclaimed, email on file | Search result: "Unclaimed · Email on File · Instant Verify" | Claims with matching business email | Auto-verifies claim | P6 | LIVE, minus confirmation email |
| P5 | Claim pending | Search result: "Claim Pending" | Waits | Human verifies identity | P6 | OPEN: no admin review surface, no notification |
| P6 | Claimed / verified | Profile marked claimed | Publishes real inventory, placements, rates | Replaces "Contact for pricing" with real rates | P7 | OPEN: no creator dashboard to publish inventory |
| P7 | Sellable | Real rates on profile and in planner results | Receives inquiries | Routes inquiries to their email | P8 | OPEN: email delivery (Resend) not wired |
| P8 | Earning | Booked ads, incremental income | Optionally boosts listing | Labeled featured placement, never touches organic rank or charts | P9 | Schema LIVE, no checkout |
| P9 | Proof | Show appears in charts and receipts | Nothing, it compounds | Charts and case studies market the show to the next brand | feeds A1 | LIVE (charts) |

## Advertiser Loop

| # | State | The Advertiser Sees | Action | System Does | Next State | Built? |
|---|-------|---------------------|--------|-------------|------------|--------|
| A1 | Aware | Homepage: thesis, arbitrage, receipts | Clicks Start Building | Opens planner at step 1 | A2 | LIVE |
| A2 | Planning | 4-step wizard: goal, budget, audience, details | Completes steps | Deterministic matcher returns explained slate | A3 | LIVE |
| A3 | Evaluating | Results with match reasons, featured labeled | Adds shows to media mix | Basket persists across pages | A4 | LIVE |
| A4 | Committed | Finalize Plan on the media mix page | Creates account (name, company, email), saves plan | Advertiser account + saved plan with permanent /plans/[id] link | A5 | LIVE |
| A4a | Managing | /plans (My Plans) and the plan workspace | Tracks plans, removes shows, adds one-tap suggestions grown from the plan's own categories | Edits persist to the saved plan | A4b | LIVE; OPEN: cross-device access needs magic-link login (Resend) |
| A4b | Contacting | Per-show contact on profile and saved plan | Sends inquiry per show | Stores inquiry, routes to email on file | A5 | OPEN: email delivery (Resend) not wired |
| A5 | Negotiating | "Sent to the show's contact" | Deals directly with the show | Nothing, we do not broker | A6 | BY DESIGN |
| A6 | Live campaign | Their ad running on culture shows | Comes back weekly | Charts and newsletter keep them in the loop | A7 | LIVE (newsletter opt-in), OPEN: sends |
| A7 | Repeat buyer | New plays, new charts | Builds next plan | Loop restarts with receipts added | A2 | LIVE |

## Where the loops connect

P7 is the hinge. A claimed show with published rates turns an advertiser's A3
"Contact for pricing" into a bookable line item. Until P6/P7 exist, the
advertiser loop leaks at A4 and the podcaster loop never reaches P8.

## Open loops, in closing order

1. Claim search must show real states (in database or not, claimed or not,
   instant verify or review) so P1 to P4 is one continuous motion. (This
   commit.)
2. Email delivery via Resend: inquiry routing (A4b/P7), claim confirmations
   (P4), listing-request notifications to the owner (P2), newsletter double
   opt-in (A6), and magic-link login for advertiser accounts (A4). One
   integration closes five gaps. Needs RESEND_API_KEY.
3. Creator dashboard after claim: publish inventory, placements, rates (P6
   to P7).
4. Admin review surface for pending claims and listing requests (P2, P5).
5. Boost checkout (P8). Last, because it monetizes a loop that must close
   first.
