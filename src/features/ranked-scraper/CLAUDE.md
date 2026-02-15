# Ranked Scraper Module

Daily cron job that scrapes the top 2000 SF6 ranked players from the Buckler website and imports them into the database.

## Module Structure

```
ranked-scraper/
├── ranked-scraper.module.ts       # Imports BucklerModule + RankedDataParserModule
├── index.ts                       # Barrel exports
└── services/
    ├── ranked-scraper.service.ts      # Cron orchestrator
    └── ranked-page-parser.service.ts  # HTML parsing with cheerio
```

## How It Works

### Cron Schedule
`@Cron("0 23 * * *")` — Runs daily at 11:00 PM UTC.

### Buffer-Then-Save Strategy
1. Load config once from `sf6_buckler_config` table
2. Scrape all 100 pages into an in-memory array (no DB writes)
3. Rate-limited at 1 request/second by `BucklerHttpService`
4. Only after ALL pages succeed, import the full array to DB via `RankedDataParserService.processBatchRecords()`
5. Daily snapshot is either **complete or absent** — never partial

### Failure Handling
- **Cookie expiry** (403/redirect): Abort, discard buffer, DB untouched, Discord alert
- **HTML structure change** (missing elements): Abort, discard buffer, DB untouched, Discord alert
- **0 records scraped**: Abort, Discord alert
- **Missing config** (cookies/phase/season): Skip with Discord alert
- **Disabled** (`enabled=false`): Silent skip, log only

### Phase Reminder
After each successful scrape, checks if `phase_start_date` is 80+ days ago. If so, sends a Discord warning to update phase/season via the admin endpoint.

## RankedPageParserService

Parses one page of Buckler ranking HTML into `RankedPlayerRecord[]` using `cheerio`.

### CSS Selectors (matching the original Python scraper)
- `ul.ranking_ranking_list__szajj` — Player list container (expects at least 2; uses the second one)
- `div.ranking_time__teMP4` — Rank/MR text
- `span.ranking_name__El29_` — Player name (CFN)
- `span.ranking_image__lFEYG` — Character icon (alt text = character name)
- `span.ranking_frag__D7XnG` — Country flag
- `span.ranking_image__lFEYG.undefined` — League icon

### Offset-Based Indexing
Replicates the Python scraper's stepping pattern:
- Player index: `+1` (sequential)
- Character index: `+2` per player
- Usercode index: `+3` per player

This is because the HTML structure nests multiple elements per player row.

### Important
If Capcom updates the Buckler page structure (CSS class names, HTML layout), this parser will break. The `HTMLParsingError` will fire, Discord alert will notify you, and the selectors in `SELECTORS` constant need to be updated to match the new structure.

## Dependencies

- **BucklerModule**: Config, HTTP client, notifications
- **RankedDataParserModule** (`@features/ranked-parser`): `processBatchRecords()` handles DB upserts for profiles, characters, and rankings
- **cheerio**: HTML parsing (Node.js equivalent of Python's BeautifulSoup)

## Data Flow

```
Buckler Website → BucklerHttpService (fetch HTML) → RankedPageParserService (parse to records)
→ memory buffer → RankedDataParserService.processBatchRecords() → PostgreSQL
```

## RankedPlayerRecord Type

Defined in and exported from `@features/ranked-parser` (the `ranked-data-parser.service.ts` file). Shared between the scraper and the parser to maintain a single source of truth.

```typescript
type RankedPlayerRecord = {
    key: number;
    CFN: string;
    Rank: number;
    MR: number;
    Character: string;
    Usercode: string;
    Country: string;
    League: string;
};
```
