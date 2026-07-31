## Why

An airport imported from the SkyLink provider is second-class data in two ways, and
both are invisible to the people who would have to fix them. Its `country` holds the
provider's ISO 3166-1 alpha-2 code (`GB`) while every hand-curated airport holds a
full country name (`Germany`, `Poland`, `United States of America`), so the same
field means two different things depending on where the row came from — the flight
test fixtures already asserted `"country": "GB"` next to `"country": "Germany"` in
one response. And it arrives with no boundary shape, no terminals, no gates and no
runways, yet the API says nothing about that, so operations has no way to find the
airports that still need curation.

## What Changes

- Airport `country` is always a full country name. A two-letter code arriving from
  the airport data provider is resolved to its English country name before it enters
  the system, so both the airport import and the provider lookup endpoint return
  names. Values that are already names, or codes that cannot be resolved, pass
  through unchanged.
- ISO 3166-1 **user-assigned** codes (`AA`, `ZZ`, `QM`–`QZ`, `XA`–`XZ`) are never
  resolved. They are placeholders, and the underlying ICU data maps them to strings
  like `Unknown Region` and `Pseudo-Accents`, which must never be persisted as a
  country.
- **BREAKING (minor, Operations-only):** `GET /api/v1/skylink/airport/:iataCode` now
  reports `country` as a resolved name rather than the provider's two-letter code.
  The field's type is unchanged; only its content is. The endpoint is
  Operations-gated and exists to feed the import flow.
- Every airport carries a **data quality** grade — `low`, `high` or `flagship` —
  describing how complete its curated data is. It is returned on every airport the
  API exposes, including the airports embedded in flight, aircraft and statistics
  responses.
- A newly imported or newly created airport is `low` unless a grade is supplied.
- Operations can raise or lower an airport's grade through the existing airport
  update endpoint. The grade is editorial: it is set by hand, not derived from the
  data present.
- The airport list can be filtered by grade
  (`GET /api/v1/airport?dataQuality=flagship`), alongside the existing `continent`
  filter, so the airports needing curation can be found.

## Capabilities

### New Capabilities

- `airport-data-curation`: how an airport's provider-sourced fields are normalised
  into the project's own vocabulary, and how the completeness of an airport's
  curated data is graded, read, edited and filtered.

### Modified Capabilities

- _None._ No existing spec in `openspec/specs/` covers airport records; the closest,
  `airport-weather`, is about METAR/TAF and is untouched.

## Impact

- **Country name resolution** is applied once, at the provider boundary
  (`SkyLinkClient.findAirportBy`), which is the only place a country code enters the
  system. Both consumers — the ICAO import command and the IATA passthrough endpoint —
  benefit, and a future third consumer cannot reintroduce the bug. New shared helper
  under `src/core/utils/`.
- **Schema change:** new `DataQuality` enum and a `dataQuality` column on `airport`,
  defaulting to `low`; one forward migration, no data backfill.
- **Airport API:** `dataQuality` added to the airport model (optional on the request
  side, always present in responses), to the airport list filters, and to every
  Prisma select that projects an airport into a response — the airports module's own
  select, the flights module's embedded airport select, and the trimmed projection
  used for diversions (which still omits `shape`).
- **No new endpoints and no new roles.** Editing rides on the existing
  Operations-gated `PATCH /api/v1/airport/:id`; reading rides on the existing airport
  reads, which are public.
- **Seed data untouched** — every seeded airport is `low` by the column default.
- **Wide test churn:** the Cucumber body matcher compares exact key counts, so
  `dataQuality` had to be added to every asserted airport body across the suite
  (~170 occurrences in 30 feature files), plus three `GB` → `United Kingdom`
  assertions.
- **Sequencing:** independent of every other open change. Nothing depends on it.
