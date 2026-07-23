# Podcast Advertising Inventory — Taxonomy & Data Model

**Status:** Spec · supersedes the single `inventory_type_id` field in the blueprint DATABASE_SCHEMA
**Applies to:** Directory inventory manager, podcast profiles, and the Ad Planner

---

## Design principle

A single advertising opportunity is **not** one "Ad Type." It is several independent characteristics at the same time. A host-read can *also* be a mid-roll, dynamically inserted, sold inside a season sponsorship, with social add-ons. Spotify and Acast both treat **voice, placement, and delivery as separate properties** — so does Run the Play.

Inventory is modeled as **five independent dimensions**, plus video features and social add-ons:

| Dimension | Question it answers | Cardinality |
|---|---|---|
| **Creative Format** | What does the advertiser receive? | one per opportunity |
| **Sponsorship Type** | How deep / what naming level? | optional, one |
| **Placement** | Where in the episode does it appear? | multi-select |
| **Delivery Method** | How is it inserted/served? | one (+ targeting attrs) |
| **Media Type** | Audio, video, or both? | one |
| **Video Features** | (video only) on-screen treatment | multi-select |
| **Social Add-Ons** | What else is bundled? | multi-select |

The buyer-facing planner collapses this into a simple first choice, then asks the rest as follow-ups. Full detail is preserved for professional buyers; beginners aren't drowned.

---

## 1. Creative Format — *what the advertiser receives*

- **Host-Read Ad** — host delivers in their own voice. Variants: Host Endorsement · Scripted Host Read · Talking-Points Read · Co-Host Read · Producer Read · Live Read. (~30–60s typical; sponsorship reads longer.)
- **Voice-Talent Ad** — prerecorded, voiced by a voice actor / announcer / brand rep / producer. (Spotify treats these as scalable prerecorded creative, distinct from host reads.)
- **Advertiser-Supplied Commercial** — finished spot supplied by the brand (:15 / :30 / :60 / custom; music+SFX or dry read).
- **Custom-Produced Commercial** — the show produces original creative (script, VO, music, sound design, edits, versions, approval rounds).
- **Brand Mention** — brief acknowledgement ("supported by…", opening/closing mention, promo-code, URL/event mention).
- **Product Mention / Testimonial** — host discusses a product used, a service experience, or an approved testimonial. *Kept separate from a standard host read because it's a more personal endorsement.*
- **Sponsored Segment** — recurring/one-time section ("Business Move of the Week, presented by…").
- **Sponsored Interview** — advertiser sponsors a guest/founder/artist/expert conversation. *Profile clarifies whether advertiser can suggest guest/topic.*
- **Branded Episode** — one full episode around a brand-supported topic.
- **Branded Series** — multiple custom episodes across one campaign/theme.
- **Custom Editorial Integration** — brand woven naturally into the conversation/storytelling, not just an ad break. (Acast's "branded content.")

## 2. Sponsorship Type — *depth & naming level* (optional)

Episode Sponsor · Presenting Sponsor · Segment Sponsor · Season Sponsor · Series Sponsor · Show Sponsor · Network Sponsor · Category-Exclusive Sponsor · Title Sponsor · Launch Sponsor.

## 3. Placement — *where it appears* (multi-select)

Pre-Roll · Mid-Roll · Post-Roll · Cold-Open · Opening Mention · Closing Mention · In-Conversation Integration · Full-Episode Takeover · Ad-Break Takeover.

## 4. Delivery Method — *how it's inserted/served* (separate field — required)

- **Baked-In** — permanent part of the episode file (current + future streams, downloads, archive).
- **Dynamic Ad Insertion (DAI)** — inserted into available episodes by campaign dates / audience / geography. *A host-read can be DAI too — it is NOT automatically baked in.*
- **Streaming Ad Insertion** — served in real time on stream (Spotify's SAI).

**Targeting / scope attributes** (multi, apply on top of delivery): Run of Show · Run of Network · Audience-Targeted (age/interests/geo/behavior/category/device) · Contextual Placement.

## 5. Media Type

Audio · Video · Both.

## 6. Video Features — *video episodes only* (multi-select)

Video Host Read · Product Placement · Product Demonstration · Branded Set Placement · On-Screen Graphic (lower-third logo / sponsored-segment graphic / QR / promo code / URL / CTA card) · Video Commercial Insert · Pinned Comment · Description Link · Thumbnail Integration.

## 7. Social & Promotional Add-Ons — *optional bundle* (multi-select)

Instagram Reel · IG Feed Post · IG Story · TikTok Video · YouTube Short · Podcast Clip Sponsorship · Branded Clip · Collaboration Post · Link in Bio · Pinned Social Post · Social Caption Mention · Host Account Repost · Giveaway · Livestream Mention · Community Post · Email Newsletter Mention · Website Article · Website Banner · Episode-Page Placement.

---

## Data model (Drizzle / Postgres)

Replaces the blueprint's single `inventory_type_id`. Enums constrain the vocabulary; multi-select dimensions are join tables so an opportunity can hold several placements / video features / social add-ons.

### `inventory_items` (the opportunity)
| Field | Type | Notes |
|---|---|---|
| id | uuid | pk |
| podcast_id | uuid | fk |
| opportunity_name | text | e.g. "Mid-roll host read + IG reel" |
| creative_format | enum | §1 values (required) |
| sponsorship_type | enum | §2 values (nullable) |
| delivery_method | enum | baked_in · dynamic_insertion · streaming_insertion (required) |
| media_type | enum | audio · video · both |
| duration_seconds | integer | nullable |
| min_episodes | integer | nullable |
| package_episodes | integer | nullable |
| exclusivity_available | boolean | |
| pricing_model | enum | see Pricing Models |
| price_starting | numeric | nullable |
| price_max | numeric | nullable |
| currency | char(3) | |
| availability_status | enum | active · paused · unavailable · archived |
| lead_time_days | integer | nullable |
| category_restrictions | text | |
| creative_requirements | text | |
| preferred_contact_method | text | |
| last_confirmed_at | timestamptz | inventory freshness |
| created_at / updated_at | timestamptz | |

### Multi-select join tables
- **`inventory_placements`** — `(inventory_item_id, placement)` · placement enum = §3
- **`inventory_delivery_targeting`** — `(inventory_item_id, targeting)` · targeting enum = run_of_show · run_of_network · audience_targeted · contextual
- **`inventory_video_features`** — `(inventory_item_id, feature)` · feature enum = §6
- **`inventory_social_addons`** — `(inventory_item_id, addon)` · addon enum = §7

> Rationale: placement, video features, and social add-ons are genuinely many-per-opportunity, so they're rows, not columns. Creative format, delivery, and media type are one-per-opportunity, so they're enums on the item.

### Pricing Models (`pricing_model` enum)
flat_rate · per_episode · cpm · package_price · monthly_sponsorship · seasonal_sponsorship · starting_at · contact_for_pricing · value_exchange (product trade) · custom_quote.

Price display honors the same rules as the blueprint: never present a starting price as a fixed price; "contact for pricing" is a first-class state.

---

## Inventory form (what a podcast fills in)

Opportunity Name · Creative Format · Sponsorship Type · Placement (multi) · Delivery Method · Audio/Video/Both · Duration · Number of Episodes · Social Add-Ons (multi) · Starting Price · Maximum Price · Pricing Model · Availability · Lead Time · Category Restrictions · Exclusivity Available · Creative Requirements · Preferred Contact Method.

---

## Ad Planner — buyer-facing layer

The planner keeps the **first** choice simple, then reveals detail. Public structure:

> **What type of ad is it? → Where does it appear? → How is it delivered? → What else is included?**

### Step: "Choose your advertising format" (11 options)
1. Host-Read Ad
2. Voice-Over Ad
3. Commercial Insert
4. Sponsored Segment
5. Sponsored Interview
6. Branded Episode
7. Episode Sponsorship
8. Presenting or Season Sponsorship
9. Video Integration
10. Podcast + Social Package
11. Custom Campaign

Each maps to a dimension preset the matching engine filters on:

| Planner choice | Maps to |
|---|---|
| Host-Read Ad | creative_format = host_read |
| Voice-Over Ad | creative_format = voice_talent_ad |
| Commercial Insert | creative_format = advertiser_supplied_commercial |
| Sponsored Segment | creative_format = sponsored_segment |
| Sponsored Interview | creative_format = sponsored_interview |
| Branded Episode | creative_format = branded_episode |
| Episode Sponsorship | sponsorship_type = episode |
| Presenting/Season Sponsorship | sponsorship_type ∈ {presenting, season} |
| Video Integration | media_type = video (+ video_features) |
| Podcast + Social Package | any item + ≥1 social_addon |
| Custom Campaign | creative_format = custom_produced_commercial / open |

### Follow-up questions after the format choice
Preferred placement · Audio or video · Duration · Number of episodes · Baked-in or dynamically inserted · Social add-ons · Exclusivity · Campaign dates · Budget.

This keeps Run the Play usable for first-time buyers without losing the detail professional buyers need — and lets the matcher score on real, separable characteristics instead of one fuzzy "ad type."
