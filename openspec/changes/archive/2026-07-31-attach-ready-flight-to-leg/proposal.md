## Why

A rotation leg can only take a flight while that flight is still `created`, so
the moment dispatch marks a flight `ready` the pairing window closes — even
though nothing operational has happened yet and check-in is still ahead. In
practice flights are readied as soon as their plan is filed, well before anyone
gets round to wiring them into the rotation, which leaves Operations with a leg
that can never be filled and a rotation that can never advance. The leg-retiming
rule already draws the line at check-in rather than at `created`, so attachment
is the outlier.

## What Changes

- Attaching a flight to a leg accepts a flight in either the `created` or the
  `ready` state; every other attachment precondition (route match, flight-number
  match, operator match, leg empty, flight not attached elsewhere) is unchanged.
- Detaching a flight from a leg likewise accepts `created` or `ready`, keeping
  the pairing reversible for as long as it is creatable. Detaching remains
  rejected from check-in onwards.
- The rejection message for an ineligible flight stops naming `created` alone
  and states the real rule — a flight that has already checked in (or moved
  further) cannot be attached.
- No change to when a rotation advances: it still moves to `in_progress` on the
  first pilot check-in, so attaching an already-`ready` flight leaves the
  rotation `ready`.

## Capabilities

### New Capabilities

<!-- None: this change relaxes an existing precondition. -->

### Modified Capabilities

- `rotation-management`: the "Attach a flight to a leg" and "Detach a flight from
  a leg" requirements widen their eligible flight state from `created` to
  `created` or `ready`, with check-in as the cut-off.

## Impact

- `src/modules/rotations/application/command/attach-flight-to-leg.command.ts` —
  the `FlightStatus.Created` guard and its `FlightNotAttachableError` message.
- `src/modules/rotations/application/command/detach-flight-from-leg.command.ts` —
  the `FlightStatus.Created` guard behind `LegLockedError`.
- `features/rotation/rotation.attach-flight.feature` — the "flight that is not
  created cannot be attached" scenario asserts the old message; new scenarios
  cover attaching and detaching a `ready` flight.
- `openspec/specs/rotation-management/spec.md` — purpose paragraph and the two
  affected requirements.
- No database, DTO, route, or role change: `PUT`/`DELETE
/api/v1/rotation/:id/leg/:legId/flight` keep their contracts and stay
  Operations-gated.
