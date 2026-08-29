<!--
Five groups, each independently shippable. Dependencies: 2 needs 1 (the pair function).
Groups 1, 3, 4 and 5 are independent of each other. Group 5 is the repository-wide sweep and
is much the largest by file count, though every edit in it is one decorator.
-->

## 1. Segregation pairs are computable — capability `flight-cargo-manifest`

- [x] 1.1 `segregation.policy.ts`: `conflictingPairs(one, other)` returning every offending pair for two code lists, and `conflicts` reduced to asking whether that list is non-empty, so one rule table answers both questions
- [x] 1.2 `conflictingPairsWithin(codes)` for a single compartment's codes, reporting each unordered pair once and never pairing a code with itself
- [x] 1.3 Unit spec: a compartment with no clash, one clash, several clashes, the same clash reachable through two different code families, and a pair reported once rather than twice

## 2. The manifest reports the conflicts aboard (needs 1) — capability `flight-cargo-manifest`

- [x] 2.1 `SegregationAdvisory` on the manifest read model: compartment, deck, and the incompatible code pair, with Swagger descriptions
- [x] 2.2 Advisories computed per compartment in the cargo load query over loaded shipments only, so offloaded freight never raises one
- [x] 2.3 A flight whose airframe type carries no curated hold data reports none, since nothing has a compartment
- [x] 2.4 Seed: one fixture compartment deliberately carrying an incompatible pair, so the non-empty case is exercised rather than only asserted empty
- [x] 2.5 Feature: `features/flight/cargo-manifest.get.feature` — the seeded conflict reported in full, a generated manifest reporting none, and the uncurated type reporting none. The offloaded case shares the conflict fixture: a third unit carries an offloaded radioactive shipment in the same compartment as the live animals, which would clash if it still counted, so one body proves both that the conflict is reported and that offloaded freight is ignored

## 3. Closed-set strings publish their set — capability `api-contract-documentation`

- [x] 3.1 `shc` documented with the `SpecialHandlingCode` enum on both the cargo shipment entry and the notification's special load entry
- [x] 3.2 `commodity` documented with an identifier list derived from the loaded catalogue, so adding a commodity updates the contract by itself
- [x] 3.3 `holdVariant` documented with the variant identifiers the curated data declares
- [x] 3.4 Audited the served document for string fields whose name suggests a set: 54 candidates, of which four are genuinely closed sets this system controls and now publish them — the hold layout's airframe type, the hold variant on both the assign request and the aircraft read model. `ercCode` is constructed from the drill chart rather than drawn from a list, so it publishes its pattern instead. The rest were left alone with reason: ICAO and IATA codes are open-world identifiers, airframe designators live in the database rather than in code so a decorator cannot enumerate them, and cancellation and rejection reasons are free text
- [x] 3.5 Unit spec over the derived lists: every catalogue entry appears, the list is non-empty, and it matches the dataset exactly

## 4. Hold data covers the operated fleet — capability `aircraft-hold-layout`

- [x] 4.1 Curate `B788`, the one airframe type in the fleet with no hold data, following the existing template-and-overrides shape
- [x] 4.2 Dataset spec: every airframe type an aircraft is recorded as resolves to a layout, so the catalogue cannot fall behind the fleet again
- [x] 4.3 `B788` now serves a five-compartment layout with 28 LD3 positions, and the layout-list scenarios were updated to expect it
- [x] 4.4 Curating the last fleet type would have removed the degraded path's only fixture, so a `B762` aircraft was seeded to carry the three degraded-path flights and the coverage guard names that one designator as a deliberate exemption — with its own assertion that it stays uncurated, since a fixture that quietly became curated would stop proving anything

## 5. Nullable values publish their type — capability `api-contract-documentation`

- [x] 5.1 A script that reads the served document and lists every property that is `object` with neither `properties` nor a schema reference, grouped by schema — the worklist, and later the proof
- [x] 5.2 Cargo and notification schemas (23 properties): give each nullable primitive its type
- [x] 5.3 `heaviestPiece`, the notification's `changes` and its repositions became named classes, as did the shipment's dangerous goods and cold chain blocks, which were typed only as opaque objects before
- [x] 5.4 Flights, emergencies, delays and loadsheets (about 25 properties)
- [x] 5.5 Aircraft, airframes and cabin layouts (about 20 properties)
- [x] 5.6 Airports — terminals, gates, parking positions, runways and the OSM proposal (about 30 properties)
- [x] 5.7 Operators, rotations, users and statistics (about 15 properties)
- [x] 5.8 The shared error response DTOs in `src/core/http/response` (about 10 properties), which every endpoint documents
- [x] 5.9 Re-run the script: the count is zero
- [x] 5.10 `features/api/api-document.feature` reads the served document and asserts no response property is an untyped object, plus the size of each published set, so both halves of the capability are guarded against drift

## 6. Definition of Done (applied inside every group)

- [x] 6.1 Swagger descriptions on every new field; no description that merely restates the type
- [x] 6.2 No code comments; domain enums PascalCase and cast at the boundary
- [x] 6.3 `npm run lint`, `npm run format`, the unit suite and the functional suite green
- [x] 6.4 The served document builds and every touched schema resolves
