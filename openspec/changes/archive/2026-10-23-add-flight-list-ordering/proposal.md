## Why

The flight list is always ordered by when each flight was created. The web app's cabin crew dashboard
needs "the next flight to leave" and "the flight that arrived last", and neither follows creation
order: a flight scheduled for June can be created before one scheduled for January, and the last
closed flight is not necessarily the last one created. Today the app downloads up to a hundred flights
and sorts them itself for the next flight, and shows the most recently created closed flight as the
last one, which can be wrong.

## What Changes

- **`GET /api/v1/flight` accepts `sort` and `order`.** `sort` is `createdAt` (the default),
  `scheduledOffBlockTime` or `actualOnBlockTime`; `order` is `desc` (the default) or `asc`.
- Ordering happens before pagination, and `X-Total-Count` is unchanged.
- Flights without the chosen time come last in either direction; equal times fall back to newest
  created first.
- Existing callers see no change: both parameters are optional and default to today's order.

## Capabilities

### New Capabilities

- `flight-list`: ordering of the flight list.

## Impact

**API** — two optional query parameters on `GET /api/v1/flight`. Additive; no response changes.

**Code** — `FlightListSort` and `FlightListOrder` in the flight model; the filters DTO and the list
action's Swagger declarations; `FlightsRepository.findAll`, which orders timesheet fields in memory
through the new `compareFlightsByTimesheet`.

**Tests** — unit tests for the comparator; list scenarios for both orderings, paging and validation.
