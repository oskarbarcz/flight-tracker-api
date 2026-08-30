## 1. The loadsheet carries the mass it was planned with

- [ ] 1.1 Sync or archive `harden-cargo-load-planning` so `A loadsheet payload accounts for its cargo and its passengers` lives in `openspec/specs/flight-fuel-planning/spec.md` before this change's delta modifies it
- [ ] 1.2 Add `passengerMass?: number | null` to `Loadsheet` in `src/modules/flights/model/loadsheet.model.ts` — kilograms per passenger, `@IsOptional()` so a read-modify-write round trip is not refused by the whitelist, `@ApiProperty({ readOnly: true })` so the contract says it is server-owned
- [ ] 1.3 Widen `Loadsheet.cargo` from `maxDecimalPlaces: 2` to `3`, matching `payload`, `zeroFuelWeight` and `blockFuel`
- [ ] 1.4 Make `assertPayloadAccountsForLoad` in `src/modules/flights/model/loadsheet.policy.ts` measure against `loadsheet.passengerMass`, falling back to `STANDARD_ADULT_KG` when it is absent
- [ ] 1.5 Extend `loadsheet.policy.spec.ts` with a sheet planned at a lighter passenger that is accepted, the same sheet rejected once the mass is absent, and a sheet with no passengers whose floor is its cargo alone — keeping the existing cases green

## 2. The import states the mass and stops rounding

- [ ] 2.1 Change `ofpWeightToTons` in `create-flight-from-simbrief.command.ts` to round to 3 decimals, so every imported weight is stored to the kilogram
- [ ] 2.2 Derive the preliminary loadsheet's `passengerMass` from the plan — `(payload − cargo) ÷ passengers` in kilograms, rounded **down** to 0.1 kg so the imported sheet satisfies the floor derived from it — and leave it null when the plan carries no passengers
- [ ] 2.3 Cover both in `create-flight-from-simbrief.command.spec.ts`: a plan whose payload spreads to less than 84 kg per passenger, a plan carrying no passengers, and a weight that no longer loses its kilograms

## 3. Loadsheet writes preserve the mass

- [ ] 3.1 In `update-preliminary-loadsheet.command.ts`, carry the stored preliminary loadsheet's `passengerMass` onto the incoming loadsheet before the assertions run, discarding whatever the request body carried
- [ ] 3.2 In `finish-boarding.command.ts`, seed the final loadsheet's `passengerMass` from the flight's preliminary loadsheet before the assertions run, on the same terms
- [ ] 3.3 Add command specs proving a request naming its own passenger mass is measured against the stored one, not the one it supplied

## 4. The reported bug is covered end to end

- [ ] 4.1 Add to `features/flight/management/flight.update-preliminary-loadsheet.feature` a scenario importing a plan planned at a lighter passenger, submitting its loadsheet back with no weight changed, and asserting the flight body that comes back
- [ ] 4.2 Add the matching scenario to `features/flight/actions/flight.finish-boarding.feature` — boarding finishes on the imported weights, asserting the resulting flight body rather than the status alone
- [ ] 4.3 Keep a rejection scenario in both, asserting the full 422 body, for a payload that cannot carry its load even at the mass it was planned with

## 5. Fixtures and seeds follow the new precision

- [ ] 5.1 Update `features/flight/management/flight.create-with-simbrief.feature` for the unrounded import — cargo `8.004`, payload `37.932`, zero fuel weight `206.523`, block fuel `71.636` and the other fuel figures the mock now yields to the kilogram — and for the `passengerMass` of `86` the mock's own figures derive
- [ ] 5.2 Sweep the remaining feature files that assert an imported loadsheet for the same rounding change
- [ ] 5.3 Re-audit the seeded loadsheets in `prisma/seed/resource/` against the floor now that it can rest on a lighter mass, correcting any that only passed by carrying no mass

## 6. Verification

- [ ] 6.1 `npm run lint` and `npm run typecheck` clean
- [ ] 6.2 `npm test` green
- [ ] 6.3 `npm run test:functional` green
