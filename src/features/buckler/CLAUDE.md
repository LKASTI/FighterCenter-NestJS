# Buckler Module

Shared infrastructure for interacting with the Buckler website (https://www.streetfighter.com/6/buckler). This module is designed to be reusable across multiple scrapers — currently used by `ranked-scraper`, and will be reused by a future profile scraper.

## Module Structure

```
buckler/
├── buckler.module.ts              # Module definition
├── index.ts                       # Barrel exports
├── controllers/
│   └── buckler-config.controller.ts   # SUPER_ADMIN config endpoint
├── decorators/
│   └── buckler-config-swagger.decorators.ts
├── dtos/
│   ├── update-buckler-config.dto.ts
│   └── get-buckler-config.response.dto.ts
├── entities/
│   └── sf6BucklerConfig.entity.ts     # Single-row config table
├── services/
│   ├── buckler-auth.service.ts        # Cookie provider (swap for auto-login later)
│   ├── buckler-config.service.ts      # DB config CRUD
│   ├── buckler-http.service.ts        # HTTP client with rate limiting
│   └── buckler-notification.service.ts # Discord webhook alerts
└── types/
    └── buckler.types.ts               # CookieExpiredError, HTMLParsingError
```

## Services

### BucklerConfigService
CRUD for the `sf6_buckler_config` table (single-row, typed columns). Key methods:
- `getConfig()` — returns the full config row (throws if missing, meaning migrations haven't run)
- `updateConfig(partial)` — partial update of config fields
- `isEnabled()`, `getCookies()`, `getPhaseAndSeason()`, `getDiscordWebhookUrl()`, `getPhaseStartDate()` — convenience accessors

**Important**: Each convenience method calls `getConfig()` independently. When calling multiple methods in sequence (e.g., in a cron job), load the config once via `getConfig()` and use the fields directly to avoid redundant DB queries.

### BucklerAuthService
Provides cookies for authenticated Buckler requests. Currently reads from the config table. **This is the abstraction layer to swap when implementing automated login** — the interface (`getCookies(): Promise<Record<string, string> | null>`) stays the same.

Note: The ranked scraper loads config once and builds cookies directly for efficiency. The auth service is available for other consumers (e.g., future profile scraper) that make fewer requests.

### BucklerHttpService
Generic HTTP client for fetching Buckler pages. Features:
- **Rate limiting**: Configurable delay between requests (default 1s). Instance-level, not global across replicas.
- **Cookie expiry detection**: 403 responses and login redirects throw `CookieExpiredError`
- **Browser-mimicking headers**: User-Agent, sec-ch-ua, etc. to look like a real browser visit
- **Maintenance note**: The Chrome version in headers (currently Chrome 129) is hardcoded. If Buckler starts blocking based on stale user-agent strings, bump the version numbers in `BROWSER_HEADERS`. The Discord failure alerts will notify you if this becomes an issue (scraper will start getting 403s).

### BucklerNotificationService
Discord webhook notifications with color-coded embeds:
- `notifyFailure()` — Red (0xFF0000)
- `notifyWarning()` — Yellow (0xFFCC00)
- `notifySuccess()` — Green (0x00FF00)

Fire-and-forget with try/catch — webhook failures never block the caller. No-ops if webhook URL not configured.

## Config Table: `sf6_buckler_config`

Single-row table enforced by `CHECK (id = 1)`. All config is updatable at runtime via `PATCH /buckler-config` (SUPER_ADMIN only) — no redeployment needed.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | integer | Always 1 (CHECK constraint) |
| `enabled` | boolean | Kill switch for the scraper (default false) |
| `buckler_id` | varchar | Buckler session cookie |
| `buckler_r_id` | varchar | Buckler request tracking cookie |
| `buckler_praise_date` | varchar | Buckler timestamp cookie |
| `phase` | integer | Current ranked phase number |
| `season` | integer | Current season number |
| `discord_webhook_url` | varchar | Discord webhook for notifications |
| `phase_start_date` | date | For phase transition reminders |
| `updated_at` | timestamptz | Auto-updated on changes |

## Controller: `PATCH /buckler-config` and `GET /buckler-config`

- Protected with `SeriesAuthGuard` + `@Roles("SUPER_ADMIN")`
- GET response masks sensitive values (cookies, webhook URL) — shows first 6 + last 4 chars
- PATCH supports sending `null` to clear any nullable field (e.g., `{ "discordWebhookUrl": null }`)
- Omitting a field from PATCH leaves it unchanged

## Error Types

- `CookieExpiredError` — thrown when Buckler returns 403 or redirects to login. Carries optional `page` number for context.
- `HTMLParsingError` — thrown when expected HTML elements are missing (Capcom may have changed their page layout). Carries optional `page` number.

## Future Extensibility

When adding a profile scraper:
1. Create `src/features/profile-scraper/` following the same pattern as `ranked-scraper`
2. Import `BucklerModule` — reuse `BucklerHttpService` (rate limiting), `BucklerAuthService` (cookies), `BucklerNotificationService` (alerts)
3. Create profile-specific page parser and orchestrator services
