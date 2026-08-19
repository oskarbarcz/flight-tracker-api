## Why

The app knows how many passengers a flight carries — one integer on the loadsheet — and
nothing else about them. There is no cabin, no seat, nobody in it. A pilot cannot see the
aircraft they are flying as a cabin, and the tracking dashboard has nothing to draw.

AeroLOPA publishes 1601 real cabin layouts with per-seat geometry, ratings and written
advice, and the provider function that reads them already exists. What is missing is
everything on this side: a local mirror of that catalogue, a way to say which layout an
aircraft actually has, and a passenger list seated against it.

The mirror has to be local and versioned rather than fetched per request for three
reasons. AeroLOPA publishes no change signal at all — no `lastmod` in the sitemap, so the
only way to notice a revised layout is to refetch its full payload — which makes live
lookups both slow and impossible to invalidate. Layouts do change, and a completed flight's
seating must not change with them. And the catalogue cannot be joined to our fleet
automatically: AeroLOPA is keyed by airline plus cabin configuration with no registration
index, so 26% of airline/type pairs resolve to more than one layout and the choice is a
judgement call. Assignment is therefore deliberately manual.

## What Changes

- **Mirror the layout catalogue.** Sync the 1601-entry index from the provider's
  `/aerolopa/layouts` into a local `layout` table, on an operations-triggered request.
  Layouts that vanish upstream are retired, never deleted, because aircraft and flights
  reference them.
- **Collapse the deck split.** AeroLOPA publishes each double-deck aircraft as *two*
  layouts — `lh-74h-m` and `lh-74h-u` — with separate canvases and seat counts that are
  each only half the aircraft. These are merged into one layout carrying a deck per seat,
  so a 747-8 is one 364-seat cabin rather than two unrelated 332- and 32-seat ones.
- **Store seat data, versioned.** A layout's full seat map is fetched the first time it is
  needed and stored as an immutable version. Re-syncing is an operations action; a new
  version is written only when the payload's content hash actually changes.
- **Assign a layout to an aircraft, by hand.** A dedicated endpoint sets
  `Aircraft.cabinLayout`, with suggestions ranked by the aircraft's operator and type. No
  automatic matching, and no restriction against borrowing another airline's layout.
- **Build a passenger manifest per flight.** When operations releases a flight to the
  pilot, the flight pins the layout version it was seated against and a manifest is
  generated from the preliminary loadsheet's passenger count, distributed across cabins in
  proportion to their size. Passengers carry a realistic name, a PNR, and a seat.
- **Reconcile the manifest against the final loadsheet.** Finishing boarding reconciles
  per cabin class: surplus passengers become no-shows and are kept on the record, shortfalls
  are filled with new passengers. Everyone who stays keeps their name, seat and PNR.
- **Mark some passengers as needing special service.** Roughly 15% of a manifest carries an
  IATA SSR code — `WCHR`, `UMNR`, `INFT` and friends — so the cabin view has something to
  distinguish.
- **Reject a loadsheet that will not fit.** A passenger count exceeding the assigned
  layout's seat capacity is rejected as unprocessable, at both release and boarding
  completion.

An aircraft with no layout assigned keeps working exactly as it does today: it releases,
boards and flies, with no manifest and no capacity check. Ten of the twenty-seven seeded
aircraft are in that state deliberately, so the path stays covered.

## Capabilities

### New Capabilities

- `cabin-layout-catalogue`: the local mirror of AeroLOPA's layout index — synchronisation,
  the deck-pair collapse, retirement of vanished layouts, and reading the catalogue.
- `cabin-layout-versions`: immutable versioned seat data per layout — lazy first fetch,
  content-hash-gated re-sync, and the per-deck coordinate spaces seats belong to.
- `aircraft-cabin-assignment`: assigning a layout to an aircraft by hand, and the
  suggestions offered while doing it.
- `flight-manifest`: pinning a layout version to a flight at release, generating seated
  passengers from the loadsheet, and reading the manifest.
- `manifest-reconciliation`: reconciling a manifest against the final loadsheet, per cabin
  class, and the no-show records that result.
- `manifest-special-services`: the SSR codes carried by a minority of passengers.

### Modified Capabilities

- `aircraft-management`: an aircraft gains a nullable assigned cabin layout, surfaced on
  aircraft reads.
- `flight-fuel-planning`: the loadsheet gains an optional per-cabin-class passenger
  breakdown, and its passenger count is now rejected when it exceeds the aircraft's seat
  capacity.

## Impact

- **API**: new endpoints for catalogue sync and listing, layout read, cabin assignment and
  removal, manifest read (filterable by passenger status). `PATCH`/`POST` on aircraft are
  untouched — assignment is its own request.
- **Behaviour change for existing callers**: `mark-as-ready` and `finish-boarding` gain a
  422 when the passenger count exceeds seat capacity, but only for aircraft that have a
  layout. The `finish-boarding` Swagger example of 366 passengers is inconsistent with any
  narrowbody layout and is corrected.
- **Schema**: `layout`, `layout_version`, `layout_deck`, `layout_seat`, `flight_passenger`;
  `aircraft.cabinLayout`; `flight.cabinLayout` and `flight.cabinLayoutRevision`. No JSON
  snapshot of seats is stored on the flight — the pinned version is referenced instead,
  which makes permanent retention of `layout_version` rows an invariant.
- **Provider client**: `AerolopaClient` gains `listLayouts()`; `listConfigurations()` is
  removed, being the same question asked worse. The vendored `aerolopa.openapi.json` is
  brought up to date with `/aerolopa/layouts`, `Layout` and `LayoutIndex`, and the
  hand-written types follow it.
- **Reference data**: `airframes.json` gains an `iataType` per entry, since our aircraft
  carry ICAO designators (`A20N`) and AeroLOPA keys on IATA ones (`32N`). Without it the
  assignment form cannot pre-filter by type.
- **Dependencies**: a faker library, as a production dependency, since names are generated
  at runtime. Locale is derived from the operator's first hub airport's country, falling
  back to its continent.
- **Errors**: `LayoutNotFoundError` (404), `LayoutRetiredError` (409),
  `SeatCapacityExceededError` (422), `CabinLayoutNotAssignedError` (404 on manifest reads).
- **Tests**: unit specs for the deck collapse, the content hash, the proportional
  distribution and the reconciliation arithmetic; features for sync, assignment, manifest
  generation and reconciliation. Manifest assertions match on shape and counts rather than
  whole bodies, because generated names, seats and PNRs are random.
- **Mock fixtures**: `docker/mock/aerolopa.json` gains a `/aerolopa/layouts` expectation
  and real upstream seat maps for `aa-77w`, `de-321`, `kl-738`, `fi-752-1` and the
  `lh-74h-m`/`lh-74h-u` deck pair, since the merge cannot be tested convincingly against
  synthetic data.
