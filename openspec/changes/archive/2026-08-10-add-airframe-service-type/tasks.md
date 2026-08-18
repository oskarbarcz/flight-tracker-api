## 1. Model

- [x] 1.1 Add the `AirframeServiceType` enum (`passenger`, `cargo`, `both`) to `src/modules/airframes/model/airframe.model.ts`
- [x] 1.2 Declare `serviceType` on the `Airframe` class with `@IsEnum` and an `@ApiProperty` stating the classification rule

## 2. Dataset

- [x] 2.1 Classify all 212 entries in `src/modules/airframes/data/airframes.json`: freighter-only designators `cargo`, factory dual-role utility types `both`, the rest `passenger`
- [x] 2.2 Add `src/modules/airframes/data/airframes.spec.ts` asserting every entry declares a known value, and pinning `B77F` as `cargo`, `B772` as `passenger` and `C208` as `both`

## 3. Functional coverage

- [x] 3.1 Extend `features/airframe/airframe.get.feature` with a freighter (`B77F`) and a dual-role (`C208`) scenario, and add `serviceType` to the existing airframe bodies
- [x] 3.2 Sweep `serviceType` into every full-body assertion carrying an embedded airframe across `features/aircraft/`, `features/flight/` and `features/user/user.aircraft.list.feature`

## 4. Verification

- [x] 4.1 Run lint, format and the Jest unit suite
- [x] 4.2 Run the airframe and aircraft features, then the full functional suite
