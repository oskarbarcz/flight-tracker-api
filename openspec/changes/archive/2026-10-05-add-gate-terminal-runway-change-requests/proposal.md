## Why

The review queue was built for runways, terminals, parking stands and gates, and only airports and
stands have joined it. The remaining three are where the OpenStreetMap upgrade is weakest: it
reports every runway's lighting as `unknown` and never revisits the magnetic heading, it writes a
terminal's name, taxi time, operators and notes once and never again, it never revisits a gate's
border category, and it never clears a gate's stand link. Crew see these values on every flight.
Today an operations user's manual edit is the only way they get corrected.

## What Changes

- **Cabin crew can propose a gate change.** A proposal names any combination of the gate's name,
  border category, terminal, linked parking stand and coordinates. The terminal and the stand must
  belong to the gate's airport, and the stand may be proposed as `null` to unlink it.
- **Cabin crew can propose a terminal change.** A proposal names any combination of the terminal's
  short name, full name, average taxi time, operator codes, briefing notes and footprint.
- **Cabin crew can propose a runway change.** A proposal names any combination of the runway's
  designator, length, width, displaced threshold, true and magnetic heading, threshold elevation,
  surface type, lighting type and threshold coordinates.
- Each proposed value is validated as it would be for a direct edit, and the record itself is
  untouched until a reviewer accepts.
- **All three kinds share the existing queue.** They appear in the review list, can be filtered by
  kind, show current against proposed values, and are accepted, rejected and withdrawn by the
  existing actions. Accepting applies every proposed value at once, and the last write wins.
- **A gate, terminal or runway never changes airport through a proposal.** The airport is not a
  proposable field.
- **Runway threshold coordinates are validated field by field.** The runway model checks today that
  coordinates are present but not what is inside them. Direct runway create and update now reject a
  malformed latitude or longitude, as airports, stands and gates already do.
- **Airport and stand proposals reject `null` for a required field.** Today such a value either
  fails with a server error straight away (a `null` city) or is stored and then fails when a
  reviewer accepts it (a `null` name or ground power). It is now rejected with a validation error
  at submission. An airport's shape and a stand's notes, noise window and coordinates still accept
  `null`. The same rule applies to the three new kinds from the start.
- Only edits to existing records can be proposed. Proposing a missing gate, terminal or runway,
  or the removal of one, stays out of scope.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `data-change-review`: gates, terminals and runways become supported kinds of data, each with its
  own way of proposing a change. The extensibility requirement then names all five kinds as
  supported. The airport and parking stand proposal requirements now say which of their fields may
  be proposed as `null`.

## Impact

- `ChangeRequestResource` gains `gate`, `terminal` and `runway`, which needs a Postgres
  enum-value migration.
- `change-requests` module: three adapters, their typed values, three request DTOs and three
  submit actions. The existing `RequestAirportChangeRequest` and
  `RequestParkingPositionChangeRequest` DTOs get the same `null` handling as the new ones.
- `airports` module, all on the bus:
  - three queries that read a gate, a terminal or a runway by its id alone;
  - three airport-scoped existence assertions for the submit actions.
  - The existing terminal and stand ownership assertions and the three update commands are
    reused unchanged.
- `Runway.coordinates` gains nested validation, which affects
  `POST`/`PATCH api/v1/airport/:airportId/runway` as well.
- Seed: proposals of each new kind in each status, plus named id exports for the referenced gates
  and runways. The bodies of the existing queue and own-list features grow to include them.
