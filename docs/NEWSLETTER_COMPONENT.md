# Newsletter Component — "Keep in the Loop"

**Status:** MVP spec · some decisions still open (see §9)
**Mission fit:** Run the Play exists to put **Black and urban creators** in front of advertisers. The newsletter is the recurring engine that (a) keeps those creators looped into their own growth and new ad demand, and (b) keeps buyers returning with fresh, culture-first opportunities. It is the retention layer of the flywheel, not a bolt-on.

---

## 1. Purpose

The newsletter turns one-time visitors into a recurring audience and turns the weekly charts + directory data into a reason to come back. It is generated from the **same stored snapshot records** that power the website and social cards — one source of truth, no hand-typed numbers.

Two jobs:
- **Demand side** — keep buyers aware of new creators, new inventory, and budget-based ideas so they run more campaigns.
- **Supply side (the mission)** — keep Black/urban creators aware that they were featured, charted, viewed, or matched to a buyer — the exact hooks that pull them into claiming and improving their profile.

---

## 2. Two editions

The list is one system with **two editions** a subscriber can belong to (a person can subscribe to either or both).

### A. Buyer edition — "The Play of the Week"
For brands, agencies, artists, event promoters, local businesses.
- This week's Top-10 charts (from the chart system)
- Newly added creators and newly claimed profiles
- New or updated advertising inventory
- Budget-based campaign ideas ("what $1,500 buys this month")
- One buyer-education slot (a guide or "how to read a media kit")
- CTA: **Build a plan** / **Explore the directory**

### B. Creator edition — "Your Numbers" (the mission edition)
For Black/urban podcasters and creators, claimed or not.
- "You were featured" / "You charted this week" / "Your profile got N views"
- "A buyer saved your show to a plan" / "You appeared in N ad plans"
- New advertiser demand matching your audience
- Growth recap (subs, views, engagement) from stored snapshots
- "Refresh your inventory" / "Claim your profile" nudges
- CTA: **Claim / update your profile**

> The creator edition is the newsletter form of the flywheel's "we already put your show in front of the market — claim your profile and control what they see next."

---

## 3. Content sourcing (single source of truth)

Every number in an issue references a stored `metric_snapshot` (or chart entry), exactly like the social cards (Data Sourcing spec §17). Rules:
- No metric appears without a source + capture date.
- Public vs Verified vs Estimated labeling carries into the email.
- If a creator-edition issue names a buyer action ("saved to a plan"), it is aggregate and anonymized — never "Brand X saved you."

An issue is assembled by a template that pulls: the week's chart entries, the subscriber's followed/claimed shows (creator edition), and editorial slots from the CMS.

---

## 4. Consent & compliance (do this right or the domain dies)

This is the part most newsletters get wrong. Two flows, kept **completely separate**:

1. **The newsletter = opt-in only.** Recommended **double opt-in** (confirmed subscribe). Never seed it from scraped or publicly-listed business emails. A creator publishing a booking email consented to *inquiries*, not to a marketing list.
2. **Cold "you were featured, claim your profile" outreach = separate transactional flow** (one-off, hard opt-out, suppression list, physical address). It is NOT the newsletter and must not share the newsletter's sending reputation.

Every newsletter send includes:
- One-click unsubscribe (list-unsubscribe header + footer link)
- Physical mailing address (CAN-SPAM)
- Honest `From`/subject, no deceptive headers
- Per-edition unsubscribe (leave Buyer without leaving Creator)

A global **suppression list** is honored across every send. Unsubscribes are permanent unless the person re-subscribes. EU/UK subscribers: store consent timestamp + source (GDPR/ePrivacy lawful basis).

---

## 5. Cadence & automation

- **Weekly**, aligned to the chart publish job (charts → cards → newsletter all read the same weekly snapshot).
- **Stack:** Resend for delivery (already in the blueprint), a background job (Trigger.dev/Inngest) to assemble + schedule the send, React Email for templates so the issue renders from the same data the site uses.
- **Order:** snapshot job runs → charts compute → newsletter assembles per edition → double-opt-in-confirmed + non-suppressed recipients only → send → log opens/clicks/unsubs back to the subscriber record.

---

## 6. Data model (Drizzle / Postgres additions)

New tables (fit alongside the blueprint schema):

### `newsletter_subscribers`
| Field | Type | Notes |
|---|---|---|
| id | uuid | pk |
| email | citext | unique |
| user_id | uuid | nullable — link if they have an account |
| status | enum | pending, confirmed, unsubscribed, bounced, complained |
| confirmed_at | timestamptz | double opt-in confirmation time |
| consent_source | text | where/how they subscribed |
| consent_ip | inet | nullable, for audit |
| locale / country_code | text/char(2) | nullable, for GDPR handling |
| created_at / updated_at | timestamptz | |

### `newsletter_edition_subscriptions`
| Field | Type | Notes |
|---|---|---|
| subscriber_id | uuid | fk |
| edition | enum | buyer, creator |
| subscribed_at | timestamptz | |
| unsubscribed_at | timestamptz | nullable — per-edition opt-out |

Unique `(subscriber_id, edition)`.

### `newsletter_issues`
| Field | Type | Notes |
|---|---|---|
| id | uuid | pk |
| edition | enum | buyer, creator |
| subject | text | |
| period_start / period_end | date | the week covered |
| snapshot_manifest | jsonb | which metric_snapshot / chart ids appeared (audit, mirrors social_posts) |
| status | enum | draft, scheduled, sent |
| scheduled_at / sent_at | timestamptz | |

### `newsletter_sends` (per-recipient log)
| Field | Type | Notes |
|---|---|---|
| id | uuid | pk |
| issue_id | uuid | fk |
| subscriber_id | uuid | fk |
| status | enum | queued, sent, delivered, opened, clicked, bounced, complained |
| provider_message_id | text | Resend id |
| updated_at | timestamptz | |

### `email_suppressions`
| Field | Type | Notes |
|---|---|---|
| email | citext | unique |
| reason | enum | unsubscribe, bounce, complaint, manual |
| created_at | timestamptz | |

Suppression is checked before every send, across newsletter AND cold-outreach flows.

---

## 7. Signup component

A small, reusable capture block (placed on homepage, every profile, chart pages, guides, and basket export):

- Email field + edition toggle (default Buyer on buyer pages, Creator on the claim/creator pages)
- Plain-language consent line: *"Weekly. Unsubscribe anytime."*
- On submit → create `pending` subscriber → send double-opt-in confirmation via Resend → confirmation link flips status to `confirmed`
- Success/empty/error states written in the brand's plain voice ("You're on the list — check your email to confirm.")

Slots into the Next.js app once the shell exists; until then it's specced here. (I did **not** scaffold a React component in the repo because there's no app to host it yet — flag me when the app shell lands and I'll build it against these tables.)

---

## 8. Metrics

- Subscribers by edition, confirmed vs pending
- Confirmation (double opt-in) completion rate
- Weekly open / click rate per edition
- Creator-edition → profile-claim conversion (the mission metric)
- Buyer-edition → planner-start / plan-completion conversion
- Unsubscribe + complaint rate (keep complaints < 0.1%)
- List growth by source (which pages/CTAs convert)

---

## 9. Open decisions (the "maybe incomplete" list — your call)

1. **Double opt-in vs single opt-in?** Recommend double (protects deliverability). Slower list growth.
2. **Creator edition delivery:** does a creator get the "you were featured" email as (a) an opt-in newsletter they joined, or (b) a transactional one-off tied to the featuring event? Recommend: the *recap newsletter* is opt-in; the *one-time "you were featured, claim it"* is transactional outreach (§4 flow 2). Confirm you want them split.
3. **Gating:** is the newsletter free for everyone, or is any part tied to the paid creator subscription? Recommend fully free — it's the top of the funnel.
4. **ESP:** confirm **Resend** (in the blueprint) vs another provider.
5. **Cadence:** weekly for both editions, or creator edition monthly to start (less to say per creator early on)?
6. **Personalization depth for creator edition:** per-show personalized numbers require a subscriber↔podcast link — ship generic first, personalize once claims exist?

Answer these six and this spec is complete enough to build the moment the app shell exists.
