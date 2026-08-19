# Design — Passenger Accommodation

## Context

AeroLOPA publishes cabin layouts for 1601 airline/aircraft configurations. The provider
function in the sibling `mypreflight-aerolopa-provider` repo already exposes two operations
we need: `/aerolopa/layouts` returns the whole index from a single sitemap read, and
`/aerolopa/seatmap?slug=<id>` returns one layout's full seat map. This change builds
everything on the API side of that boundary.

The upstream data was measured directly against `www.aerolopa.com` before this design was
written. The numbers and irregularities below are observed, not assumed, and several of them
contradict what the payload's own field names suggest.

### Measured shape of the catalogue

```
1601 layouts   223 airlines   237 type codes   1203 (airline, type) pairs
 309 / 1203 pairs are ambiguous ......... 25.7%
 707 / 1601 layouts sit on such a pair .. 44.2%
```

Both percentages describe the same fact from different sides; the second is the one that
matters when picking a layout for a specific aircraft, because a pilot's aircraft is more
likely than not to be one of the contested ones.

### The slug is not `(airline, type, ordinal)`

The identifier looks structured and is not. Observed forms:

```
af-332              airline + type only
af-359-1 / -2 / -3  ordinal discriminator
af-77w-48j          discriminator encodes a cabin count (48 business seats)
af-77w-leisure      discriminator is a product name
af-a320-euro        type segment is "a320", not "320" — differs by airline
lh-35p / lh-35s     the discriminator is folded into the type segment
xx-…-132cm          discriminator is a seat pitch
xx-…-1971-m         discriminator is a retro-livery year
```

Consequences: the type segment is AeroLOPA's own string and cannot be treated as a
dependable IATA type code, and the discriminator cannot be presented as an ordinal because
frequently it is not one. Both feed the decision to make assignment manual and to store the
discriminator verbatim.

### `-m` / `-u` are decks, not variants

71 layouts carry an `-m` or `-u` suffix, forming 35 complete pairs plus one orphan, and
every aircraft type involved is a double-decker (A380 and 747 families). Verified against
live data:

```
                    seats  cabins                     rows    canvas
lh-74h-m  main       332   F 8 · J 48 · W 32 · M 244   1–49    800 × 5239
lh-74h-u  upper       32   J 32                       81–88    800 × 2507
                     ───
              total  364   ← neither layout reports this
```

Three properties fall out of this and shape the data model:

- **Designators do not collide.** The upper deck starts at row 81 by industry convention,
  so a designator is unique across the whole aircraft. A seat's natural key can be its
  designator, which is what lets manifest rows reference a plain string.
- **The canvases differ.** The two decks are separate coordinate spaces; `x` and `y` are
  only meaningful relative to a deck. Merging seats into one list is therefore only safe if
  the canvas travels with the deck, not with the layout.
- **`isDualDeck` is true on both halves** and `totalSeats`/`seatCounts` are per-deck. Any
  aircraft-level total must be summed.

One layout whose discriminator legitimately ends in `m` or `u` is not a deck at all, which
is why detection requires **both siblings to exist** rather than a hardcoded list of
double-deck types. That test is data-driven and self-correcting.

### There is no upstream change signal

Zero of the 1601 layout URLs carry `<lastmod>`; `changefreq` is a blanket `monthly`. The
only revision markers live inside a seat map payload — a `lastUpdated` date and a `?v=`
cache-busting parameter on the asset URLs. Detecting a changed layout therefore costs a full
payload fetch of roughly 100 KB, and a complete sweep of the catalogue would be about 1601
requests and 160 MB.

This is the reason re-sync is a manual, per-layout operations action rather than a scheduled
job. It also means staleness must be legible: a layout's `lastUpdated` is surfaced wherever
the layout is read, because nothing else will reveal it.

### Fields the contract offers but the data does not fill

Verified across 473 real seats on two aircraft:

- `bookable` is true, `blocked` is false and `crewRest` is false on **every** seat. These
  three flags are in the contract and carry no signal, so nothing may be derived from them.
- `rating` is null on the large majority (142 of 180 on the A320neo). Null means "nothing to
  flag", not "average", and a seat can be unrated while still carrying comments.
- `pitch` and `recline` are display strings with inconsistent units — `29" to 30"` is a
  range, and business recline is `180°` while economy is `6"`. They are rendered, never
  parsed.
- Row numbers skip: the A320neo spans rows 1–32 but has 30 of them, with no row 13 and no
  row 17. A row count may never be inferred from the highest designator.
- Coordinates are jittered floats — one column reports x of 177.4 through 178.1 — so
  grouping seats by exact `x` finds 27 columns in a 3-3 cabin. Any column, row or aisle
  computation needs a tolerance.

## Goals / Non-goals

**Goals.** A local, versioned mirror of the catalogue that never breaks a historical
flight's seating. Manual assignment with useful suggestions. A believable seated passenger
list per flight, reconciled against the final loadsheet.

**Non-goals.** Automatic aircraft-to-layout matching. Synthesising layouts for aircraft
AeroLOPA does not cover — an unassigned aircraft simply has no cabin. Rendering: no cabin
drawing is produced here, only the data a client would draw from. Redistributing AeroLOPA's
artwork; the `assets` URLs are stored as given and not proxied or copied. Weight-and-balance
from seat positions, which is impossible anyway because canvas units have no mapping to
metres.

## Data model

### `layout` — one row per cabin configuration

The primary key is the base slug, with the deck suffix removed when and only when both deck
siblings exist: `lh-74h-m` and `lh-74h-u` collapse to `lh-74h`, while an ordinal such as
`af-77w-4p-1` is left entirely alone. `airlineIata`, `aircraftIata` and `variant` are stored
verbatim as the provider parsed them. `firstSeenAt` and a nullable `retiredAt` record
presence in the index; a layout is never deleted, because aircraft and flights point at it.

### `layout_version` — immutable, one per observed revision

Carries `revision` (incrementing per layout), `contentHash`, the upstream `lastUpdated`, our
`fetchedAt`, the summed `totalSeats`, and the raw upstream payload for reprocessing. A new
row is written only when `contentHash` differs from the newest existing version.

**The hash excludes asset URL query strings.** The `?v=<epoch>` parameters rotate
independently of the cabin, and hashing them would manufacture versions that differ in
nothing a user can see.

**Versions are retained permanently.** Because a flight references a version rather than
copying its seats, pruning a version would erase a completed flight's seating. This is an
invariant, not a preference.

### `layout_deck` — one or two per version

Holds `deck` (`main` or `upper`), the `sourceSlug` it came from, that deck's `canvas`, its
`assets`, and its `cabins`. A single-deck aircraft is the degenerate case: one deck, `main`,
`sourceSlug` equal to the layout id.

### `layout_seat` — one per seat per deck

Geometry (`x`, `y`, `width`, `height`, `rotation`, `reversed`), `designator`, `cabin`,
`rating`, `windowStatus`, `color`, `seatProduct`, the three inert availability flags kept for
fidelity, and comments. Unique on `(deckId, designator)`.

### `aircraft.cabinLayout` — nullable slug

Named for the domain, not the relation, matching `Aircraft.type` which likewise holds a code
against a curated list rather than a uuid. Unlike `type` it does carry a foreign key to
`layout`, because the catalogue is a table: the database then refuses an assignment to a slug
nobody has catalogued, and the aircraft read joins the layout in one query. Null means no
cabin is known. The aircraft floats to the newest version of its layout; only flights pin.

Every aircraft endpoint in the module is operator-scoped, so assignment lives under
`/operator/:operatorId/aircraft/:aircraftId` rather than the shorter path first sketched
above.

### `flight.cabinLayout` + `flight.cabinLayoutRevision` — pinned at release

Set when the flight is released to the pilot, and never afterwards. A re-sync that produces
version 4 leaves every flight pinned at version 3 untouched.

### `flight_passenger` — one row per occupied seat

`flightId`, `designator`, `name`, `pnr`, `cabin`, `status` (`boarded` or `no_show`), and a
nullable `ssr`. It references the designator string rather than a `layout_seat` id, so seat
rows may be replaced by a future version without touching any manifest.

## Key algorithms

### Deck collapse (during index sync)

Group index entries by the slug with a trailing `-m`/`-u` removed. Where a group contains
both an `-m` and a `-u` member, emit one layout keyed on the stripped slug and record the two
source slugs. Where it does not — an orphan, or a discriminator that merely happens to end in
those letters — emit the entries unchanged, each as its own layout.

### Proportional distribution (during generation)

Given a total passenger count and the version's cabins, allocate to each cabin in proportion
to its share of the seats, distributing the rounding remainder to the largest cabins first so
the allocation sums exactly. Within a cabin, choose seats at random. A per-class breakdown on
the loadsheet, when present, replaces the proportional step and is used verbatim.

### Reconciliation (at boarding completion)

Compare the final count per cabin class against the current manifest. A surplus marks that
many randomly chosen `boarded` passengers as `no_show`; a shortfall generates that many new
passengers into free seats in the same cabin. No-shows keep their seat recorded and are never
deleted. Passengers who are neither added nor marked keep their name, seat and PNR unchanged.

### Name generation

A faker library, with locale chosen from the operator's first hub airport's country and
falling back to the operator's continent when the hub is unknown or the country maps to no
supported locale. `Operator` carries no country of its own, which is why the hub is the
route to one.

## Module ownership

The manifest is its own bounded context, not an extension of the flight: a `passengers`
module owns `flight_passenger`, the generation algorithms, the locale and name machinery and
the read endpoint. The flights module keeps the two pinned columns, because they are columns
of the flight, and publishes them over the bus — `PinFlightCabinLayoutCommand` to write the
pin and `GetFlightManifestContextQuery` to read pin, aircraft and captain together. Release
reaches the manifest the same way, by dispatching `GenerateFlightManifestCommand`. No module
touches the other's tables, which keeps release lean and leaves reconciliation and special
services (groups 5 and 6) with an obvious home.

The generator reads the cabin through the cabin-layouts module (`EnsureCabinLayoutVersion`
then `GetCabinSeatMap`), the airline through the operators module and the hub's country
through the airports module, all over the bus.

**Faker must stay on v9.** `@faker-js/faker` 10 ships ESM only, which the CJS runtime and
ts-node cannot load — the same trap as `jose` 6.

## API surface

The provider exposes each operation as its own function path — `/aerolopa/seatmap` and
`/aerolopa/layouts` — so the client is configured with the function **base** URL
(`AEROLOPA_FUNCTION_BASE_URL`) and appends the operation, rather than being pointed at a
single endpoint. This replaced the earlier `AEROLOPA_FUNCTION_URL`, which named the seatmap
path directly and could not reach the layout index.

```
POST   /api/v1/cabin-layout/sync                 ops    refresh the index
GET    /api/v1/cabin-layout                      auth   list/search, paginated
GET    /api/v1/cabin-layout/:id                  auth   catalogue entry only
GET    /api/v1/cabin-layout/:id/seat-map        auth   newest revision, decks, seats
POST   /api/v1/cabin-layout/:id/refresh          ops    refetch, version if changed
GET    …/operator/:operatorId/aircraft/:aircraftId/cabin-layout/suggestions  ops  ranked candidates
PUT    …/operator/:operatorId/aircraft/:aircraftId/cabin-layout             ops  assign
DELETE …/operator/:operatorId/aircraft/:aircraftId/cabin-layout             ops  unassign
GET    /api/v1/flight/:id/manifest               ops + captain   ?status=boarded|no_show
```

The manifest is its own endpoint rather than part of the flight body, because flight bodies
are cached and a manifest that changes at boarding completion would be served stale. The
flight body does not carry the pinned layout either, for the same reason.

A manifest read that finds no pin answers 404 with one of two messages: the aircraft has no
cabin layout, or the flight has not been released yet. Collapsing them would tell a client
its aircraft is uncatalogued when the flight is merely unreleased.

Seats sit behind `/:id/seat-map` rather than on `/:id` for the same reason in reverse: a
catalogue read is a small, assertable body used to browse and pick, while a seat map is 180 to
364 seats. Folding them together would make every catalogue read carry a payload nobody
browsing needs.

## Testing

Generated content is random, so manifest features assert on shape, counts and invariants —
every passenger has a distinct seat, seats belong to the pinned version, class totals match
the loadsheet — rather than on whole response bodies. This is a deliberate exception to the
usual full-body rule, which cannot apply to randomised output.

Seeds assign `aa-77w`, `de-321`, `kl-738` and `fi-752-1` to their matching aircraft; the AF
and LH tails are left unassigned so the no-layout path stays exercised. The mock carries real
upstream payloads for those four plus the `lh-74h` deck pair, because the deck collapse is
not meaningfully testable against synthetic geometry.

## Resolved decisions

- Decks are merged into one layout with the deck retained per seat, rather than exposing two
  layouts per aircraft — consumers see one coherent cabin, and seat totals sum correctly.
- A flight references a pinned version rather than copying seats into a JSON column, saving
  45–90 KB per flight at the cost of making version retention an invariant.
- Re-sync is manual per layout. A scheduled sweep was rejected on cost (1601 requests) and
  because scheduled work is disabled in local environments and deadlocks the functional
  suite's database reset.
- Assignment is unrestricted: another airline's layout may be chosen deliberately, since 10
  of 27 seeded aircraft have no exact match. Suggestions rank by operator and type, and do
  not filter.
- Historic and retro layouts are stored and returned like any other, flagged so a client can
  decide; they are not hidden server-side.
- Infants occupy a seat. Real lap-infant modelling would decouple the passenger count from
  seat capacity and require attaching infants to an accompanying adult, which is more
  fidelity than a faked manifest warrants.
- Reduced-mobility seating rules — such as keeping `WCHC` out of exit rows — are not
  enforced. Exit rows can only be inferred from `exit_row_recline` comments, which appear on
  the A320neo and are entirely absent on the A350, so enforcement would be silently partial.
- `listConfigurations()` is removed from the provider client rather than kept alongside
  `listLayouts()`.
