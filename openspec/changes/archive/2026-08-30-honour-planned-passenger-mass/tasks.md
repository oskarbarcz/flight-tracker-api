## 1. An imported flight plan can be flown without editing its weights

- [ ] 1.1 **Blocked, and not on this change.** `harden-cargo-load-planning` must reach `openspec/specs/` before this change is archived, but it cannot be archived as it stands: its delta drops 18 scenarios the main specs still carry, and they are a mix of accidental staleness and deliberate replacement (`flight-manifest` replaced `Release seats the loadsheet's passengers` with `Writing the loadsheet seats its passengers`, matching its rewritten requirement text; `baggage-containerisation` dropped `A payload smaller than its passengers and cargo falls back` while claiming the residual "is never negative", which the code never made true). Telling the two apart needs a requirement-by-requirement read, so it belongs to its own change. Implementation below does not depend on it — only archiving does
- [x] 1.2 Add `passengerMass?: number | null` to `Loadsheet` in `src/modules/flights/model/loadsheet.model.ts` — kilograms per passenger, `@IsOptional()` so a read-modify-write round trip is not refused by the whitelist, `@ApiProperty({ readOnly: true })` so the contract says it is server-owned
- [x] 1.3 Make `assertPayloadAccountsForLoad` in `src/modules/flights/model/loadsheet.policy.ts` measure against `loadsheet.passengerMass`, falling back to `STANDARD_ADULT_KG` when it is absent
- [x] 1.4 Extend `loadsheet.policy.spec.ts` with a sheet planned at a lighter passenger that is accepted, the same sheet rejected once the mass is absent, and a sheet with no passengers whose floor is its cargo alone — keeping the existing cases green
- [x] 1.5 Derive the preliminary loadsheet's `passengerMass` in `create-flight-from-simbrief.command.ts` from the plan — `(payload − cargo) ÷ passengers` in kilograms, rounded **down** to 0.1 kg so the imported sheet satisfies the floor derived from it — and leave it null when the plan carries no passengers
- [x] 1.6 Cover the derivation in `create-flight-from-simbrief.command.spec.ts`: a plan whose payload spreads to less than 84 kg per passenger, and a plan carrying no passengers
- [x] 1.7 In `update-preliminary-loadsheet.command.ts`, carry the stored preliminary loadsheet's `passengerMass` onto the incoming loadsheet before the assertions run, discarding whatever the request body carried
- [x] 1.8 In `finish-boarding.command.ts`, seed the final loadsheet's `passengerMass` from the flight's preliminary loadsheet before the assertions run, on the same terms
- [x] 1.9 Add command specs proving a request naming its own passenger mass is measured against the stored one, not the one it supplied
- [x] 1.10 Add to `features/flight/management/flight.update-preliminary-loadsheet.feature` a scenario submitting an imported loadsheet back with no weight changed, and to `features/flight/actions/flight.finish-boarding.feature` one finishing boarding on those weights — asserting the flight body each returns, and keeping a rejection scenario in both asserting the full 422 body
- [x] 1.11 Add `passengerMass` to the imported loadsheet asserted in `features/flight/management/flight.create-with-simbrief.feature`
- [x] 1.12 Re-audit the seeded loadsheets in `prisma/seed/resource/` against the floor now that it can rest on a lighter mass
- [x] 1.13 `npm run lint`, `npm run typecheck`, `npm test` and `npm run test:functional` green

## 2. Weights imported from a flight plan keep their kilograms

- [x] 2.1 Change `ofpWeightToTons` in `create-flight-from-simbrief.command.ts` to round to 3 decimals, so every imported weight is stored to the kilogram
- [x] 2.2 Widen `Loadsheet.cargo` from `maxDecimalPlaces: 2` to `3`, matching `payload`, `zeroFuelWeight` and `blockFuel`, so cargo is not the one field that can still round up past a payload stored to the kilogram
- [x] 2.3 Cover in `create-flight-from-simbrief.command.spec.ts` a weight that no longer loses its kilograms
- [x] 2.4 Update `features/flight/management/flight.create-with-simbrief.feature` for the unrounded import — cargo `8.004`, payload `37.932`, zero fuel weight `206.523`, block fuel `71.636` and the other fuel figures the mock now yields to the kilogram
- [x] 2.5 Sweep the remaining feature files that assert an imported loadsheet for the same rounding change
- [x] 2.6 `npm run lint`, `npm run typecheck`, `npm test` and `npm run test:functional` green
