## Context

The parking stand change settled how a nested kind joins the queue: `ChangeRequestValues` maps
each `ChangeRequestResource` to its field types, one `*_FIELDS` list drives the values type, the
adapter's whitelist and the request DTO, and `ChangeRequestTargets` holds a `ChangeRequestTargetMap`,
so a kind without an adapter fails to compile. A proposal stores only its `targetId`, and every
read and write in `airports` is scoped by airport. The stand adapter therefore resolves the airport
with `FindParkingPositionQuery(id)` and then calls the airport-scoped `UpdateParkingPositionCommand`.

Gates, terminals and runways have the same shape. Each has an airport-scoped
`Get*ByIdQuery(airportId, id)` and `Update*Command(airportId, id, data)`, and none can be read by
its id alone. Three facts in the current code affect this change:

- `UpdateGateCommand` checks a proposed terminal and stand against the gate's airport and answers
  `TerminalNotFoundError` or `ParkingPositionNotFoundError` (both 404).
- `Runway.coordinates` carries `@Type(() => Coordinates)` and `@IsNotEmpty()` but no
  `@ValidateNested()`. With `whitelist` on, the global pipe therefore never looks inside it.
- The request DTOs are built with `PartialType`, which adds `@IsOptional()`. That decorator lets
  `null` through for every field, including columns that cannot hold `null`. The existing
  `RequestAirportChangeRequest` also redeclares `location` and `cityId` in its own body, each with
  its own `@IsOptional()`.

## Goals / Non-Goals

**Goals:**

- Gates, terminals and runways as the third, fourth and fifth kinds, with no change to the queue,
  its actions or its table shape.
- Reuse the three existing update commands, so a proposal and a direct edit write the same way.
- Never store a proposal, of any of the five kinds, that the update command will refuse to write.

**Non-Goals:**

- Proposing new records, removing records, or moving a record to another airport.
- Showing the record's airport or name in the queue list (unchanged from stands).
- Changing how the OpenStreetMap upgrade matches or diffs these records.
- Fixing `null` handling in the direct-edit `Update*Request` DTOs (see Risks).

## Decisions

**1. Resource names `gate`, `terminal` and `runway`.** They match the Prisma models, the endpoint
paths and `ProposedResource` in the OSM upgrade. Each is one `ALTER TYPE … ADD VALUE` statement,
and all three go in one migration.

**2. One find-by-id query per kind in `airports`: `FindGateQuery(gateId)`,
`FindTerminalQuery(terminalId)` and `FindRunwayQuery(runwayId)`.** Each answers the same response
type as its `Get*ByIdQuery` (which includes `airportId`), or that kind's not-found error. Each
shares the row-to-model mapping (the JSON casts for `coordinates`, `shape` and `operatorCodes`)
with its existing by-id handler instead of copying it.

- _Alternative considered:_ one `FindAirportRecordQuery(kind, id)`. It would return a union that
  every caller narrows again, and `airports` keeps one query per record kind everywhere else.
- _Alternative considered:_ storing the airport beside the target. This was already rejected for
  stands, because it puts a nested-kind column on a generic table.

**3. Submission is scoped by the URL**, cabin crew only, tagged like the other endpoints of the
same record:

| Kind     | Endpoint                                                                  | Tag                |
| -------- | ------------------------------------------------------------------------- | ------------------ |
| gate     | `POST api/v1/airport/:airportId/gate/:gateId/request-data-change`         | `airport gate`     |
| terminal | `POST api/v1/airport/:airportId/terminal/:terminalId/request-data-change` | `airport terminal` |
| runway   | `POST api/v1/airport/:airportId/runway/:runwayId/request-data-change`     | `airport runway`   |

Each action first dispatches a new airport-scoped assertion — `AssertGateExistsQuery`,
`AssertTerminalExistsQuery` or `AssertRunwayExistsQuery`. Each answers `AirportNotFoundError`, or
the kind's not-found error, as `AssertParkingPositionExistsQuery` does. The action then dispatches
`SubmitChangeRequestCommand(kind, id, body, user)` and reads the result back with
`GetChangeRequestByIdQuery`.

- _Alternative considered:_ reusing `Get*ByIdQuery` as the existence check, which raises the same
  errors. It was rejected to keep `assert/` as the one place for existence checks, as the stand
  change did.

**4. The gate's ownership checks reuse existing assertions and answer what a direct edit
answers.** The gate adapter's `validate` finds the gate. When `terminalId` is proposed, it
dispatches `AssertTerminalBelongsToAirportQuery(gate.airportId, terminalId)`. When
`parkingPositionId` is proposed and is not `null`, it dispatches
`AssertParkingPositionExistsQuery(gate.airportId, parkingPositionId)`. Both answer 404, which is
what `UpdateGateCommand` answers.

- _Alternative considered:_ `AssertParkingPositionBelongsToAirportCommand`. It answers 422
  (`ParkingPositionNotAtAirportError`) for the flight stand assignment. A proposal would then
  answer differently from the direct edit it stands in for.

The terminal and runway adapters have no cross-record field, so their `validate` only finds the
record.

**5. Typed values from one list per kind.** These live in `model/gate-change.model.ts`,
`model/terminal-change.model.ts` and `model/runway-change.model.ts`.

- `GATE_FIELDS = ['name', 'category', 'terminalId', 'parkingPositionId', 'coordinates']`
- `TERMINAL_FIELDS = ['shortName', 'fullName', 'averageTaxiTime', 'operatorCodes', 'text', 'shape']`
- `RUNWAY_FIELDS = ['designator', 'length', 'width', 'displace', 'trueHeading', 'magneticHeading', 'elevation', 'surfaceType', 'lightingType', 'coordinates']`

Each list is declared `as const satisfies readonly (keyof Model)[]`. The values type is mapped
with `-?` and `Exclude<…, undefined>`, so nullable columns become `T | null`, as in
`ParkingPositionValues`. `ChangeRequestValues` gains the three entries, and `ChangeRequestTargets`
gains the three adapters.

**6. Every proposal DTO rejects `null` for columns that cannot hold it.** All five DTOs — the
three new ones and the existing `RequestAirportChangeRequest` and
`RequestParkingPositionChangeRequest` — are built as
`PartialType(PickType(Model, FIELDS), { skipNullProperties: false })`:

- This swaps `@IsOptional()` for `ValidateIf(value !== undefined)`.
- An omitted field is still skipped.
- `null` now reaches the field's own validators. A non-nullable column such as `length`,
  `designator`, `terminalId`, an airport's `name` or a stand's `gpu` therefore fails with 400.
- A nullable column keeps the `@IsOptional()` the model declares on it, so it still accepts `null`.
  This keeps gate unlinking possible. The nullable columns are:
  - airport: `shape`
  - stand: `deicingDescription`, `noiseSensitivityText`, `noiseSensitivityStartTime`,
    `noiseSensitivityEndTime`, `coordinates`
  - gate: `parkingPositionId`, `coordinates`
  - terminal: `text`, `shape`
  - runway: `displace`, `trueHeading`, `elevation`
- The airport DTO declares `location` and `cityId` in its own body, each with its own
  `@IsOptional()`. class-validator skips a field when any of its conditions fails, so that
  decorator still lets `null` through whatever the option does. Both swap it for
  `@ValidateIf((_, value) => value !== undefined)` by hand.
- `airportId` is left out of every list, so `forbidNonWhitelisted` rejects it with 400.

Without this, a proposal of `{ "length": null }` or `{ "name": null }` is stored and then fails
inside Prisma when it is accepted. A `null` city fails at submission, inside the city lookup, with
a server error.

- _Alternative considered:_ a per-kind list of non-nullable fields checked in the adapter. That is
  a second list to keep in step with the model, where the model's own decorators already encode
  the rule.

**7. `Runway.coordinates` gains `@ValidateNested()`.** This makes a proposed threshold coordinate
validated field by field, as stand and gate coordinates are. Because the model is shared, direct
runway create and update also start rejecting a malformed latitude or longitude with 400.
Well-formed requests are unaffected.

**8. Apply through the existing commands.** The adapters call
`UpdateGateCommand(airportId, id, changes)`, `UpdateTerminalCommand(…)` and
`UpdateRunwayCommand(…)`. Each values type is assignable to its `Update*Request`, so no cast is
needed.

`apply` runs before the conditional status transition. So when `UpdateGateCommand` rejects a stand
or terminal removed since submission, the proposal stays pending and the gate is unchanged. This
is the spec's stand-removed scenario, and it needs no extra code.

**9. `read` reports every listed field**, with `?? null` for optional ones. It maps a not-found
error to `ChangeRequestTargetNotFoundError`, as the stand adapter does, so a record removed after
submission surfaces through the existing 404 on read and accept.

**10. Three explicit adapters, not one generic airport-record adapter.** The three differ in their
query and command classes, and the gate also has its two ownership checks. A factory would save
some repetition but hide which bus calls each kind makes, and `ChangeRequestTargetMap` wants one
named provider per kind regardless.

## Risks / Trade-offs

- **[Risk] Renaming a match key misaligns the OSM upgrade.** The upgrade matches runways by
  `designator`, terminals by `shortName` and gates by `name`. If an accepted rename disagrees with
  OpenStreetMap, the next pull shows that record as removed and re-added.
  - Mitigation: renames are reviewed, and a rename that matches reality also matches what OSM
    reports. A push never applies an unselected key, so a reviewer sees the pair before anything
    is deleted.
- **[Risk] An OSM push can overwrite an accepted crew value.** The upgrade diffs runway length,
  width, true heading, elevation, surface and coordinates, terminal footprints, and gate terminal,
  stand and coordinates.
  - Mitigation: none needed. Pushes are selected key by key, and the fields crew are most likely
    to correct — lighting, magnetic heading, taxi time, operators, notes, gate category, a cleared
    stand link — are the ones the upgrade never touches after creation.
- **[Risk] Airport and stand clients that send `null` for a required field now get 400.**
  - Mitigation: none needed. Such a request never produced a proposal that could be accepted, so
    no working client depends on it.
- **[Trade-off] The direct-edit `Update*Request` DTOs still accept `null` for required columns**
  and fail with a server error at write time.
  - The same option fixes each in one line. Those are operations-facing endpoints outside this
    capability, so the fix belongs in its own change.
- **[Trade-off] Queue entries show only the record id.** This is unchanged from stands. The single
  read and the record's own endpoint answer it.
- **[Risk] Seed growth changes existing feature bodies.**
  - Mitigation: the queue and own-list features are updated in the same change, from the named id
    exports.

## Migration Plan

```sql
ALTER TYPE "change_request_resource" ADD VALUE 'gate';
ALTER TYPE "change_request_resource" ADD VALUE 'terminal';
ALTER TYPE "change_request_resource" ADD VALUE 'runway';
```

All three are additive. Rolling back means deleting proposals of the three kinds first, because
Postgres cannot drop an enum value in place. The `@ValidateNested()` addition needs no migration.

The `null` handling needs no data migration. An airport or stand proposal already stored with
`null` for a required field still fails when it is accepted, and a reviewer can reject it.
