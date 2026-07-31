## Context

See proposal.md § Why for the motivation.

`Airport.country` is a plain `String` with no format constraint. The seed
(`prisma/seed/resource/airports.seed.ts`) fills it with full country names —
`Germany`, `Poland`, `United States of America`, `Iceland`. SkyLink's airport payload
(`SkylinkAirportResponse.country`) is an ISO 3166-1 alpha-2 code, and
`ImportAirportByIcaoHandler.toRequest` copied it straight into the same field.

Two things read that provider payload: the import command
(`ImportAirportByIcaoCommand`, reached from the SimBrief flight-creation flow) and
`GET /api/v1/skylink/airport/:iataCode`, an Operations-gated passthrough whose
response DTO documented `country` as "Two-letter code", example `DE`. Both go through
`SkyLinkClient`, whose two public methods (`getAirportByIataCode`,
`getAirportByIcaoCode`) funnel into one private `findAirportBy`.

On the second defect, the relevant existing shape is that the airport model is one
class reused three ways: `Airport` is the response, `CreateAirportRequest =
OmitType(Airport, ['id'])`, and `UpdateAirportResponse = PartialType(...)`. Airport
reads (`GET /api/v1/airport`, `GET /api/v1/airport/:id`) are `@SkipAuth()`; every
airport write is `@Role(UserRole.Operations)`. `AirportListFilters` already carries
one optional enum filter (`continent`) wired straight into the Prisma `where`. Two
places project a full airport — `selectAirport` in the airports repository and the
airport select inside `flights.repository.ts` — plus a deliberately trimmed one in
`diversion.repository.ts` that omits `shape`.

Runtime is Node 24 with full ICU, so `Intl.DisplayNames` region data is available
without a dependency.

## Goals / Non-Goals

**Goals:**

- One place where a provider country code becomes a country name, so no future
  consumer of the provider payload can reintroduce the mismatch.
- A resolution function that is total and idempotent: any input produces an output,
  and re-running it on its own output is a no-op. This is what makes it safe to apply
  at a boundary that may one day see already-normalised data.
- An airport grade that is cheap to read (present on every airport response) and
  cheap to act on (filterable), added without a new endpoint.

**Non-Goals:**

- Backfilling airports already imported with a code. The dev database is reseeded,
  and the production data set is small enough to fix by hand through the existing
  update endpoint if it ever matters.
- Localising country names. The API is English-only; `Intl.DisplayNames` is asked for
  `['en']` explicitly rather than following a locale header.
- Deriving the grade from the data held (see decision 5).
- Automatically enriching a `low` airport — fetching its boundary from OpenStreetMap,
  or its runways from anywhere. This change only makes the gap _visible_.
- Any grade semantics beyond ordering by name: nothing in the system behaves
  differently for a `flagship` airport.

## Decisions

**1. Resolve the country code at the provider boundary, not in the import command.**
`SkyLinkClient.findAirportBy` returns `{ ...airport, country: toCountryName(airport.country) }`,
so the normalised value is what every caller sees. The alternative — fixing
`ImportAirportByIcaoHandler.toRequest` — was the smaller diff but would have left
`GET /api/v1/skylink/airport/:iataCode` still emitting `DE`, i.e. the same field
meaning two different things depending on which endpoint you asked. Normalising at
the single point of entry makes "an airport's country is a name" an invariant of the
system rather than a property of one code path.
_Alternative considered:_ normalising on write, inside the repository. Rejected — the
repository would then be validating a field whose only bad source is one provider,
and the passthrough endpoint (which never writes) would stay wrong.

**2. `Intl.DisplayNames` over a hand-maintained code→name table.** A literal map of
~250 entries is code that rots: new codes, renamed countries, and typos that nobody
notices until an airport shows up with a blank country. ICU already ships the data
and the runtime already has it. The cost is that ICU's wording is not always the
project's wording, which decision 3 handles.
_Alternative considered:_ the `i18n-iso-countries` package. Rejected — a dependency
for data the platform already carries.

**3. A tiny override map for project-canonical wording.** `COUNTRY_NAME_OVERRIDES`
currently holds exactly one entry: `US -> 'United States of America'`, because ICU
says "United States" and the seed says "United States of America". Consulted before
ICU. The map exists so that a future wording disagreement is a one-line change in an
obvious place rather than a reason to abandon ICU.

**4. Reject the ISO 3166-1 user-assigned ranges before consulting ICU.** ICU resolves
`ZZ` to "Unknown Region" and `XA` to "Pseudo-Accents" — plausible-looking strings
that would be persisted as an airport's country and then be very hard to
distinguish from real data. The check covers `AA`, `ZZ`, `QM`–`QZ` and `XA`–`XZ`, the
ranges ISO reserves for private use. Everything else unresolvable — wrong length,
unassigned code, a value that is already a name — is returned unchanged, which is
also what makes the function idempotent: `toCountryName('Germany')` is 7 characters,
so it fails the length check and comes back as-is.
_Alternative considered:_ `fallback: 'code'` and comparing the result to the input to
detect failure. Rejected — `fallback: 'none'` returning `undefined` is the explicit
signal, and it does not help with `ZZ`, which _does_ resolve.

**5. The grade is edited by hand, never derived from `shape`.** The obvious
implementation is a computed field: `shape === null ? low : high`. It was rejected
because the grade is meant to cover terminals, gates and runways as well as the
boundary — an airport can have a perfect polygon and no stands, which is not `high`
data — and because the three levels encode an editorial judgement (`flagship` means
"we have curated this to the standard we want everywhere") that no query can produce.
Consequence: the column can lie. An operations user can grade an empty airport
`flagship`. That is accepted, and one scenario pins it, because the alternative —
cross-field validation — is recorded as an open question rather than guessed at.

**6. Column named `dataQuality`, not `data_quality`.** The request said
`data_quality`, but every other column in `schema.prisma` is camelCase and there is
no `@map` convention in the file. Matching the schema beats matching the request's
incidental casing; the API field is `dataQuality` for the same reason.

**7. Three levels — `low`, `high`, `flagship` — as a Prisma enum with a DB default.**
An enum rather than a boolean, because "needs work / good / reference quality" is the
distinction operations actually draws, and rather than an integer score, because a
score invites arithmetic nobody defined. `@default(low)` in the database means the
migration needs no backfill, the seed needs no change, and the import command needs
no new field — a freshly imported airport is graded correctly by omission.
The domain enum is mirrored in `src/modules/airports/model/airport.model.ts`
alongside `Continent`, following the project rule that domain code never imports
enums from `prisma/client`.

**8. `dataQuality?: DataQuality` — optional on the model, always present in
responses.** Optional so `POST /api/v1/airport` need not supply it and the DB default
applies; because `CreateAirportRequest` and `UpdateAirportResponse` are derived from
`Airport` via `OmitType`/`PartialType`, both create-with-grade and edit-grade came
for free with no new endpoint and no new role. The column is `NOT NULL`, so responses
always carry a value despite the optional marker.

**9. Added to every select that projects an airport into a response.**
`selectAirport` (airports repository), the airport select in `flights.repository.ts`,
and the trimmed projection in `diversion.repository.ts` all gained
`dataQuality: true`. The diversion view was initially left out, on the reasoning that a
diversion is a routing decision — but that made the grade present on some exposed
airports and absent on others, which is a worse contract than either extreme, and the
functional suite caught it immediately. `dataQuality` is a small scalar, unlike the
`shape` polygon that projection still omits for weight.

**10. Filtering reuses the existing filter mechanism verbatim.** `dataQuality` sits
next to `continent` in `AirportListFilters` with `@IsEnum` + `@IsOptional`, and is
passed straight into the Prisma `where`. Prisma treats `undefined` as "no
constraint", so an absent filter needs no branch, and the two filters compose. The
validation-error shape for a bad value is whatever the global pipe already produces
for `continent`, which is why the feature file can assert the exact violation
message.

**11. Seed data left entirely alone.** Every seeded airport is `low`, including
Frankfurt, which has a full polygon, terminals and gates and is in truth the
project's `flagship` example. Grading the seed would have been editorialising inside
a fixture set that ~30 feature files assert against, and the two new scenarios that
need a non-`low` airport create that state themselves with a `PATCH` and then reset
the database. Reviewers should read seeded `low` as "ungraded", not as a claim.

## Risks / Trade-offs

- **[The passthrough endpoint's contract changed]** `GET /api/v1/skylink/airport/:iataCode`
  returns a name where it returned a code, and its DTO description/example changed to
  match. Any client parsing that field as a code breaks. → Accepted: the endpoint is
  Operations-gated and exists to feed the import flow; the alternative (leave it
  wrong) is the bug this change is fixing. The type is unchanged, so nothing fails to
  deserialise.
- **[ICU wording drift]** A Node/ICU upgrade can change a country's display name, and
  a changed name would silently disagree with the seed's spelling for airports
  imported before the upgrade. → Mitigated by the unit test pinning six specific
  resolutions plus the `US` override; a drift breaks the test rather than the data.
  The override map is the fix when it happens.
- **[The grade can be wrong]** Nothing enforces that a `flagship` airport has any
  curated data, and nothing lowers a grade when data is deleted. → Accepted per
  decision 5; the field is a curation to-do list, not a data-integrity constraint. The
  open question below is the way out if it turns out to matter.
- **[Seeded airports are all `low`]** The grade is untested against a realistic
  distribution, and anyone reading the seed could conclude Frankfurt is poorly
  curated. → Accepted per decision 11.
- **[Very wide test diff]** ~170 `dataQuality` lines across 30 feature files, none of
  them interesting, because the Cucumber body matcher compares exact key counts. A
  mechanical change at that scale can hide a real edit. → Mitigated by the diff being
  purely additive in those files (one line per airport body) and by running the full
  suite; the three `GB` → `United Kingdom` edits are the only non-additive ones.

## Migration Plan

One forward migration,
`prisma/migrations/20260730120000_add_airport_data_quality/migration.sql`: create the
`DataQuality` type, then `ALTER TABLE "airport" ADD COLUMN "dataQuality" ... NOT NULL
DEFAULT 'low'`. No backfill — the default grades every existing row, which is the
intended reading for an ungraded airport. Rollback is `DROP COLUMN` + `DROP TYPE`,
losing only hand-assigned grades.

Country names are not backfilled: any airport already imported with a code keeps it
until someone edits it. Locally, `prisma db push` then a reseed produces a clean
state (`migrate deploy` fails with P3005 against the dev database).

## Open Questions

- Should `high`/`flagship` require a non-null boundary shape, rejected as a validation
  error otherwise? It would stop the most obvious way to make the grade lie, at the
  cost of ordering curation work (grade last, always) and of an asymmetry — the shape
  is only one of the four things the grade covers, so the rule would enforce a
  quarter of the definition. Deferred: adding the constraint later is a validation
  change on one endpoint, and it does not alter this change's specs, approach or task
  breakdown.
- Should the trimmed diversion projection also carry `shape`, for consistency with the
  full airport views? Left out deliberately — a boundary polygon is heavy and a
  diversion response has no use for it — but it does mean one exposed airport shape
  differs from the others by exactly that field.
