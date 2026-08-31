# Design — Extract flight loadsheets

## Context

See proposal.md — Why. This section records what was verified in the code and the schema before
the design was written, because three findings decide the approach.

**The column is `NOT NULL DEFAULT '{"preliminary":null,"final":null}'`.** Added by
`20250208202445_add_flight_loadsheets`, never altered since. So every flight row has the
envelope; what varies is what is inside the two slots. There is no row where `loadsheets`
itself is null, and the backfill does not have to consider one.

**Four key sets exist in the stored data.** The loadsheet model has gained keys three times
since February 2025 and no migration ever touched the rows already written:

```
written between                     keys inside a loadsheet
─────────────────────────────────   ────────────────────────────────────────────────
Feb 2025 – #159                     flightCrew, passengers, cargo, payload,
                                    zeroFuelWeight, blockFuel
#159  (advanced fuel data)          + fuel
#246  (manifest follows loadsheet)  + passengersByCabin
#283  (planned passenger mass)      + passengerMass
```

The three added keys are optional in the domain model, which is the only reason the reads
have not broken. The six original keys are required and are present on every non-null
loadsheet ever written by application code — but the backfill must not assume it, because
nothing in the database has ever enforced it.

**The local and test databases are built by `prisma db push --force-reset` from
`schema.prisma`, not by replaying migrations.** `database:seed` and `database:reset` both push;
only `database:migrate` runs `prisma migrate deploy`. Two consequences drive the design: a
constraint that cannot be expressed in `schema.prisma` would exist in production and nowhere
else, and the backfill SQL is never exercised by the test suite and has to be verified against
representative data by hand.

## Goals / Non-Goals

**Goals:**

- No loadsheet data read from JSON, anywhere, after this change.
- The revision history is a fact of the schema, not a convention the write path maintains.
- "At most one final loadsheet" is enforced by the database.
- The backfill cannot fail on a row shape it did not expect, and cannot invent a figure.

**Non-Goals:**

- Reconstructing revision history for existing flights. The column stores one preliminary
  loadsheet — the current one — and the earlier ones are gone. Every migrated flight starts
  with a single revision 1.
- Changing who may read loadsheet data. The read mirrors the flight read's audience exactly,
  including anonymous access; whether operational figures should be public at all is a real
  question and a separate one.
- Changing validation. `loadsheet.policy` compares a loadsheet's figures against each other and
  knows nothing about storage; it is untouched.
- Dropping `flight.loadsheets`. The column and its rows stay, unread, so the copy can be
  re-run and the previous release can still be rolled back to, until a second migration drops it
  once the copy has been confirmed.

## Decisions

### One table with a `kind`, not one table per kind

`flight_loadsheet` carries a `LoadsheetKind` discriminator (`preliminary` | `final`) rather
than splitting into `flight_preliminary_loadsheet` and `flight_final_loadsheet`.

The two kinds have identical figures — a final loadsheet is the preliminary one confirmed or
amended — and every consumer that reads "the current loadsheet" wants the final one
where it exists and the latest preliminary otherwise. With one table that is one query with a
`kind` filter; with two it is two queries and a merge at every call site. The write rules that
differ (who may write, in which flight status, how many) are enforced by the commands and by
the unique index, not by table identity.

*Alternative rejected:* separate tables, which would enforce "one final" with a plain unique on
`flightId` and need no discriminator — at the cost of duplicating thirty columns and every
mapper.

### The final loadsheet is always revision 1

`@@unique([flightId, kind, revision])` is the whole enforcement. A preliminary loadsheet takes
the next revision; a final loadsheet is always written with revision 1, so a second final
insert collides with the first and is rejected by the database.

The obvious alternative — a partial unique index, `CREATE UNIQUE INDEX … ON flight_loadsheet
("flightId") WHERE kind = 'final'` — is the textbook answer and is wrong here. Prisma cannot
express a partial index in `schema.prisma`, so it would exist only in databases built by
migrations. Every local and test database is built by `prisma db push` from the schema, so the
constraint the design relies on would be absent exactly where the tests run.

### The revision is `max + 1`, and a collision is a conflict, not a crash

The write reads the flight's highest preliminary revision and inserts the next one. Two
simultaneous updates can both read the same maximum; the second insert then violates the unique
index, and that violation is caught and reported as a conflict rather than surfacing as a 500.
Both updates target a flight in `created` status through the operations endpoint, so a genuine
race is a double-submit, and refusing the second is the right answer.

*Alternative rejected:* computing the revision inside the insert statement with raw SQL. It
removes the race, and `src/` contains no raw SQL and no `$transaction` anywhere today; adding
the first instance of both to close a double-submit window is not a trade worth making.

### The fuel breakdown is columns, with `fuelBlock` as its presence flag

Eighteen nullable columns on the loadsheet row, prefixed `fuel*`. A breakdown is present when
`fuelBlock` is not null, which is sound because `block` is required in every breakdown that
exists — it is the figure the `blockFuel` summary must reconcile with — while the eleven other
required figures can legitimately be zero and the six extended ones are optional.

*Alternatives rejected:* keeping `fuel` as a JSONB column, which is the nastiness this change
exists to remove; and a 1:1 `flight_loadsheet_fuel` table, where row presence would be an
unambiguous flag — but the breakdown is never read apart from its loadsheet and never queried
on its own, so it would be a table and a join for one boolean's worth of clarity.

### The per-cabin breakdown is four nullable columns

`passengersByCabin` looks map-shaped — `{ business: 20, economy: 130 }` — but its keys are not
open. `CabinClass` in `aerolopa.types.ts` is a closed set of four, `first | business |
premium_economy | economy`, the seat maps are built from it, and the database holds no other
value. So the breakdown is four nullable integer columns on the loadsheet row:
`firstPassengers`, `businessPassengers`, `premiumEconomyPassengers`, `economyPassengers`.

Null means the cabin was not part of the breakdown; zero means it was, carrying nobody. All four
null means the loadsheet has no breakdown, which is the state the domain expresses as `null`.

*Alternative rejected:* a `flight_loadsheet_cabin_load` child table keyed by cabin name. It
survives a fifth cabin class without a migration — but a fifth cabin class is a `CabinClass`
change, and therefore a code change, either way. It costs a table, a join on every read and a
nested write on every issue, to buy flexibility the domain does not have.

### No link from the final loadsheet to the preliminary it came from

A preliminary loadsheet may only be written while the flight is `created`; the final one only
while it is `boarding_started`. Those statuses cannot interleave, so every preliminary revision
precedes the final loadsheet and "the preliminary the final was based on" is always the highest
preliminary revision. A stored `basedOnRevision` would be a denormalisation answering a question
the ordering already answers, and one more column to keep true.

### Tons are `Decimal(7,3)`, read out as numbers at the boundary

Matching `flight.actualFuelBurned Decimal @db.Decimal(7,3)`. Nine thousand tons of headroom
against a 640 t aircraft, and the three decimal places the domain model already validates.
`passengerMass` is `Decimal(4,1)` in kilograms. Prisma returns `Decimal` objects, so the mapper
calls `.toNumber()` the way `get-flight.query.ts` already does for `actualFuelBurned` — the API
contract is unchanged and still returns JSON numbers.

### The read is not cached

`PerFlightCacheInterceptor` builds its key from the flight id, an optional resource name and
whether the caller is authenticated. It ignores the query string, so `?type=preliminary` and
`?type=final` would share one cache entry and serve each other's answers for a minute. Making
the key query-aware changes a shared interceptor used by the flight, OFP, delay and crew reads,
which is a change of its own. The loadsheet read is one indexed query returning a handful of
rows; it does not need a cache to be fast.

The flight-body cache invalidation on `PreliminaryLoadsheetWasUpdated` stays as it is. It is
now redundant — the flight body no longer contains loadsheets — but it is harmless, and
removing it means reasoning about every other reason that event might matter to the flight body.

### `PATCH /loadsheet/preliminary` keeps its contract

The endpoint still means "this is the preliminary loadsheet now", and the caller still sends a
whole loadsheet. That the system records the result as a new revision rather than overwriting
one is an internal consequence, not something the caller states. Renaming it to
`POST /flight/{id}/loadsheet` to advertise the append would break every client for a naming
improvement, and this change already breaks enough of them.

### Two queries, and every consumer moves to one of them

- `ListFlightLoadsheetsQuery(flightId, kind?)` — the read endpoint. Returns every loadsheet in
  issue order.
- `GetCurrentLoadsheetQuery(flightId, kind)` — the eight internal consumers. Returns the highest
  revision of that kind, or null.

`declare-emergency` is the one consumer whose behaviour changes rather than just its source of
data. It reads `flight.loadsheets.final ?? flight.loadsheets.preliminary!` today, and the
non-null assertion holds only because a flight cannot reach `taxiing_out` without having been
marked ready, which requires a preliminary loadsheet. After the migration that argument fails:
a legacy flight whose stored loadsheet was too incomplete to migrate can be airborne with no
loadsheet at all. It gets an explicit unprocessable error naming the missing loadsheet.

## The backfill

The schema migration creates the table and stops there. The data is copied by a separate
script the operator runs by hand, and `flight.loadsheets` keeps every row it has — nothing in
this change reads it, and a second migration drops it only once the copy has been confirmed.
Four files, then:

```
prisma/migrations/20260830120000_extract_flight_loadsheets/migration.sql   the table, its indexes and keys
prisma/data/20260830120000_extract_flight_loadsheets/data.sql              copies the loadsheets
prisma/data/20260830120000_extract_flight_loadsheets/test.sql              says whether it worked
prisma/migrations/20260830130000_drop_flight_loadsheets/migration.sql      drops the old column
```

Splitting them this way costs nothing and buys the thing a one-shot migration cannot give: the
copy can be inspected, corrected and re-run against real data while the old column still holds
the original. `data.sql` is wrapped in a transaction and guarded with `NOT EXISTS` on the flight
and kind, so running it twice inserts nothing the second time rather than colliding with the
unique index.

Three properties matter in the copy itself: it never fails on an unexpected shape, it never
invents a figure, and it never half-migrates a document.

**Type-checking, not casting.** Every read goes through a helper that returns a `numeric` only
when the JSON value is genuinely a number, and NULL otherwise. `jsonb_typeof` answers "present
and of the right type" in one test, so no cast can be reached with a value that would raise.
A missing key, an explicit `null`, and a string that happens to look like a number all yield
NULL and are handled identically.

**A loadsheet migrates whole or not at all.** A stored loadsheet is migrated only when all six
originally-required figures are present and numeric. Anything less is not migrated: that flight
ends up with no loadsheet, which the read reports as an empty array and a client renders as "no
loadsheet information for this flight". Nothing is defaulted to zero, because a loadsheet
reporting zero passengers and zero fuel is a false document, and nothing is logged, because a
flight from before the field existed is not an incident.

**The fuel breakdown is all-or-nothing on the same terms.** A breakdown missing any of its
eleven required figures is dropped and the loadsheet migrates without one — the state a
loadsheet written before #159 is in anyway. The six extended figures migrate where present.

**Issuance metadata comes from the event log where it exists.** `flight_event` records
`flight.preliminary-loadsheet-updated` and `flight.boarding-finished` with an actor and a
timestamp, so the migrated loadsheets can say who wrote them and when. The latest
preliminary-update event is the one that produced the stored figures. Where there is none — a
flight created with its loadsheet and never revised — the preliminary falls back to the flight's
creator and creation time. `flight.created` is not recorded in `flight_event`, so there is no
better source. A final loadsheet with no boarding-finished event keeps a null issuer rather
than borrowing the flight's creator, who certainly did not write it.

```sql
-- Helper functions, dropped at the end of this migration.
CREATE FUNCTION "loadsheet_import_number"(value jsonb) RETURNS numeric
    LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN jsonb_typeof(value) = 'number' THEN (value #>> '{}')::numeric END $$;

CREATE FUNCTION "loadsheet_import_complete"(sheet jsonb) RETURNS boolean
    LANGUAGE sql IMMUTABLE AS
$$ SELECT jsonb_typeof(sheet) = 'object'
      AND "loadsheet_import_number"(sheet -> 'flightCrew' -> 'pilots') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'flightCrew' -> 'reliefPilots') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'flightCrew' -> 'cabinCrew') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'passengers') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'cargo') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'payload') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'zeroFuelWeight') IS NOT NULL
      AND "loadsheet_import_number"(sheet -> 'blockFuel') IS NOT NULL $$;

CREATE FUNCTION "loadsheet_import_fuel"(sheet jsonb) RETURNS jsonb
    LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN "loadsheet_import_number"(sheet -> 'fuel' -> 'block') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'taxi') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'trip') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'alternate') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'reserve') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'contingencyAmount') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'mel') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'atc') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'wxx') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'extra') IS NOT NULL
                AND "loadsheet_import_number"(sheet -> 'fuel' -> 'tankering') IS NOT NULL
               THEN sheet -> 'fuel' END $$;
```

The preliminary backfill, with the final one identical but for the slot it reads, the kind it
writes, the event type it looks up and its issuer fallback:

```sql
INSERT INTO "flight_loadsheet" (
    "id", "flightId", "kind", "revision",
    "pilots", "reliefPilots", "cabinCrew", "passengers", "passengerMass",
    "cargo", "payload", "zeroFuelWeight", "blockFuel",
    "fuelBlock", "fuelTaxi", "fuelTrip", "fuelAlternate", "fuelReserve",
    "fuelContingencyType", "fuelContingencyAmount", "fuelMel", "fuelAtc", "fuelWxx",
    "fuelExtra", "fuelTankering", "fuelEtops", "fuelMinTakeoff", "fuelPlanTakeoff",
    "fuelPlanLanding", "fuelAverageFlow", "fuelMaxTanks",
    "issuedById", "issuedAt"
)
SELECT
    gen_random_uuid(), f."id", 'preliminary'::"LoadsheetKind", 1,
    "loadsheet_import_number"(s.sheet -> 'flightCrew' -> 'pilots')::int,
    "loadsheet_import_number"(s.sheet -> 'flightCrew' -> 'reliefPilots')::int,
    "loadsheet_import_number"(s.sheet -> 'flightCrew' -> 'cabinCrew')::int,
    "loadsheet_import_number"(s.sheet -> 'passengers')::int,
    "loadsheet_import_number"(s.sheet -> 'passengerMass'),
    "loadsheet_import_number"(s.sheet -> 'cargo'),
    "loadsheet_import_number"(s.sheet -> 'payload'),
    "loadsheet_import_number"(s.sheet -> 'zeroFuelWeight'),
    "loadsheet_import_number"(s.sheet -> 'blockFuel'),
    "loadsheet_import_number"(s.fuel -> 'block'),
    "loadsheet_import_number"(s.fuel -> 'taxi'),
    "loadsheet_import_number"(s.fuel -> 'trip'),
    "loadsheet_import_number"(s.fuel -> 'alternate'),
    "loadsheet_import_number"(s.fuel -> 'reserve'),
    CASE WHEN jsonb_typeof(s.fuel -> 'contingencyType') = 'string'
         THEN s.fuel ->> 'contingencyType' END,
    "loadsheet_import_number"(s.fuel -> 'contingencyAmount'),
    "loadsheet_import_number"(s.fuel -> 'mel'),
    "loadsheet_import_number"(s.fuel -> 'atc'),
    "loadsheet_import_number"(s.fuel -> 'wxx'),
    "loadsheet_import_number"(s.fuel -> 'extra'),
    "loadsheet_import_number"(s.fuel -> 'tankering'),
    "loadsheet_import_number"(s.fuel -> 'etops'),
    "loadsheet_import_number"(s.fuel -> 'minTakeoff'),
    "loadsheet_import_number"(s.fuel -> 'planTakeoff'),
    "loadsheet_import_number"(s.fuel -> 'planLanding'),
    "loadsheet_import_number"(s.fuel -> 'averageFuelFlow'),
    "loadsheet_import_number"(s.fuel -> 'maxTanks'),
    COALESCE(e."actorId", f."createdById"),
    COALESCE(e."createdAt", f."createdAt")
FROM "flight" f
CROSS JOIN LATERAL (
    SELECT f."loadsheets" -> 'preliminary' AS sheet,
           "loadsheet_import_fuel"(f."loadsheets" -> 'preliminary') AS fuel
) s
LEFT JOIN LATERAL (
    SELECT ev."actorId", ev."createdAt"
    FROM "flight_event" ev
    WHERE ev."flightId" = f."id"
      AND ev."type" = 'flight.preliminary-loadsheet-updated'
    ORDER BY ev."createdAt" DESC
    LIMIT 1
) e ON TRUE
WHERE "loadsheet_import_complete"(s.sheet);
```

`s.fuel` is NULL for a loadsheet with no usable breakdown, and `NULL -> 'taxi'` is NULL, so
every fuel column falls out as NULL without a single per-column condition.

The cabin counts come from a third helper, `loadsheet_import_cabins`, which returns the stored
breakdown only when it is an object whose every value is a number, and NULL otherwise. It
migrates whole or not at all on the same terms as the fuel breakdown — a breakdown carrying one
non-numeric count migrates none of its cabins, because migrating the rest would leave counts
that no longer sum to the loadsheet's passengers. A cabin the system does not know is reported
by `test.sql` section D and simply has nowhere to land.


`data.sql` then drops the three helper functions and commits. `flight.loadsheets` is not
touched.

`test.sql` answers the question the copy raises, in five sections, and creates the same three
helpers so it stands on its own:

- **A** — per kind, how many loadsheets are stored, how many are recognised, how many are left
  behind.
- **B** — every loadsheet that will be left behind, with the figures that disqualified it named
  one by one, so "why did this flight lose its loadsheet" has an answer.
- **C** — recognised loadsheets whose fuel breakdown is too incomplete to copy, and which
  figures are missing from it.
- **D** — recognised loadsheets whose per-cabin breakdown cannot be read as a map of counts.
- **E** — figures that are readable but will not fit the column they are copied into: a tonnage
  at or above 10000 for `decimal(7,3)`, a passenger mass at or above 1000, a count beyond a
  32-bit integer, a contingency type longer than 64 characters. Any one of them raises inside
  `data.sql`, and because the script is one transaction, that rolls the entire copy back and
  leaves nothing migrated. This section must be empty **before** running the copy.
- **F** — the reconciliation, run straight after `data.sql`: every stored figure compared
  against the column it landed in, rounded to that column's scale, plus the contingency type,
  the cabin breakdown as a whole, and loadsheets that should have been copied and were not.
  Every row it returns is a defect, so an empty result is the pass.

## Risks / Trade-offs

- **The backfill is never run by the test suite** → local and test databases are pushed from
  `schema.prisma`, so nothing in CI executes `data.sql`. It is verified by running it against a
  scratch database holding representative rows, then running `test.sql` section E, which must
  return nothing. This is a task in the change, not an afterthought.
- **The copy is a manual step, so it can be forgotten** → until `data.sql` runs, every existing
  flight reports an empty loadsheet list while its figures sit untouched in the old column. The
  data is not lost and the script can be run at any time, which is the point of splitting it out;
  the exposure is a window where the API under-reports rather than one where data is gone.
- **Flights whose loadsheet does not migrate lose it silently** → chosen deliberately: the
  figures were incomplete, and a client rendering "no loadsheet information for this flight" is
  telling the truth about them. The audit query above says how many before the fact.
- **Removing `loadsheets` from the flight read breaks clients that use it** → unavoidable and
  intended; it is why the change is marked breaking in three places. The replacement read ships
  in the same release.
- **`declare-emergency` can now refuse a flight it used to accept** → only for a flight with no
  migrated loadsheet, where the alternative is a crash on a non-null assertion. An explicit
  422 naming the missing loadsheet is the better failure.
- **Thirty-one seeded flights and thirty-three feature files move together** → the seeded
  figures are preserved exactly so that feature assertions elsewhere (manifests, NOTOC, cargo)
  keep passing; the risk is mechanical breakage, caught by the suite.

## Migration Plan

1. Deploy the release. `prisma migrate deploy` creates the enum, the two tables, their indexes
   and their foreign keys, and changes no existing row.
2. Run `test.sql` and read sections A to D: how many loadsheets will be copied, and which ones
   will not be, with the reason for each.
3. Read section E, and do not run the copy while it returns rows. Each one names a figure that
   will raise on insert and roll the whole transaction back. Correct the stored value, or accept
   losing that loadsheet by clearing the offending figure so the loadsheet stops being complete.
4. Run `data.sql`. It is transactional, so it either copies everything it recognises or nothing.
5. Run `test.sql` again and read section F. It must return no rows.
6. Rollback, if needed: redeploy the previous release. `flight.loadsheets` still holds every
   original figure, so the old code reads exactly what it did before. The new tables can be
   emptied with `TRUNCATE "flight_loadsheet" CASCADE` and the copy re-run later.
7. Deploy `20260830130000_drop_flight_loadsheets` once the copy is confirmed. It drops the
   column and the helper functions, and refuses to run where `flight_loadsheet` is empty while
   the old column still holds loadsheets — the check and the `ALTER` share one statement, so no
   client can carry on past the refusal. On a fresh database there is nothing to lose and it
   drops the column as normal.
