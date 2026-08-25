## 1. The loadsheet payload floor

- [x] 1.1 Add `assertPayloadAccountsForLoad` to `src/modules/flights/model/loadsheet.policy.ts`, requiring payload ≥ cargo + passengers at the standard adult mass, and a typed `PayloadBelowLoadError extends UnprocessableError` in the flights module's `model/error/`
- [x] 1.2 Colocate `loadsheet.policy.spec.ts` cases for a payload below its cargo, a payload that cannot carry its passengers, an exact payload, and a zero-passenger zero-cargo loadsheet
- [x] 1.3 Apply the assertion in `update-preliminary-loadsheet.command.ts` beside the existing fuel and passenger assertions
- [x] 1.4 Apply it to the final loadsheet in `finish-boarding.command.ts`, before any manifest work runs
- [x] 1.5 Extend `features/flight/management/flight.update-preliminary-loadsheet.feature` and `features/flight/actions/flight.finish-boarding.feature` with the rejection, asserting the full 422 body
- [x] 1.6 Audit every seeded loadsheet in `prisma/seed/resource/` against the floor and correct the payloads that fail it

## 2. A compartment's residual covers weight and volume

- [x] 2.1 Replace the weight-only `headroomOf` in `src/modules/manifest/model/cargo-packing.ts` with a residual carrying `weightKg` and `volumeM3`, and thread it through `bulkLots`, `planBaggageUnits` and the ULD placement in `planCargoLoad`
- [x] 2.2 Size a loose lot as the smaller of the weight the compartment allows and the weight its remaining volume allows at the commodity's density
- [x] 2.3 Bias the loose-lot commodity draw toward densities that fit the remaining volume, and re-draw a bounded number of times before declaring a lot unplaceable
- [x] 2.4 Extend `cargo-packing.spec.ts` with a compartment whose volume binds before its weight, a low-density load that spills to the next compartment, and a case proving the tonnage still reconciles exactly
- [x] 2.5 Add an invariant to the generated-manifest specs asserting no compartment exceeds its volume, alongside the existing weight assertion

## 3. Baggage reserves its room before cargo is planned

- [x] 3.1 Move the `planBaggage` call in `generate-flight-cargo-manifest.command.ts` ahead of `planCargoLoad`, and pass the reservation into cargo planning
- [x] 3.2 Compute the reservation — weight, volume and the number of ULD positions the bags will occupy on a container-capable variant — from the baggage plan
- [x] 3.3 Make `planCargoLoad` honour reserved positions and reserved compartment residuals so cargo cannot consume them
- [x] 3.4 Remove the positionless fallback in `planBaggageUnits`: bags that will not fit raise rather than becoming a lot with no compartment
- [x] 3.5 Mirror the same ordering in `reconcile-flight-cargo-manifest.command.ts` so reconciliation observes the rules generation observes
- [x] 3.6 Cover in `cargo-packing.spec.ts` a narrowbody whose positions are all wanted by cargo, proving the bags keep a position and the cargo takes a bulk lot instead

## 4. An unplaceable load refuses the release

- [x] 4.1 Add a typed `HoldCannotPlaceLoadError extends UnprocessableError` in the manifest module naming the weight or volume that did not fit
- [x] 4.2 Raise it from `generate-flight-cargo-manifest.command.ts` when planning cannot place the whole load, leaving no manifest behind, and confirm `mark-as-ready` surfaces it without releasing the flight
- [x] 4.3 Keep the hold-wide weight and volume guard at the loadsheet write unchanged as the cheap early check
- [x] 4.4 Extend `features/flight/actions/flight.mark-as-ready.feature` with a flight whose cargo and baggage together do not fit, asserting the full 422 body and that the flight stays `created`
- [x] 4.5 Extend `features/flight/cargo-manifest.get.feature` to assert every unit of a curated aircraft reports a deck and a compartment

## 5. The reported weights account for every tare

- [x] 5.1 Include baggage container tare in `baggageKg` in `get-flight-cargo-load.query.ts`
- [x] 5.2 Confirm the NOTOC deadload — cargo plus baggage — follows, and update `notoc.spec.ts` and `notoc-delta.spec.ts` expectations that assumed the tare was absent
- [x] 5.3 Assert in `features/flight/cargo-manifest.get.feature` that the reported cargo and baggage weights together equal the sum of every unit's tare and gross weight

## 6. The dangerous goods rate

- [x] 6.1 Lower the `frequency` values on the thirty dangerous goods entries in `src/modules/manifest/data/cargo-commodities.data.json` to a band that holds the offered share under a tenth
- [x] 6.2 Strip the source-airport tier from the dangerous goods entries that hold it only by being hazardous — paint, aerosols, perfumery, fire extinguishers, compressed oxygen, oxygen generators, spirits — leaving them at country or continent tier
- [x] 6.3 Add a colocated test walking every seeded airport and every month, asserting the dangerous goods share of the offered selection weight stays under a tenth
- [x] 6.4 Cap a manifest at two dangerous goods consignments in the draw path, substituting an ordinary commodity admissible in the same compartment when the cap is reached
- [x] 6.5 Cover the cap in `cargo-packing.spec.ts`, including that the substitute keeps the tonnage reconciled
- [x] 6.6 Assert in `features/flight/notoc.get.feature` that a flight reports at most two dangerous goods consignments

## 7. Seeds and coverage

- [x] 7.1 Regenerate the seeded cargo manifests in `prisma/seed/resource/cargo-manifests.seed.ts` under the new rules and update the counts derived from them
- [x] 7.2 Keep one seeded fixture flight deliberately carrying two dangerous goods consignments so the notification and the emergency drill stay covered on purpose
- [x] 7.3 Update the feature expectations that name per-unit weights, compartment loads, container counts or dangerous goods counts changed by the regeneration
- [x] 7.4 Reconcile the scenarios against the seed statically before running the suite

## 8. Verification

- [x] 8.1 `docker compose exec app npx jest --runInBand src/modules/manifest src/modules/flights`
- [x] 8.2 `docker compose exec app npm run test:functional`
- [x] 8.3 `docker compose exec app npm run lint` and `docker compose exec app npx tsc -p tsconfig.build.json --noEmit`
- [x] 8.4 Release a flight matching the reported case — 7 t cargo, 188 passengers, A320 CLS — and confirm it is refused, then confirm a coherent loadsheet generates a manifest with every unit placed and no compartment over volume

## 9. One temperature regime per compartment

- [x] 9.1 Add `mayJoinCompartmentRegime` beside the segregation predicates: a commodity may join a compartment when it travels in a container that maintains its own temperature, when it declares no regime, or when every regime already loaded there matches its own
- [x] 9.2 Track the regimes a compartment carries alongside the handling codes in `planCargoLoad` and `bulkLots`, recording only freight that does not control its own temperature
- [x] 9.3 Seed the regimes from the load already aboard in `reconcile-flight-cargo-manifest.command.ts`
- [x] 9.4 Cover in `cargo-packing.spec.ts` a frozen and a cool consignment separated, a self-refrigerated container joining anyway, and regime-less freight staying neutral

## 10. Generation follows the preliminary loadsheet

- [x] 10.1 Move the passenger manifest, cargo manifest and preliminary notification generation from `mark-as-ready.command.ts` into `update-preliminary-loadsheet.command.ts`, generating before the loadsheet is stored so a refusal leaves the flight as it was
- [x] 10.2 Leave `mark-as-ready` as a state transition over the guards it already applies
- [x] 10.3 Reword the three "generated when the flight is released" not-found messages to name the preliminary loadsheet
- [x] 10.4 Move every scenario that reads a generated manifest out of `flight.mark-as-ready.feature` into `flight.update-preliminary-loadsheet.feature`, writing the loadsheet instead of releasing
- [x] 10.5 Keep the release step where a scenario needs the flight released for what follows, after the loadsheet write
- [x] 10.6 Drop the release-time seat-capacity scenario, whose guard now runs at the loadsheet write and is covered there
- [x] 10.7 Seed a manifest and a preliminary notification for every seeded flight that carries a preliminary loadsheet, so the seed satisfies the same invariant the API now holds

## 11. Cabin counts are validated at the boundary

- [x] 11.1 Add `IsCountRecord` in `src/core/validation/`, validating that every value of an open-keyed record is a whole number of zero or more
- [x] 11.2 Apply it to `passengersByCabin` in place of `@IsObject()`, keeping the keys fluid so a layout may name its cabins as it likes
- [x] 11.3 Drop the integer and sign check from `assertPassengerBreakdownConsistent` and delete `InvalidPassengerBreakdownError`, which nothing asserted
- [x] 11.4 Cover the refused request in `flight.update-preliminary-loadsheet.feature`, asserting the full violations body

## 12. The cargo repository stops reaching across modules

- [x] 12.1 Add `GetLatestMetarQuery` to the airports module, backed by `findLatestMetarByIataCode` on its weather repository
- [x] 12.2 Carry `greatCircleDistance` on `FlightManifestContext` so the manifest module reads the leg length from the flights module rather than the flight table
- [x] 12.3 Dispatch `ListAllAirportsQuery` and `ListAllOperatorsQuery` for the journey's candidate airports and carrier codes, filtering in the command
- [x] 12.4 Delete `networkAirports`, `flightDistanceKm`, `latestMetar` and `carrierCodes` from `cargo.repository.ts`, leaving it on the tables the manifest module owns
