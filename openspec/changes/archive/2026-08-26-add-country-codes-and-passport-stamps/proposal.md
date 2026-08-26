## Why

Every airport carries its country as free English prose — `Germany`, `United States of America` —
which is a display string masquerading as an identifier. Nothing can be grouped, joined or
counted on it reliably, a client cannot render a flag from it, and the one place the system
already receives a proper ISO 3166-1 alpha-2 code (the SkyLink import) deliberately throws it
away by resolving it to a name. Moving the stored value to the code turns country into something
the system can actually operate on, and makes the name a rendering concern resolved from one
catalogue rather than a value copied into every row.

That identifier is also the precondition for the second half: a pilot's passport. The system
records which airports a pilot has visited but never which countries they have entered, so the
one milestone a pilot most wants to see — the first time they land somewhere new — is invisible.

## What Changes

**Part one — countries become codes**

- A country catalogue ships as checked-in reference data: alpha-2 code, canonical English name and
  continent, with the flag emoji derived from the code. It is read-only reference data, not a table.
- `GET /api/v1/country` lists the catalogue so clients can render names and flags without
  hard-coding them.
- **BREAKING** An airport's stored country becomes its alpha-2 code. Existing rows are migrated
  from name to code; the migration aborts rather than write a row it cannot map.
- **BREAKING** Every API response that exposes a country returns `{ code, name }` in place of the
  bare name — airports, the airports embedded in aircraft, flights and diversions, and the most
  visited airport in the lifetime statistics.
- An airport's country must be a code the catalogue knows. The ISO 3166-1 user-assigned ranges
  (`AA`, `ZZ`, `QM`–`QZ`, `XA`–`XZ`) are rejected: they are placeholders, not countries.
- The system gains an `antarctica` continent, so that Antarctica can sit in the catalogue like any
  other country and an airport on the ice can be recorded. Without it the catalogue would have had
  to omit an assigned country code, which is exactly what the catalogue rule forbids.
- The SkyLink import stops resolving the provider's code to a name and stores the code it was
  given, reversing the current curation rule.
- The cargo commodity catalogue's country sources and the passenger-name locale table are re-keyed
  from names to codes.

**Part two — a pilot's passport**

- Every arrival is recorded as a stamp: one row per landing, holding the country, the flight, the
  airport and the moment. Only the country the pilot lands in is stamped — a departure is not an
  entry — and the stamp follows a diversion to where the aircraft actually landed.
- `GET /api/v1/user/me/stats/countries` returns the passport: each country visited, with its
  visit count and first and last visit, ordered by when it was first unlocked.
- `GET /api/v1/user/me/stats/countries/{code}` returns the individual stamps for one country.
- The periodic statistics report countries first visited within a period alongside the airports and
  aircraft types they already report.
- Stamps are backfilled from flights already completed, so an existing pilot's passport is not
  empty on the day this ships.

## Capabilities

### New Capabilities

- `country-catalogue`: The canonical set of countries the system recognises — code, English name,
  continent and flag — the rule that an airport's country is one of those codes, and the endpoint
  that publishes the catalogue.
- `user-country-passport`: A pilot's record of countries entered — one stamp per arrival, the
  passport read grouped by country, the per-country stamp read, and the backfill of stamps from
  flights completed before the capability existed.

### Modified Capabilities

- `airport-data-curation`: reverses the requirement that an airport's country is always a full
  English name — it is now always an alpha-2 code, from a hand-curated airport and from the
  external provider alike — and re-points the "never invents a country" rule at code validation
  rather than name resolution.
- `cargo-commodity-catalogue`: the country tier of commodity source matching resolves against the
  departure airport's country code rather than its name.
- `user-lifetime-statistics`: the distinct-country count is computed over codes, and the most
  visited airport reports its country as a code and name.
- `user-periodic-statistics`: a period additionally reports the countries first visited within it.

## Impact

**Schema** — `airport.country` narrows to a two-character code; `user_stats_by_airport.country`
follows. The `Continent` enum gains an `antarctica` member. A new `user_country_visit` table
holds the stamps, unique on user and flight so a replayed completion event cannot stamp twice. Two data migrations: names to codes, and the stamp backfill
from completed flights joined against diversions.

**Modules** — a new `countries` module (reference data, model, one action). `airports` changes the
country it stores, validates and returns. `statistics` gains the stamp log, its arrival listener and
two read endpoints. `aircraft`, `flights` and `manifest` follow the response shape and the re-keyed
reference data.

**Core** — `core/utils/country-name.ts` and its spec are removed; the SkyLink client stops
converting the provider's code.

**Corrected in passing** — an airport imported from an `Antarctica/*` timezone was previously
recorded on the `oceania` continent, there being nowhere better to put it. It is now recorded on
`antarctica`.

**Clients** — the country shape change is breaking for the desktop and web clients: `country` is an
object, not a string. `GET /api/v1/country` is the replacement source for names and flags.

**Tests** — 245 country assertions across 41 feature files take the new shape; the airport seed's
six countries become codes.

**Deliberately unchanged** — `airport.continent` keeps its own stored value rather than deriving
from the catalogue, because a country that spans continents (RU, TR) would otherwise contradict the
airport's actual location.
