<!--
Each group is an independent, individually shippable unit (one GitHub issue). Groups run in
order: 2 needs 1, 3 needs 2, 4 needs 3, 5 needs 4, 6 needs 4. Every group carries its own
schema, migration, mock fixtures and tests. Group 7 is the Definition-of-Done applied inside
every group, not a separate issue.
-->

## 1. Layout catalogue (independent) — capability `cabin-layout-catalogue`

- [x] 1.1 Update the vendored `src/core/provider/aerolopa/aerolopa.openapi.json` with `/aerolopa/layouts`, `Layout` and `LayoutIndex` from the provider repo's contract
- [x] 1.2 Hand-add `AerolopaLayout` and `AerolopaLayoutIndex` to `type/aerolopa.types.ts` (no codegen; keep comment-free)
- [x] 1.3 Add `listLayouts()` to `AerolopaClient`; delete `listConfigurations()` and `AerolopaConfigurationIndex`/`AerolopaConfiguration` if unreferenced
- [x] 1.4 Unit spec the client method: URL shape, auth header, error mapping
- [x] 1.5 Add a `/aerolopa/layouts` expectation to `docker/mock/aerolopa.json`; restart `aerolopa-mock`
- [x] 1.6 Migration: `layout` table (id PK = base slug, airlineIata, aircraftIata, variant, sourceSlugs, firstSeenAt, retiredAt)
- [x] 1.7 New `cabin-layouts` module: repository, module wiring, `model/error/*.error.ts` with `LayoutNotFoundError`
- [x] 1.8 Deck-collapse function + unit spec: complete pair merges, orphan does not, ordinal variant untouched, variant ending in `m`/`u` without a sibling untouched
- [x] 1.9 `SyncLayoutCatalogueCommand`: upsert, retire absent, un-retire returning, count created/retired/skipped
- [x] 1.10 `POST /api/v1/cabin-layout/sync` action, `@Role(UserRole.Operations)`
- [x] 1.11 `ListCabinLayoutsQuery` + `GET /api/v1/cabin-layout` with airline, aircraft type and retired filters, paginated; `GetCabinLayoutQuery` + `GET /api/v1/cabin-layout/:id` (catalogue entry only; seats arrive in group 2)
- [x] 1.12 Register every handler in module `providers` and every action in `controllers`
- [x] 1.13 Feature: `features/cabin-layout/catalogue.sync.feature` and `catalogue.list.feature` — sync, idempotent re-sync, retirement, un-retirement, skipped count, RBAC (ops/cabin-crew/unauthorised)

## 2. Versioned seat data (needs 1) — capability `cabin-layout-versions`

- [x] 2.1 Migration: `layout_version` (layoutId, revision, contentHash, lastUpdated, fetchedAt, totalSeats, rawPayload), `layout_deck` (versionId, deck, sourceSlug, canvas, assets, cabins), `layout_seat` (deckId, designator + geometry + cabin + rating + windowStatus + comments), unique `(deckId, designator)`
- [x] 2.2 Content-hash function stripping asset URL query strings + unit spec proving a rotated `?v=` is not a change
- [x] 2.3 Deck merge on fetch: one or two source slugs → one version with per-deck canvas/assets/cabins, `totalSeats` summed; unit spec against the real `lh-74h` pair (332 + 32 = 364, no designator collision, two canvases)
- [x] 2.4 `EnsureLayoutVersionCommand`: lazy first fetch, store nothing on provider failure
- [x] 2.5 `RefreshLayoutCommand`: refetch, compare hash, add a version only on change; report changed/unchanged
- [x] 2.6 `GetCabinSeatMapQuery` returning the newest revision with decks and seats; `GET /api/v1/cabin-layout/:id/seat-map`, lazy-fetching via `EnsureCabinLayoutVersionCommand` (kept off `/:id`, which stays the catalogue entry, so its body remains assertable)
- [x] 2.7 `POST /api/v1/cabin-layout/:id/refresh` action, `@Role(UserRole.Operations)`
- [x] 2.8 Mock: real upstream seat maps for `aa-77w`, `de-321`, `kl-738`, `fi-752-1`, `lh-74h-m`, `lh-74h-u`
- [x] 2.9 Feature: `features/cabin-layout/layout.seat-map.feature`, `layout.refresh.feature` — lazy fetch on first read, unchanged refresh writes no version, dual-deck totals and both canvases, RBAC. Seat _arrays_ are asserted as `@any` (an existing deep-compare matcher) because the smallest real cabin is 180 seats; every other field, including per-deck canvas, cabin specs and summed seat counts, is asserted exactly, and seat-level mapping is covered by `layout-version.spec.ts`
- [ ] 2.10 Not covered by a feature: "changed refresh adds a revision". It needs the provider to return _different_ seat data for one slug, which the mockserver fixture cannot do without becoming order-dependent. Hash-gating is unit-tested in `layout-version.spec.ts`; revisit if mockserver `times`-based expectations prove safe

## 3. Aircraft cabin assignment (needs 2) — capability `aircraft-cabin-assignment`

- [x] 3.1 Add `iataType` to all 212 entries of `src/modules/airframes/data/airframes.json`; extend `Airframe` model + `airframes.spec.ts` coverage
- [x] 3.2 Migration: `aircraft.cabinLayout` nullable string
- [x] 3.3 `AssignCabinLayoutCommand` + `RemoveCabinLayoutCommand`; `PUT`/`DELETE /api/v1/aircraft/:id/cabin-layout`, `@Role(UserRole.Operations)`
- [x] 3.4 `SuggestCabinLayoutsQuery` ranking operator+type, then operator, then type; `GET /api/v1/aircraft/:id/cabin-layout/suggestions`
- [x] 3.5 Extend aircraft read models with the assigned layout, current revision, retired flag and mismatch flag
- [x] 3.6 Assert the aircraft create/edit DTOs reject or ignore a cabin layout field
- [x] 3.7 Seed: assign `aa-77w`, `de-321`, `kl-738`, `fi-752-1`; leave AF and LH tails unassigned
- [x] 3.8 Feature: `features/aircraft/cabin-layout.assign.feature` — assign, replace, remove, unknown layout 404, foreign-airline assignment flagged not refused, suggestions ranked, suggestions empty, RBAC

## 4. Manifest generation (needs 3) — capability `flight-manifest`

- [x] 4.1 Migration: `flight.cabinLayout`, `flight.cabinLayoutRevision` nullable; `flight_passenger` (flightId, designator, name, pnr, cabin, status, ssr nullable), unique `(flightId, designator)`
- [x] 4.2 Add the faker dependency (production); locale resolution from operator hub → `Airport.country` → locale, falling back to `Operator.continent`; unit spec the fallback chain
- [x] 4.3 PNR generator: six uppercase alphanumerics, roughly one in five shared; unit spec
- [x] 4.4 Proportional distribution function + unit spec: remainder to largest cabins, sums exactly, full load fills every seat
- [x] 4.5 Seat allocation: random within cabin, no seat twice
- [x] 4.6 Hook `mark-as-ready`: pin layout + revision, generate the manifest, skip entirely when no layout assigned
- [x] 4.7 `SeatCapacityExceededError` (422) in `mark-as-ready` when the preliminary count exceeds capacity; skip when no layout
- [x] 4.8 `GetFlightManifestQuery` + `GET /api/v1/flight/:id/manifest`, readable by operations and the flight's captain; `CabinLayoutNotAssignedError` when the aircraft has none
- [x] 4.9 Correct the `finish-boarding` Swagger example, which uses 366 passengers against a narrowbody
- [x] 4.10 Feature: `features/flight/manifest.get.feature` — release generates, seats distinct, proportional per cabin, no-layout release succeeds with no manifest, over-capacity 422, captain reads own flight, RBAC. Assert on shape, counts and invariants, not whole bodies

## 5. Manifest reconciliation (needs 4) — capability `manifest-reconciliation`

- [x] 5.1 Add the optional per-class passenger breakdown to `Loadsheet`, validated to sum to `passengers`
- [x] 5.2 Seat-capacity check on loadsheet submission; skip when the aircraft has no layout
- [x] 5.3 Reconciliation function + unit spec: per-class surplus → no-shows, shortfall → new passengers, survivors untouched, total-only loadsheet distributes proportionally first
- [x] 5.4 Hook `finish-boarding`: reconcile, and reject over-capacity final counts as 422
- [x] 5.5 Status filter on the manifest endpoint (`?status=boarded|no_show`)
- [x] 5.6 Feature: `features/flight/manifest.reconcile.feature` — fewer produces no-shows, more adds, unchanged is a no-op, survivors keep seat/name/PNR, class shift reconciles both ways, no-show seat not reused, filters work
- [x] 5.7 Seed the manifest fixtures the features read: cabin layout versions assembled from the provider fixtures (`aa-77w`, `de-321`, `lh-74h`), cabins on the AA and LH fleets, seven Condor/Air France fixture flights, and a generated manifest for every released flight — 22 of 35 flights now carry one
- [ ] 5.8 Not covered by a feature: "reconciliation leaves survivors untouched". Asserting it end to end needs the manifest remembered across two requests, which the step vocabulary deliberately cannot do; `planReconciliation` only ever returns designators to flip and free seats to fill, and that is unit-tested in `manifest-generation.spec.ts`

## 6. Special service requests (needs 4) — capability `manifest-special-services`

- [ ] 6.1 Curated SSR code list (`INFT`, `WCHR`, `WCHS`, `WCHC`, `UMNR`, `BLND`, `DEAF`, `MAAS`, `PETC`) as a domain enum
- [ ] 6.2 Assign a code to roughly 15% of generated passengers, at most one each; unit spec the distribution
- [ ] 6.3 Report the code on manifest reads; preserve it across reconciliation
- [ ] 6.4 Feature: `features/flight/manifest.special-services.feature` — majority uncoded, codes are curated values, one code per passenger, infants occupy a seat, occupied seats equal boarded count, codes survive reconciliation

## 7. Definition of done (applied inside every group)

- [ ] 7.1 `docker compose exec app npm run lint` and `npm run typecheck` clean
- [ ] 7.2 `docker compose exec app npx jest --runInBand` green
- [ ] 7.3 `docker compose exec app npm run test:functional` green
- [ ] 7.4 `docker compose exec app npm run format:fix`, reverting the three feature files repo-wide Prettier always churns
- [ ] 7.5 New handlers registered in module `providers`, new actions in `controllers`
- [ ] 7.6 Errors are typed classes extending a `DomainError` category, defined in `model/error/*.error.ts`
- [ ] 7.7 Swagger documented, with no descriptions that merely restate the status or type
- [ ] 7.8 RBAC covered for operations, cabin crew and unauthenticated on every new endpoint
- [ ] 7.9 `prisma db push` applied to the dev database and the migration committed
