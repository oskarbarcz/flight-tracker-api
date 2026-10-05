## 1. Schema and seed

- [x] 1.1 Add `gate`, `terminal` and `runway` to `ChangeRequestResource`, create one migration with the three `ADD VALUE` statements, regenerate the client and sync the dev DB
- [x] 1.2 Export named `GATE_IDS` and `RUNWAY_IDS` from `gates.seed.ts` and `runways.seed.ts` for the records the proposals and features reference, used by those records themselves; extend `TERMINAL_IDS` and `PARKING_POSITION_IDS` as needed
- [x] 1.3 Seed two proposals per new kind, with real v4 ids, covering pending, accepted and rejected across both crew users: a pending gate proposal re-linking a gate to another stand of its airport, a pending terminal proposal changing taxi time, and a pending runway proposal changing lighting type

## 2. Airports module support

- [x] 2.1 `FindGateQuery`, `FindTerminalQuery` and `FindRunwayQuery` (by id alone, answering the `Get*Response` with `airportId`, or the kind's 404), sharing the row-to-model mapping with the existing `Get*ByIdQuery` handlers
- [x] 2.2 `AssertGateExistsQuery`, `AssertTerminalExistsQuery` and `AssertRunwayExistsQuery` (airport 404, then record 404)
- [x] 2.3 Add `@ValidateNested()` to `Runway.coordinates`
- [x] 2.4 Register the six handlers in `AirportsModule`

## 3. change-requests module

- [x] 3.1 `GATE_FIELDS`/`GateValues`, `TERMINAL_FIELDS`/`TerminalValues` and `RUNWAY_FIELDS`/`RunwayValues`, and their entries in `ChangeRequestValues`
- [x] 3.2 `GateChangeRequestTarget`, whose `validate` checks the terminal through `AssertTerminalBelongsToAirportQuery` and a non-null stand through `AssertParkingPositionExistsQuery`, both against the gate's airport
- [x] 3.3 `TerminalChangeRequestTarget` and `RunwayChangeRequestTarget`
- [x] 3.4 Add the three adapters to `ChangeRequestTargets` and the module providers
- [x] 3.5 `RequestGateChangeRequest`, `RequestTerminalChangeRequest` and `RequestRunwayChangeRequest` as `PartialType(PickType(Model, FIELDS), { skipNullProperties: false })`
- [x] 3.6 `RequestGateChangeAction`, `RequestTerminalChangeAction` and `RequestRunwayChangeAction` (cabin crew only, tagged with their record's tag), registered in the module
- [x] 3.7 Pass `{ skipNullProperties: false }` to the `PartialType` of `RequestAirportChangeRequest` and `RequestParkingPositionChangeRequest`, and replace the `@IsOptional()` on the airport DTO's own `location` and `cityId` with `@ValidateIf((_, value) => value !== undefined)`

## 4. Tests

- [x] 4.1 `change-request.request-gate.feature`:
  - happy path: other stand plus coordinates, then the gate GET still reports the old values
  - unlink with `null`
  - foreign stand, foreign terminal, gate through another airport, invalid category
  - `null` for a required field (`name`)
  - airport not proposable, nothing to change
  - RBAC: cabin crew 201, operations 403, admin 403, unauthenticated 401
- [x] 4.2 `change-request.request-terminal.feature`:
  - happy path: taxi time plus operator codes, then the terminal GET still reports the old values
  - footprint of three points, footprint of two points
  - terminal through another airport
  - `null` for a required field (`averageTaxiTime`)
  - airport not proposable, nothing to change
  - RBAC
- [x] 4.3 `change-request.request-runway.feature`:
  - happy path: lighting type plus magnetic heading, then the runway GET still reports the old values
  - invalid designator, latitude that is not a number
  - runway through another airport
  - `null` for a required field (`length`)
  - airport not proposable, nothing to change
  - RBAC
- [x] 4.4 Extend the existing change-request features:
  - list: a kind filter for each of `gate`, `terminal` and `runway`, plus the new seed rows in every unfiltered body
  - get: gate stand diff and runway lighting diff
  - accept:
    - gate stand, terminal taxi time (as admin) and runway lighting, each asserted through the record's own GET
    - a gate proposal whose stand was removed first answers 404 and stays pending
  - list-mine: the new seed rows
- [x] 4.5 Extend `change-request.request-airport.feature`:
  - `null` for name, city and location answers 400 with a violation for each
  - `shape: null` on a seeded airport that has a shape is still accepted as pending
- [x] 4.6 Extend `change-request.request-parking-position.feature`:
  - `null` for ground power and terminal answers 400 with a violation for each
  - `noiseSensitivityText: null` on a seeded stand that has notes is still accepted as pending
- [x] 4.7 `runway.update.feature` and `runway.create.feature`: a latitude that is not a number answers 400
- [x] 4.8 Run the change-request Jest spec (`npx jest --runInBand`), the full functional suite, lint and format

## 5. Wrap-up

- [x] 5.1 Update the `CLAUDE.md` change-requests paragraph: all five kinds are supported, plus the `skipNullProperties: false` rule for every proposal DTO, and a `ValidateIf` rather than `@IsOptional()` on any field a proposal DTO declares itself
- [x] 5.2 `openspec validate add-gate-terminal-runway-change-requests --strict`
