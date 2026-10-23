## 1. API

- [x] 1.1 `FlightListSort` and `FlightListOrder` in the flight model
- [x] 1.2 `sort` and `order` on `FlightListFilters`, defaulting to newest created first, with Swagger declarations on the list action
- [x] 1.3 `compareFlightsByTimesheet` in `model/flight-list-order.ts`
- [x] 1.4 Order timesheet sorts in `FlightsRepository.findAll` before slicing the page

## 2. Tests

- [x] 2.1 Unit tests for the comparator
- [x] 2.2 List scenarios: upcoming by scheduled off-block, paging, last arrival, validation

## 3. Release

- [x] 3.1 Bump the version
