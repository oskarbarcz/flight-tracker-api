## 1. Roster resolution

- [x] 1.1 Add the private `toCrewNames(value: unknown): string[]` resolver to `CreateFlightFromSimbriefHandler`, handling text, lists, keyed objects and everything else, and dropping blank names
- [x] 1.2 Read `fo` and `pu` through the resolver, taking the first name yielded, and read `fa` through it for every name
- [x] 1.3 Derive the preliminary loadsheet's `cabinCrew` count from the same resolved names

## 2. Unit coverage

- [x] 2.1 Extend `create-flight-from-simbrief.command.spec.ts` with the observed shapes: the collected roster, the empty object for an unfilled field, blank strings, a single attendant outside a list, an index-keyed attendant object, blank entries among the attendants, and a missing crew block
- [x] 2.2 Cover the cabin crew count against the same fixtures

## 3. Verification

- [x] 3.1 Run lint, format and the Jest unit suite
- [x] 3.2 Run `features/flight/management/flight.create-with-simbrief.feature`, then the full functional suite
