## 1. Domain rule

- [x] 1.1 Add the pre-check-in predicate to `src/modules/rotations/model/rotation.rules.ts` — a `FlightStatus`-taking helper that is true for `created` and `ready` only, beside the existing `assertLegValid` / `assertChainContinuous`
- [x] 1.2 Add a colocated `rotation.rules.spec.ts` covering the predicate across the whole `FlightStatus` enum: true for `created` and `ready`, false for every other member

## 2. Relax the two guards

- [x] 2.1 In `src/modules/rotations/application/command/attach-flight-to-leg.command.ts`, replace the `flight.status !== FlightStatus.Created` check with the shared predicate and reword the `FlightNotAttachableError` message to name the check-in boundary instead of `created`
- [x] 2.2 In `src/modules/rotations/application/command/detach-flight-from-leg.command.ts`, replace the `leg.flight.status !== FlightStatus.Created` check with the shared predicate, keeping `LegLockedError` and its existing message
- [x] 2.3 In `src/modules/rotations/application/command/update-leg.command.ts`, swap the inline `Created || Ready` comparison for the shared predicate so all three read the same rule
- [x] 2.4 Confirm no other rotation code gates on `FlightStatus.Created` — `grep -rn "FlightStatus.Created" src/modules/rotations`
- [x] 2.5 Type `LegFlight.status` as `FlightStatus` instead of `string` in `model/rotation-leg.model.ts` (with the enum on its `@ApiProperty`) and cast at the repository boundary in `toModel`, mirroring the existing `as RotationStatus` cast — the loose `string` typing is what let the old inline comparisons compile and is why the predicate would not accept a leg's flight status
- [x] 2.6 `docker compose exec app npx tsc --noEmit` — ESLint alone does not catch the above, and a type error leaves the dev server serving stale compiled code

## 3. Seed fixtures for the new scenarios

- [x] 3.1 In `prisma/seed/resource/rotations.seed.ts`, put both fixtures on rotation `2f4ac9bd…` (`ready`, Lufthansa) so only one feature file is affected. Attach target: renumber leg `1ccf9810-e3cc-4dca-90d8-323351c4fe64` from `LH301` to `LH42`, matching the seeded `ready` DLH42 `006f0754-1ed7-4ae1-9f91-fae2d446a6e7`; leave its `flightId` null — the attach scenario fills it at runtime. Leg `d31970a7…` keeps `LH888` and stays deliberately unfillable
- [x] 3.2 In the same file, make leg `92c8e486-0bb5-4876-b894-75f0ca30ce61` (same rotation) the detach fixture: renumber `LH300` → `LH81` and set its `flightId` to DLH81 `11087d20-ead0-4b7e-97ee-f1ef0ea29e4f` (`ready`, EDDF→KJFK, Lufthansa)
- [x] 3.3 Verify the four negative attach scenarios still fail for the reason they claim — they all target leg `d31970a7…`, which this change no longer renumbers, so only the closed-flight scenario's message moves. Correct the stale `loadDLH42` route comment in `flights.seed.ts`, which claimed EDDF→KJFK while the wiring is KJFK→EDDF
- [x] 3.4 Apply the schema-free seed change with `docker compose exec app npm run database:seed`

## 4. Functional coverage

- [x] 4.1 In `features/rotation/rotation.attach-flight.feature`, add a scenario attaching the `ready` DLH42 to leg `1ccf9810…` of rotation `2f4ac9bd…`, asserting 200 with the full rotation body and the leg's `flight` as `{ id, flightNumber: "LH42", status: "ready" }`, closing with `I set database to initial state`
- [x] 4.2 In the same file, add a scenario detaching the seeded `ready` DLH81 from leg `92c8e486…` of rotation `2f4ac9bd…`, asserting 200 with the full rotation body and that leg's `flight` back to null, closing with `I set database to initial state`
- [x] 4.3 Rename the existing "A flight that is not created cannot be attached" scenario to name the check-in boundary and update its expected 422 message to the new wording from 2.1
- [x] 4.4 Add a negative detach scenario for a checked-in-or-later flight, asserting 409 `Leg cannot be modified because its flight has already checked in.` — rotation `d182d0f0…` leg `69de1c35…` carries AAL4908
- [x] 4.5 Confirm no `LH888` assertion needs touching, since leg `d31970a7…` keeps its number under the revised 3.1
- [x] 4.6 Update both leg bodies for rotation `2f4ac9bd…` in `features/rotation/rotation.my-list.feature`: leg `92c8e486…` becomes `LH81` with the DLH81 flight object, leg `1ccf9810…` becomes `LH42`
- [x] 4.7 Confirm the flight-facing suites are unaffected — no flight was added or removed, so `features/flight/management/flight.list.feature` counts and `features/flight/ofp/flight.get-ofp.feature` bodies must not need edits

## 5. Spec and docs

- [x] 5.1 Edit the `## Purpose` paragraph in `openspec/specs/rotation-management/spec.md` so the leg/flight sentence says a flight that has not yet checked in, not "a real `created` flight" (the delta cannot carry a Purpose change for an existing capability)
- [x] 5.2 Check the Swagger descriptions on `attach-flight.action.ts` and `detach-flight.action.ts` for `created`-only wording and correct it if present
- [x] 5.3 `openspec validate attach-ready-flight-to-leg --strict`

## 6. Verify

- [x] 6.1 `docker compose exec app npm run lint` and `npm run format:fix`
- [x] 6.2 `docker compose exec app npm test` — the new rules spec plus the existing `flight-lifecycle.listener.spec.ts`
- [x] 6.3 `docker compose exec app npx cucumber-js features/rotation` — the whole rotation directory, since the seed change touches list, get, cancel, and my-list bodies
- [x] 6.4 `docker compose exec app npm run test:functional` for the full suite; treat only the known `hasFlightPath` report-on-block flake as pre-existing
