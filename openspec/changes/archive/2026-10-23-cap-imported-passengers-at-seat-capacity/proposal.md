## Why

Importing a SimBrief plan is meant to brief the flight straight away: the specs already require the
import to seat the passenger manifest, build the cargo manifest and issue the preliminary
notification to captain, because creating the flight writes its preliminary loadsheet. In practice
operations often get none of the three until they write the loadsheet again by hand.

The import takes its passenger count from the plan, and SimBrief plans against a generic cabin, not
the airline's real seat map. When the plan carries more passengers than the aircraft's layout has
seats, seating fails with `Cannot seat 348 passengers in a cabin of 220 seats.` The listener that
builds the three documents runs them in order, and seating comes first, so the cargo manifest and the
notification are never attempted. The error travels back into the import, which answers `422`
although the flight, its loadsheet, crew, route and NOTAMs were already stored. Operations see a
failed import of a flight that exists, with no briefing documents, until they correct the passenger
count by hand.

## What Changes

- **An imported plan never seats more passengers than the cabin has.** When the aircraft has a cabin
  layout and the plan reports more passengers than it has seats, the import records the seat count as
  the passenger count, and seating, the cargo manifest and the notification to captain are generated
  at import as the specs require.
- **The loadsheet still adds up.** The mass of every passenger left behind, at the plan's own
  per-passenger allowance, comes off the payload and the zero fuel weight. Cargo, fuel figures and the
  planned passenger mass are kept as the plan states them.
- A loadsheet written by operations is still refused when it reports more passengers than seats. Only
  the import caps.

## Capabilities

### Modified Capabilities

- `flight-manifest`: an imported plan is seated up to the cabin's capacity.
- `flight-loadsheets`: an imported loadsheet is capped at the seat count, with the payload and zero
  fuel weight reduced to match.

## Impact

**API** — `POST /api/v1/flight/create-with-simbrief` answers `201` for a plan with more passengers
than seats, where it answered `422` after storing the flight. No request or response shape changes.

**Code** — `CreateFlightFromSimbriefHandler` reads the aircraft's seat capacity through
`GetSeatCapacityQuery` and caps the plan's loadsheet with the new `capPassengersAtSeatCapacity`
policy.

**Tests** — unit tests for the capping policy; three import scenarios: no layout, a layout that fits,
and a layout smaller than the plan. The REST context gains a step that remembers a response property
for later request paths.
