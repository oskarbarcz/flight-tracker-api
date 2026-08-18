## Why

A flight declares what it carries (`flight-service-type`) and an operator declares what
it carries (`operator-service-type`), but the aircraft type in between says nothing. A
client building a flight or an aircraft form therefore cannot tell a freighter from a
passenger jet, even though the distinction is a property of the airframe itself: a 777F
has no cabin, and no amount of operator or flight metadata changes that.

The gap shows up wherever the three levels are shown together. A cargo flight on a
passenger-only airframe is a data-entry mistake nothing can spot, and a client that wants
to offer "freighters only" when picking an aircraft type has to hard-code its own list of
ICAO designators.

## What Changes

- Every airframe in the curated dataset declares a `serviceType`: `passenger`, `cargo`,
  or `both`.
- The value is classified from the airframe's factory role: an airframe built only as a
  freighter is `cargo`; an airframe whose type designator covers a factory freighter or
  combi variant alongside a passenger one is `both`; everything else is `passenger`.
- `serviceType` is returned by `GET /api/v1/airframe` and `GET /api/v1/airframe/{type}`,
  and consequently by every response that embeds a resolved airframe — aircraft bodies,
  flight bodies, and the user aircraft history.
- The dataset is guarded by a unit test asserting that all 212 airframes declare a known
  value, so an entry added later cannot ship without one.

## Capabilities

### New Capabilities

- `airframe-service-type`: the service an airframe is built for, its classification rule,
  and its presence in every airframe read.

### Modified Capabilities

- _None._ `flight-service-type` and `operator-service-type` keep their contracts: the
  airframe value is descriptive and nothing is derived from it in either direction.

## Impact

- **API**: one additional non-nullable field on the airframe payload. Additive for
  clients that read fields by name; every full-body assertion over an airframe, aircraft,
  flight, or user aircraft entry grows by one key.
- **Data**: `src/modules/airframes/data/airframes.json` only. Airframes are curated static
  reference data with no table, so there is no schema change and no migration.
- **Code**: `AirframeServiceType` enum and the validated property on the `Airframe` model.
- **Tests**: a colocated Jest spec over the dataset, two new scenarios on the airframe
  read (a freighter and a dual-role airframe), and the field swept into the existing
  full-body assertions across the aircraft, flight, airframe, and user features.
