## Why

A flight's loadsheets are one JSONB column holding two nullable slots, `{ "preliminary": …,
"final": … }`. Every write rewrites the whole object, so updating the preliminary loadsheet
means reading the final one back and writing it out again to avoid destroying it — a rule the
`flight-fuel-planning` spec has to state explicitly because nothing in the storage enforces it.
Every read is `flight.loadsheets as unknown as Loadsheets`: a cast, not a guarantee.

The shape has drifted three times since the column was created in February 2025 — `fuel`
(#159), `passengersByCabin` (#246) and `passengerMass` (#283, last week) — and nothing
backfilled the rows already stored. Old flights genuinely have different key sets from new
ones, and the only reason the reads survive is that the three added keys happen to be optional
in the domain model. The next required field would break every historical row silently.

What is lost by keeping it as JSON is more than tidiness. A loadsheet is a document that gets
revised: operations plan the load, revise it as the picture firms up, and the crew accept the
last revision — or amend it — as the final figures at the end of boarding. The column stores
one preliminary loadsheet and cannot say who wrote it, when, or what it replaced. Nothing about
a loadsheet is queryable: not "which flights are over 200 passengers", not "how did this
flight's cargo figure change between planning and departure".

## What Changes

- **A loadsheet becomes a row, not a JSON key.** `flight_loadsheet` holds one row per
  loadsheet with every figure as a typed column — crew, passengers, cargo, payload, zero fuel
  weight, the full fuel breakdown, and a passenger count per cabin. No loadsheet data remains in
  JSON, and no loadsheet needs a join to be read.
- **Preliminary loadsheets are append-only revisions.** Each update writes a new row with the
  next revision number, recording who issued it and when. The flight's current preliminary
  loadsheet is its highest revision. Nothing is overwritten and nothing is lost.
- **A flight has at most one final loadsheet**, created when boarding finishes, enforced by the
  schema rather than by convention. Because a preliminary loadsheet can only be written while
  the flight is `created` and the final one only at `boarding_started`, every preliminary
  revision necessarily precedes the final — the ordering is total and needs no extra bookkeeping.
- **BREAKING — `loadsheets` leaves the flight read.** `GET /flight/{id}` and `GET /flight` no
  longer carry a `loadsheets` object. Both responses shrink; the list read stops shipping a full
  loadsheet per flight.
- **BREAKING — loadsheets are read from their own endpoint.** `GET /flight/{id}/loadsheet`
  returns the flight's loadsheets as an array in issue order, each carrying its kind, revision,
  who issued it and when. `?type=preliminary` narrows it to the revision history;
  `?type=final` returns an array of at most one. A flight with no loadsheets returns an empty
  array — the state a client renders as "no loadsheet information for this flight".
- **BREAKING — flight creation takes a flat `loadsheet`.** `POST /flight` and the SimBrief
  import replace the `loadsheets: { preliminary }` envelope with an optional `loadsheet`, which
  becomes revision 1 when supplied.
- **The schema migration only creates the tables; the data is moved by hand.** The migration
  adds `flight_loadsheet` and nothing else, so `flight.loadsheets` and every row in it survive
  the deploy untouched. Two scripts run by hand afterwards: `data.sql`, which copies the stored
  loadsheets across and is safe to re-run, and `test.sql`, which reports what the copy recognises
  and — run again after — reconciles every migrated figure against the JSON it came from. Only
  once that copy is confirmed does a second migration drop the column, and it refuses to run
  where the copy never happened.
- **A stored loadsheet missing any figure the domain requires is not copied**: that flight ends
  up with no loadsheet rather than with an invented one, which the new read reports honestly as
  an empty array. `test.sql` names those flights and the figures that disqualified them.

## Capabilities

### New Capabilities

- `flight-loadsheets`: what a loadsheet is, that a flight carries an ordered history of
  preliminary loadsheets and at most one final one, who may write each, how they are read back,
  and the rule that a flight needs a preliminary loadsheet before it can be marked ready.

### Modified Capabilities

- `flight-fuel-planning`: three requirements are written against the JSON shape and the flight
  read. The fuel breakdown is no longer "persisted on `loadsheets.preliminary.fuel` and returned
  on the flight read" — it is persisted on the loadsheet row and returned by the loadsheet read.
  And "editing the preliminary loadsheet preserves the final loadsheet" stops being a rule the
  write flow must remember: separate rows cannot overwrite each other, so the requirement is
  restated as the property it now is.

## Impact

- **API**: `GET /api/v1/flight/{flightId}/loadsheet` is new, with the audience that already
  reads the flight. `loadsheets` is removed from `GET /flight/{flightId}` and `GET /flight`.
  `POST /flight` and `POST /flight/simbrief` take `loadsheet` in place of `loadsheets`.
  `POST /flight/{flightId}/finish-boarding` is unchanged — the crew still send the final
  loadsheet in full, which is what a client that pre-fills it from the last preliminary revision
  sends anyway. `PATCH
  /flight/{flightId}/loadsheet/preliminary` keeps its contract unchanged — what the caller
  sends still means "this is the preliminary loadsheet now"; that it now appends a revision is
  the system's business, not the caller's.
- **Schema**: one table, `flight_loadsheet` (kind, revision, the crew and weight figures, the
  fuel breakdown, a nullable passenger count per cabin, issuer and issue time), cascade-deleted
  with the flight. `flight.loadsheets` survives the first migration unread — keeping its
  `NOT NULL DEFAULT`, so flights created in between still satisfy it without the application
  knowing it exists — and is dropped by a second migration once the copy has been made.
- **Domain**: a `LoadsheetKind` domain enum (`Preliminary`, `Final`), PascalCase keys, cast at
  the boundary. The `Loadsheets` wrapper class disappears; `Loadsheet` stays as the write model
  and gains a read model carrying its revision metadata. `loadsheet.policy` is unchanged — it
  validates a loadsheet's figures against each other and knows nothing about storage.
- **Code**: eight call sites read `flight.loadsheets` today — mark-as-ready, finish-boarding,
  update-preliminary, declare-emergency, the manifest generation listener, the two Discord
  loadsheet listeners and the boarding notification. Each moves to a query for the flight's
  current loadsheet. `declare-emergency` currently computes souls on board through
  a non-null assertion on the preliminary loadsheet; with legacy flights that may now have none,
  it needs a real error instead of a crash.
- **Cache**: the new read is not cached. The per-flight cache key is built from the flight id
  and a resource name and ignores the query string, so caching `?type=preliminary` and
  `?type=final` under one key would serve one as the other. Making the key query-aware is a
  change to a shared interceptor and does not belong in this change.
- **Seeds**: 31 seeded flights carry loadsheet JSON and move to seeded rows. Feature fixtures
  depend on those figures, so the seeded values are preserved exactly.
- **Tests**: features for the new read across roles and both filters, for accepting the last
  preliminary as final, for the revision history growing on each update, and for a flight with
  no loadsheets. Existing features that assert `loadsheets` in a flight response — 33 feature
  files touch loadsheets, with the flight read, create and update-preliminary files carrying
  most of it — move their assertions to the loadsheet read.
- **Not in scope**: no change to how loadsheet figures are validated, to what
  `POST /finish-boarding` accepts, to the roles that write them, to manifest or NOTOC generation, or to the Discord message format. A loadsheet cannot
  be deleted or amended after the fact — a correction is a new revision, and the final one is
  written once.
