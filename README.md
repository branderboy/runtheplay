# Run the Play

Clutch-style directory + Ad Planner surfacing **Black creators'** podcast advertising inventory. Mainly hip-hop/urban; any Black creator qualifies; no politics.

**Tagline:** Advertising Made Simple for the Culture

## Repository layout

```
data/seed/            Seed podcast list (CSV) + quality report
docs/                 Product specs (inventory taxonomy, newsletter component)
src/db/schema/        Drizzle schema — podcasts, inventory, newsletter
scripts/import-seed.ts  Loads the seed CSV into the directory tables
```

Planning docs (thesis, use case, blueprint) live at the repo root and in the blueprint archive.

## Data layer

- **Postgres (Neon)** + **Drizzle ORM**, snake_case columns.
- Inventory is modeled as five independent dimensions (creative format, sponsorship type, placement, delivery method, media type) plus video features and social add-ons — see `docs/INVENTORY_TAXONOMY.md`.
- Newsletter is a two-edition, opt-in, suppression-aware system — see `docs/NEWSLETTER_COMPONENT.md`.

## Setup

```bash
npm install
cp .env.example .env        # add your Neon DATABASE_URL
npm run db:generate         # generate SQL migration from the schema
npm run db:migrate          # apply it to your database
npm run db:seed             # import data/seed/podcasts_seed.csv (48 shows)
```

`npm run db:push` is a faster alternative to generate+migrate during early development. `npm run typecheck` runs `tsc --noEmit`.

## Seed data

48 unique Black-creator shows researched from public sources, deduped, and scored (`data/seed/QUALITY_REPORT.md`). All rows are `unclaimed` / `unverified` at `public_source` confidence — the owner-claim flow fills pricing, inventory, and verified stats. The importer maps each row into `podcasts` plus normalized `hosts`, `categories`, `audience_tags`, `podcast_platforms`, and `source_records`; inventory tables are defined but populated when creators claim and add opportunities.
