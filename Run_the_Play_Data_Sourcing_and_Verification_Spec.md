# Run the Play — Data Sourcing and Verification Specification

**Document type:** Product, data, and editorial operating specification  
**Status:** MVP planning  
**Applies to:** Website, podcast profiles, Ad Planner, Campaign Basket, rankings, TikTok, Instagram, email, and editorial content  
**Core rule:** Run the Play may organize and explain advertising opportunities, but it must never present an estimate as a verified fact.

---

## 1. Purpose

Run the Play needs one shared data system powering both:

1. The public website and Ad Planner
2. Social media posts, rankings, comparisons, and podcast intelligence clips

The website and social accounts must use the same stored podcast records and metric snapshots. A number should not be manually typed into a graphic if it conflicts with the number displayed on the website.

This specification defines:

- Which sources may supply each field
- Which data can be collected publicly
- Which data requires podcast-owner authorization
- Which data may be estimated
- How often each metric should refresh
- How metrics should be labeled
- How growth and rankings should be calculated
- How disputes, corrections, and stale data should be handled

---

## 2. Data Trust Levels

Every metric must use one of these statuses.

### Verified

Data obtained through one of the following:

- An authorized platform connection owned by the podcast
- A platform analytics export supplied by the verified podcast owner
- A media kit, rate card, or analytics screenshot reviewed by Run the Play
- A verified podcast owner directly confirming inventory, pricing, contact details, or audience information

Use the badge:

> **Verified**

### Public

Data visible through an approved public API, RSS feed, public chart, official podcast page, or public social profile.

Examples:

- YouTube video views
- Public YouTube subscriber count
- Spotify chart position
- Episode publication date
- Public social follower count captured as a dated snapshot

Use the badge:

> **Public**

### Estimated

Data modeled, licensed, or inferred from a third-party research provider or Run the Play methodology.

Examples:

- Estimated podcast listeners
- Estimated audience demographics
- Estimated ad-rate range
- Estimated monthly reach derived from recent public videos

Use the badge:

> **Estimated**

### Podcast Supplied

Information submitted by the podcast but not independently verified.

Examples:

- Downloads per episode
- Listener demographics
- Rate card
- Brand case studies

Use the badge:

> **Podcast Supplied**

A podcast-supplied metric may be upgraded to **Verified** after evidence is reviewed.

---

## 3. Display Standard

Every metric shown on the website or social media must include:

- Metric name
- Value
- Platform or source
- Measurement period
- Snapshot or update date
- Trust status
- Methodology link when calculated

### Correct example

> **428K clip views**  
> YouTube · Lifetime views for this video · Updated July 22, 2026 · Public

### Correct verified example

> **2.1M channel views**  
> Previous 28 days · YouTube Analytics · Updated July 22, 2026 · Verified

### Incorrect example

> **2.1M monthly views**

This is unacceptable unless the date range and source are known.

---

## 4. Source Priority

When multiple sources provide the same metric, use this order:

1. Authorized first-party platform analytics
2. Verified owner-supplied analytics export
3. Official public API or official public chart
4. Podcast RSS feed
5. Public profile snapshot
6. Licensed third-party estimate
7. Run the Play estimate

Do not average conflicting sources. Store each source separately and select one as the displayed source.

---

# 5. Podcast Identity and Catalog Data

## Primary source: RSS feed

The RSS feed should be the primary source for:

- Podcast title
- Podcast description
- Author or publisher
- Website URL
- RSS feed URL
- Cover artwork
- Language
- Explicit-content status
- Primary and secondary categories
- Episode title
- Episode description
- Episode publication date
- Episode GUID
- Episode duration
- Episode number
- Season number
- Episode type
- Audio or video enclosure URL

Apple requires public RSS feeds to follow RSS 2.0 and include stable episode GUIDs and enclosure information. The GUID should be treated as the durable episode identifier.

### Refresh frequency

- Active shows: every 2 to 6 hours
- Inactive shows: daily
- Failed feed: retry after 1 hour, 6 hours, and 24 hours
- Mark a feed unhealthy after three consecutive failures

### Data ownership

RSS data is **Public**.

### Conflict handling

A verified podcast owner may add editorial fields that do not replace the original RSS value, such as:

- Short marketing description
- Cultural positioning
- Audience interests
- Advertising summary
- Preferred show name styling

Store both the raw RSS value and the owner-edited display value.

---

## Secondary catalog sources

### Apple Podcasts Search API

Use for:

- Matching podcast names to Apple catalog IDs
- Apple Podcasts URL
- Artwork reference
- Country storefront availability
- Basic catalog discovery

Do not use Apple promotional assets outside Apple’s permitted promotional context without reviewing its terms.

### Podcast Index

Use as an optional discovery and feed-resolution source for:

- Finding RSS feeds
- Resolving duplicate shows
- Discovering recent episodes
- Identifying podcast namespaces

Do not let a secondary directory overwrite the verified RSS feed selected by the podcast owner.

---

# 6. YouTube Data Sourcing

## Public YouTube Data API

Use the YouTube Data API for:

### Channel fields

- Channel ID
- Channel title
- Channel description
- Channel thumbnail
- Public subscriber count, when visible
- Lifetime channel view count
- Public video count
- Upload playlist ID

### Video fields

- Video ID
- Title
- Description
- Publication date
- Thumbnail
- Duration
- View count
- Like count, when available
- Comment count, when available

### Calculated public metrics

Run the Play may calculate:

- Uploads in the last 7, 30, or 90 days
- Average views across the latest 10 full episodes
- Median views across the latest 10 full episodes
- Views on videos published during the last 30 days
- Average first-7-day views, only after Run the Play has stored daily snapshots
- Subscriber growth, only after Run the Play has stored historical snapshots

### Required wording

Use:

> Views on videos published in the last 30 days

Do not call this:

> Monthly channel views

The public channel view count is a lifetime figure. True date-range channel views require owner authorization.

### Refresh frequency

- Video view counts: daily
- New uploads: every 2 to 6 hours
- Channel subscribers: daily
- Historical snapshots: retain permanently

### Status

Public API values: **Public**  
Run the Play calculations: **Public — Calculated**

---

## Connected YouTube Analytics

A podcast owner may connect their channel through Google OAuth.

Use connected analytics for:

- Views during a selected date range
- Engaged views
- Watch time
- Average view duration
- Average percentage viewed
- Subscribers gained and lost
- Traffic sources
- Country, state, city, and DMA
- Viewer age groups
- Viewer gender
- Sharing activity
- Video-level performance

YouTube Analytics requests require authorization for a channel the user owns or manages.

### Recommended date ranges

Store:

- Previous 7 complete days
- Previous 28 complete days
- Previous calendar month
- Previous 90 complete days

Do not mix partial-day analytics into a published monthly ranking.

### Status

Connected analytics: **Verified**

### Privacy

Do not display demographic segments where platform thresholds suppress the data. Do not expose raw small-cell data that could identify individual viewers.

---

# 7. Spotify Data Sourcing

## Public Spotify charts

Use official Spotify Podcast Charts for:

- Top Podcasts position
- Trending Podcasts position
- Category position
- Country
- Chart type
- Date captured
- Daily position movement

Spotify states that Top Podcasts use weekly unique audience, Trending Podcasts use a combination of growth factors, and charts update daily.

### Store each chart snapshot

Fields:

- Podcast ID
- Country
- Category
- Chart type
- Position
- Snapshot date
- Previous position
- Seven-day high
- Thirty-day high
- Days charting

### Required wording

> Spotify: #14 Society & Culture — United States  
> Captured July 22, 2026 · Public

Do not present chart position as downloads, listeners, or market share.

---

## Spotify for Creators analytics

Spotify creator analytics should be obtained through:

- Owner-supplied CSV export
- Owner-supplied analytics screenshots
- A future authorized integration, if Spotify makes an appropriate supported API available

Potential verified fields include:

- Plays
- Downloads, when hosted with Spotify for Creators
- Unique audience
- Plays and downloads
- Episode performance
- Engagement
- Consumption
- Date-range trends

Spotify defines a play as at least 30 seconds of listening or viewing. Store the exact source definition with imported metrics.

### Status

Owner analytics export: **Verified** after review  
Unreviewed owner entry: **Podcast Supplied**

### Refresh frequency

- Public charts: daily
- Owner export: monthly or when the owner uploads a new file

---

# 8. Apple Podcasts Data Sourcing

## Public sources

Use RSS and Apple catalog data for:

- Apple show URL
- Apple podcast ID
- Artwork
- Publisher
- Categories
- Episode catalog presence

## Apple Podcasts Connect analytics

Apple analytics are owner-controlled and may include:

- Unique devices
- Listening or viewing completion
- Followers gained
- Country and city
- Episode engagement

Collect through an owner-supplied export or reviewed screenshot unless an approved integration becomes available.

Apple notes that analytics may be delayed and that minimum audience thresholds can apply.

### Status

Reviewed export or screenshot: **Verified**  
Manually entered without evidence: **Podcast Supplied**

---

# 9. Instagram Data Sourcing

## Connected professional accounts

Allow verified podcast owners to connect an Instagram Business or Creator account.

Potential account metrics include:

- Follower count
- Reach
- Profile views
- Website clicks or profile-link taps
- Total interactions
- Accounts engaged
- Follower growth
- Follower demographics
- Reached-audience demographics
- Engaged-audience demographics

Potential media metrics include:

- Views
- Reach
- Likes
- Comments
- Shares
- Saves
- Interactions

Instagram Insights apply to professional accounts. Some demographic and insight metrics require sufficient audience volume, and some account data is available only for limited historical windows.

### Refresh frequency

- Account totals: daily
- Media performance: daily for the first 14 days, then weekly
- Demographics: weekly
- Historical snapshots: retain permanently

### Status

Connected Instagram Insights: **Verified**

---

## Unconnected Instagram accounts

For an unconnected public account, Run the Play may store a dated manual or permitted public snapshot of:

- Username
- Profile URL
- Visible follower count
- Visible post or Reel view count
- Verification status

Do not claim access to reach, impressions, saves, audience age, gender, or geography without owner-authorized Insights or supporting evidence.

### Status

Visible public count: **Public Snapshot**

### Rule

Do not build the product around unauthorized scraping. If a reliable permitted API is unavailable, require owner connection or manual verification.

---

# 10. TikTok Data Sourcing

## Owner-authorized TikTok connection

TikTok’s user-authorized APIs can expose approved fields such as:

- Username
- Display name
- Profile URL
- Verification status
- Follower count
- Following count
- Total likes
- Video count
- Recent public videos
- Selected video metadata

Access depends on approved scopes and user authorization.

### Refresh frequency

- Profile totals: daily
- Recent videos: every 6 hours
- Video metrics: daily for the first 14 days, then weekly

### Status

Authorized TikTok data: **Verified**

---

## Public or research access

TikTok Research API access should not be treated as a guaranteed commercial production source. It has separate eligibility and approval requirements.

For unconnected accounts, store only public profile snapshots gathered through a permitted process.

### Status

Visible public count: **Public Snapshot**

---

# 11. Other Social Platforms

## X

Collect:

- Handle
- Profile URL
- Public follower count, where permitted
- Post links
- Public engagement counts
- Owner-supplied analytics

Do not rely on X as an MVP-critical automated source until API pricing and permissions are validated.

## Facebook

Collect:

- Page URL
- Public page identity
- Owner-connected Page Insights when available
- Public post links
- Owner-supplied analytics

## Threads

Treat as optional. Use owner connection or owner-supplied evidence when available.

## LinkedIn

Use only when the podcast has a company or show page relevant to advertising. Do not use host personal-network data as the show’s audience size.

---

# 12. Audience Demographics

## Allowed verified sources

- YouTube Analytics
- Instagram Insights
- Spotify for Creators export
- Apple Podcasts Connect export
- Podcast hosting-platform analytics
- Verified media kit
- Third-party licensed estimates

## Required demographic fields

Each demographic record must include:

- Platform
- Audience definition
- Date range
- Sample or audience threshold, when available
- Geography
- Age brackets
- Gender categories as provided by the platform
- Source status
- Evidence file or source record
- Last updated date

## Prohibited inference

Do not infer race, ethnicity, income, political beliefs, or other sensitive characteristics from:

- Host appearance
- Podcast title
- Guest list
- Comments
- Followers’ profile photos
- Neighborhood or ZIP code
- Music preference alone

“Urban” should be used as a content or cultural-market category, not as an assumed racial demographic.

Use phrases such as:

> Urban culture audience affinity

Do not use:

> 68% Urban

unless the exact methodology is defined and defensible.

---

# 13. Advertising Inventory and Pricing

These fields must come from the podcast owner or authorized representative:

- Inventory format
- Placement description
- Episode or package quantity
- Ad length
- Rate
- Starting rate
- Rate range
- Availability
- Lead time
- Category restrictions
- Creative requirements
- Contact method
- Media kit
- Rate card
- Last confirmed date

## Inventory freshness

- Ask owners to confirm inventory every 30 days
- Mark inventory **Needs Confirmation** after 45 days
- Hide or archive inventory after 90 days without confirmation
- Preserve historical versions for audit purposes

## Estimated ad rates

Run the Play may publish an estimated range only when:

- The methodology is public
- The estimate is clearly labeled
- It is not presented as the podcast’s actual rate
- The podcast can correct or remove it

Example:

> Estimated planning range: $750–$1,500  
> Based on public reach signals and comparable listings · Not a quoted rate

---

# 14. Third-Party Research Providers

Potential providers include Rephonic and other licensed podcast-data products.

Before using third-party data on public pages, confirm:

- Display and redistribution rights
- API access terms
- Refresh limits
- Attribution requirements
- Whether values may be stored permanently
- Whether values may appear in social graphics
- Whether derived rankings are allowed

## Rephonic

Treat Rephonic audience and demographic values as **Estimated** unless the provider explicitly identifies a first-party verified source.

Never relabel third-party predictive demographics as verified.

---

# 15. Growth Calculations

## Follower growth

Use:

`current snapshot - beginning snapshot`

Display:

- Net growth
- Percentage growth
- Starting value
- Ending value
- Exact date range

Do not calculate percentage growth when the beginning value is zero.

## Video-view growth

For a specific clip:

`current lifetime views - views at the beginning of the measurement window`

If no beginning snapshot exists, display only the current lifetime views.

## Upload frequency

Recommended method:

`number of qualifying full episodes published during the previous 28 complete days ÷ 4`

Label:

> Average uploads per week, previous 28 days

Exclude Shorts, trailers, clips, and livestream fragments unless the profile specifically classifies them as full episodes.

## Monthly views

Only use “monthly views” for:

- Authorized date-range analytics
- A clearly defined calendar-month export

For public data, use:

> Views on videos published in the last 30 days

or:

> Current views across the latest 10 episodes

---

# 16. Ranking Methodology

Every ranking needs a published methodology page.

A ranking record must store:

- Ranking name
- Eligible podcast population
- Platforms included
- Metrics included
- Weights
- Date range
- Minimum data requirements
- Exclusions
- Tie-breaking rule
- Calculation version
- Publication date

## Example: Top Podcast Growth

Possible formula:

- 40% YouTube subscriber growth
- 30% Instagram follower growth
- 20% TikTok follower growth
- 10% Spotify chart movement

This formula must not launch until enough historical snapshots exist across the eligible shows.

For the MVP, publish single-source rankings first:

- Top 5 by YouTube subscriber growth
- Top 5 by Instagram follower growth
- Top 5 by Spotify chart movement
- Most consistent upload schedules

Single-source rankings are easier to defend.

---

# 17. Social Media Publishing Rules

Every Run the Play social graphic should be generated from stored website data.

## Recommended three-metric lower third

1. Clip views
2. Channel subscribers or show followers
3. Verified audience demographic or Spotify chart position

Do not overcrowd the graphic.

## Example

> THE CULTURE DESK POD  
> Clip Views: 428K  
> YouTube Subscribers: 112K  
> Audience: 62% Age 18–34  
> Source: YouTube · Updated July 22 · Demographic Verified

## Social post record

Store:

- Social post ID
- Podcast ID
- Episode ID
- Clip URL
- Metrics used
- Metric snapshot IDs
- Caption
- Source line
- Published date
- Platform
- Rights or approval status

This allows Run the Play to prove exactly which data appeared in each post.

---

# 18. Data Architecture

## Core tables

### podcasts

- id
- name
- slug
- rss_feed_url
- website_url
- description_raw
- description_display
- artwork_url
- language
- explicit_status
- claimed_status
- verified_status
- owner_user_id
- created_at
- updated_at

### podcast_platform_accounts

- id
- podcast_id
- platform
- external_account_id
- handle
- profile_url
- connection_status
- authorization_status
- connected_at
- last_synced_at

### episodes

- id
- podcast_id
- guid
- title
- description
- published_at
- duration_seconds
- episode_number
- season_number
- episode_type
- enclosure_url
- youtube_video_id
- created_at
- updated_at

### metric_definitions

- id
- code
- name
- platform
- unit
- description
- public_or_private
- calculation_method
- methodology_version

### metric_snapshots

- id
- podcast_id
- episode_id
- platform_account_id
- metric_definition_id
- value_numeric
- value_text
- period_start
- period_end
- captured_at
- source_type
- source_name
- trust_status
- evidence_id
- methodology_version
- is_displayable
- created_at

### evidence_files

- id
- podcast_id
- uploaded_by
- file_type
- source_platform
- period_start
- period_end
- storage_url
- review_status
- reviewed_by
- reviewed_at
- expiration_date

### inventory_items

- id
- podcast_id
- inventory_type
- title
- description
- rate_type
- rate_min
- rate_max
- currency
- availability_status
- lead_time_days
- restrictions
- contact_url
- last_confirmed_at
- expires_at

### rankings

- id
- name
- slug
- methodology_version
- eligibility_query
- period_start
- period_end
- published_at

### ranking_entries

- id
- ranking_id
- podcast_id
- position
- score
- supporting_snapshot_ids
- explanation

### social_posts

- id
- podcast_id
- episode_id
- platform
- external_post_id
- clip_url
- caption
- source_line
- published_at
- rights_status

### social_post_metrics

- social_post_id
- metric_snapshot_id
- display_order
- display_label

---

# 19. Sync and Refresh Schedule

| Data type | MVP frequency | Status |
|---|---:|---|
| RSS feed | Every 2–6 hours | Public |
| YouTube new videos | Every 2–6 hours | Public |
| YouTube public views | Daily | Public |
| YouTube subscribers | Daily | Public |
| Connected YouTube Analytics | Daily | Verified |
| Spotify charts | Daily | Public |
| Spotify owner export | Monthly | Verified |
| Instagram connected insights | Daily | Verified |
| Instagram demographics | Weekly | Verified |
| TikTok connected profile | Daily | Verified |
| Public social snapshots | Weekly or before publishing | Public Snapshot |
| Inventory | Owner confirmation every 30 days | Verified/Owner Supplied |
| Media-kit evidence | At upload and every 90 days | Verified |
| Rephonic estimates | Based on license and plan | Estimated |

---

# 20. Staleness Rules

Use these website labels:

- **Fresh:** updated within expected refresh period
- **Recently Updated:** up to twice the expected refresh period
- **Stale:** beyond twice the expected refresh period
- **Needs Confirmation:** owner-controlled data not reconfirmed
- **Unavailable:** source failed or permission was revoked

Do not publish a ranking using stale data unless every eligible show is measured from the same historical cutoff.

---

# 21. Corrections and Disputes

Every profile should include:

> Report incorrect data

The correction workflow:

1. User identifies the metric
2. User submits corrected value and evidence
3. Run the Play preserves the original snapshot
4. Admin reviews the evidence
5. Displayed value is updated or rejected
6. Decision is logged
7. Rankings affected by the correction are recalculated when material

Podcast owners should be able to:

- Connect official accounts
- Upload analytics exports
- Challenge duplicate profiles
- Correct category and identity information
- Request removal of unsupported estimates
- Confirm inventory and rates

---

# 22. Rights, Compliance, and Platform Terms

Before launch:

- Review each API’s developer terms
- Obtain required app approvals
- Store only permitted fields
- Honor account disconnection and deletion requests
- Encrypt access and refresh tokens
- Do not expose platform tokens to the client
- Maintain a data-retention policy
- Maintain a source and methodology page
- Do not scrape platforms where scraping violates applicable terms
- Obtain permission or a valid license for podcast clips and artwork
- Record clip approval or license status

The database should retain source lineage without retaining restricted raw data longer than permitted.

---

# 23. MVP Implementation Order

## Phase 1 — Public foundation

1. RSS ingestion
2. Apple catalog matching
3. YouTube public data
4. Spotify chart snapshots
5. Manual social snapshots
6. Owner-submitted inventory
7. Public, Verified, Estimated, and Podcast-Supplied labels
8. Metric source and update dates

## Phase 2 — Owner verification

1. YouTube OAuth and Analytics
2. Instagram professional-account connection
3. TikTok owner connection
4. Evidence uploads
5. Inventory confirmation workflow
6. Data dispute workflow

## Phase 3 — Intelligence

1. Historical growth tracking
2. Rankings
3. Ad Planner recommendations
4. Audience matching
5. Social graphic generation from snapshot IDs
6. Data-quality scoring

---

# 24. Definition of Done

The data system is ready for MVP when:

- Every displayed metric has a source and date
- The website and social graphics read from the same snapshot records
- Public data is never labeled verified
- Estimated data is never presented as first-party data
- Monthly metrics use a real date range
- Owners can correct and verify their profile
- Stale inventory is automatically flagged
- Rankings have a public methodology
- Demographics come from authorized or documented sources
- Social posts preserve the exact metric snapshots used
- Run the Play can audit where any displayed number came from

---

# 25. Official Reference Links

- [YouTube Data API — Channels](https://developers.google.com/youtube/v3/docs/channels)
- [YouTube Data API — Channels List](https://developers.google.com/youtube/v3/docs/channels/list)
- [YouTube Analytics — Channel Reports](https://developers.google.com/youtube/analytics/channel_reports)
- [YouTube Analytics — Reports Query](https://developers.google.com/youtube/analytics/reference/reports/query)
- [Spotify Podcast Charts](https://support.spotify.com/creators/article/podcast-charts-on-spotify/)
- [Spotify for Creators — Overview Analytics](https://support.spotify.com/creators/article/overview-analytics/)
- [Apple Podcast RSS Requirements](https://podcasters.apple.com/support/823-podcast-requirements)
- [Apple Podcast Metadata](https://podcasters.apple.com/support/832-podcast-metadata)
- [Apple Podcasts Analytics](https://podcasters.apple.com/support/5392-listener-analytics)
- [Apple iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/)
- [Instagram Insights — Meta Collection](https://www.postman.com/meta/instagram/folder/23987686-f659d7d1-d74c-44e4-9192-9b1e8694c511)
- [TikTok Display API](https://developers.tiktok.com/doc/display-api-overview)
- [TikTok Get User Info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info/)
- [Podcast Index API](https://podcastindex-org.github.io/docs-api/)
- [Rephonic](https://rephonic.com/)
