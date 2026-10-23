## Context

See `proposal.md` § Why. Writing the preliminary loadsheet, by hand or at import, emits
`PreliminaryLoadsheetWasUpdated`, and `GenerateManifestsListener` turns it into three commands in
order: seating, the cargo manifest and the notification to captain. The listener is registered with
`suppressErrors: false` and emitted with `emitAsync`, so a rejection from any command reaches the
caller. That is deliberate: the hold capacity check lives in the cargo manifest command, and its
rejection is how an over-heavy loadsheet is refused.

`UpdatePreliminaryLoadsheetHandler` checks seat capacity before it stores anything, so a hand-written
loadsheet never reaches seating with too many passengers. `CreateFlightFromSimbriefHandler` stored the
plan's figures without that check.

## Goals / Non-Goals

**Goals:**

- An imported flight is briefed at import when its plan is larger than the cabin.
- The imported loadsheet stays internally consistent.

**Non-Goals:**

- Changing the capacity rule for loadsheets written by operations. They stay refused above capacity.
- Making the three documents independent of each other. Their errors are part of loadsheet
  validation, and swallowing them would let an over-heavy loadsheet through.
- Capping cargo that exceeds the hold, or recovering from an AeroLOPA outage at import. Both still end
  an import with an error after the flight is stored.
- Splitting the capped passengers across cabins. The import has no cabin breakdown; seating
  distributes the capped count proportionally, as it does for any loadsheet without one.

## Decisions

### Cap at import rather than refuse the import

The plan is the operator's intent, and the seat map is the aircraft's reality. Refusing the import
would force the user back into SimBrief for a figure we can correct deterministically. Capping keeps
the import one step and produces a loadsheet the aircraft can actually fly.

### Take the offloaded passengers' mass off the payload and the zero fuel weight

The payload rule requires the payload to cover the cargo and every passenger at the planned mass.
Capping the count alone would leave the payload carrying passengers who are not on board. Removing
`(planned − seats) × planned passenger mass` from both figures keeps the build-up honest. Fuel stays as
planned: it was computed for the heavier aircraft, which errs on the safe side.
