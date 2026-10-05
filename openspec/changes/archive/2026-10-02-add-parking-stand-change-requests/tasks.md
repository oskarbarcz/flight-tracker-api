## 1. Schema and seed

- [x] 1.1 Add `parkingPosition` to `ChangeRequestResource`, create the migration, regenerate the client and sync the dev DB
- [x] 1.2 Export named ids for the referenced stands and terminals from `parking-positions.seed.ts` and `terminals.seed.ts`, used by their own records
- [x] 1.3 Seed stand proposals: two pending (different crew users), one accepted and one rejected, from those exports

## 2. Airports module support

- [x] 2.1 `FindParkingPositionQuery(parkingPositionId)` answering the stand with its airport, or 404
- [x] 2.2 `AssertParkingPositionExistsQuery(airportId, parkingPositionId)` (airport 404, stand 404)
- [x] 2.3 `AssertTerminalBelongsToAirportQuery(airportId, terminalId)` (terminal 404)
- [x] 2.4 Register the three handlers

## 3. change-requests module

- [x] 3.1 `ParkingPositionValues` and its entry in `ChangeRequestValues`
- [x] 3.2 `ParkingPositionChangeRequestTarget` (`validate`, `read`, `apply`) and its entry in `ChangeRequestTargets`
- [x] 3.3 `RequestParkingPositionChangeRequest` DTO and `RequestParkingPositionChangeAction`, registered in the module

## 4. Tests

- [x] 4.1 `change-request.request-parking-position.feature`: happy path (stand unchanged), other terminal, foreign terminal, stand of another airport, invalid value, airport not proposable, nothing to change, RBAC
- [x] 4.2 Extend list (kind filter, new seed rows), get (stand diff), accept (stand applied, asserted through the stand endpoint), list-mine (new seed rows)
- [x] 4.3 Run the change-request Jest spec, the full functional suite, lint and format

## 5. Wrap-up

- [x] 5.1 Mention parking stands in the `CLAUDE.md` change-requests paragraph
- [x] 5.2 `openspec validate add-parking-stand-change-requests --strict`
