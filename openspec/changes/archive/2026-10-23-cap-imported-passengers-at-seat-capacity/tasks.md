## 1. Import

- [x] 1.1 `capPassengersAtSeatCapacity` in `loadsheet.policy.ts`: cap the count at the seat total, take the offloaded mass off payload and zero fuel weight, clear any cabin breakdown
- [x] 1.2 Read the aircraft's seat capacity in `CreateFlightFromSimbriefHandler` through `GetSeatCapacityQuery` and cap the plan's loadsheet before it is stored

## 2. Tests

- [x] 2.1 Unit tests for `capPassengersAtSeatCapacity`
- [x] 2.2 REST context step `I remember the response body property {string} as {string}`, with `{{name}}` substitution in request paths
- [x] 2.3 Import scenarios for an aircraft with no layout, with a layout that fits and with a layout smaller than the plan

## 3. Release

- [x] 3.1 Bump the version
