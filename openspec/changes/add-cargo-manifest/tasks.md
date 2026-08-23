<!--
Each group is an independent, individually shippable unit (one GitHub issue). Dependencies:
2 needs 1; 4 needs 1, 2 and 3; 5, 6 and 8 need 4; 7 needs 6; 9 needs 6; 10 needs 7 and 9;
11 needs 10. Group 3 is independent of 1 and 2 and can run in parallel with them. Every group
carries its own schema, seed data and tests. Group 12 is the Definition of Done applied inside
every group, not a separate issue. No external provider is involved, so there are no mock
fixtures to add.
-->

## 1. Hold reference data (independent) — capability `aircraft-hold-layout`

- [x] 1.1 New `cargo` module: module wiring, `model/error/cargo.error.ts` with `HoldVariantNotFoundError`
- [x] 1.2 `data/cargo-holds.json`: positions declared as templates with overrides for irregular positions; variants for the seeded fleet (`B77W`, `A339`, `B752`, `B738`, `A321`, `A320`, `A319`) and the ten freighter designators (`A225`, `A3ST`, `A30F`, `B74F`, `B48F`, `B75F`, `B76F`, `B77F`, `MD1F`, `SH33`), then extend toward the common widebodies
- [x] 1.3 `model/hold-layout.model.ts`: deck, compartment, position and variant types; domain enums in PascalCase, cast at the boundary
- [x] 1.4 `data/cargo-holds.spec.ts` dataset invariants: exactly one default variant per type; every variant has at least one loose-loaded compartment; designators unique within a variant; a loose-loaded compartment declares no positions; every position's accepted bases and contours are known ULD grammar values; compartment and position weights positive
- [x] 1.5 Position designator convention documented in the model and in the endpoint description as this system's convention, not a published designation
- [x] 1.8 `model/hold-position-expander.ts`: expand a compartment's position template into concrete positions applying the designator convention, with overrides replacing template fields + unit spec covering both sides, a single full-width run, overrides, and a compartment with no template
- [x] 1.6 `ListHoldLayoutsQuery` + `GetHoldLayoutQuery`; `GET /api/v1/cargo-hold` and `GET /api/v1/cargo-hold/:type`, any authenticated role, 404 for an uncurated type
- [x] 1.7 Feature: `features/cargo/hold-layout.get.feature`, `hold-layout.list.feature` — curated widebody, curated freighter with two decks, bulk-only narrowbody with no positions, uncurated type 404, unauthenticated 401

## 2. Hold variant assignment (needs 1) — capabilities `aircraft-hold-assignment`, `aircraft-management`

- [ ] 2.1 Migration: `aircraft.holdVariant` nullable string
- [ ] 2.2 `resolveHoldVariant(aircraft, airframeType)` + unit spec: assigned variant wins, null falls back to the type default, uncurated type resolves to nothing
- [ ] 2.3 `AssignAircraftHoldVariantCommand` and `RemoveAircraftHoldVariantCommand`, rejecting a variant the type does not offer
- [ ] 2.4 `PUT` and `DELETE /api/v1/aircraft/:id/hold-variant`, `@Role(UserRole.Operations)`
- [ ] 2.5 Add `holdVariant` to every aircraft read model; confirm aircraft create and edit ignore it
- [ ] 2.6 Seed: assign the container-capable variant to one A320 and leave the rest defaulted, so both paths stay covered
- [ ] 2.7 Feature: `features/aircraft/hold-variant.assign.feature` — assign, reject unknown variant, remove restores default, RBAC, `holdVariant` present on aircraft reads

## 3. Commodity catalogue (independent) — capability `cargo-commodity-catalogue`

- [ ] 3.1 `data/cargo-commodities.json`: 100 entries across perishables, pharma, live animals, high tech, batteries, other dangerous goods, automotive and industrial, aerospace and AOG, consumer, valuables, human and restricted, mail, dry foodstuffs, outsize and project cargo
- [ ] 3.2 Roughly 30 entries carry a `dg` block with a real UN number, proper shipping name, class, subsidiary risk, packing group, net quantity per package and cargo-aircraft-only flag
- [ ] 3.3 `ercCode` derived per dangerous goods entry from the published drill chart (drill number from the hazard class, letters from the additional risks); `sourceNote` records the reasoning wherever a letter is a judgement call
- [ ] 3.4 `model/commodity.model.ts` and the special handling code vocabulary as a domain enum in PascalCase
- [ ] 3.5 `data/cargo-commodities.spec.ts` dataset invariants: exactly 100 entries; every entry has a name, at least one SHC, a density in 30–2000 kg/m³, a piece range, a piece count range, an offload priority in range, at least one month and at least one source tier; every SHC is in the vocabulary; every `dg` entry has a UN number, class and `ercCode`; `ercCode` matches `/^(?:[1-9]|1[01])[ACEFHILMNPSWXY]+$/` and its drill number equals the mapping for its hazard class; `heaviestPiece` present only on heavy or outsized entries
- [ ] 3.6 `selectCommodities(departureAirport, month)` + unit spec for the resolution ladder: airport tier, country tier, continent tier, generic fallback never empty, out-of-season entry excluded, frequency weighting respected
- [ ] 3.7 `commodityDensity` derived volume helper + unit spec proving cube-out below and weigh-out above the 369 kg/m³ break-even of an `AKE`

## 4. Cargo manifest generation (needs 1, 2, 3) — capabilities `flight-cargo-manifest`, `flight-fuel-planning`

- [ ] 4.1 Migration: `flight_cargo_unit`, `flight_cargo_shipment` with their enums (`kind`, `contentClass`, `status`, `offloadReason`, `transferRole`) and indexes; unique `(flightId, positionDesignator)` where the designator is not null
- [ ] 4.2 `model/awb.ts`: 11-digit air waybill number with a check digit equal to the serial modulo 7 + unit spec including a known-good example
- [ ] 4.3 `model/uld.ts`: ULD type table with base, contour, volume, tare range and maximum gross weight; serial and owner code generation
- [ ] 4.4 `model/cargo-packing.ts` single-pass packer + unit spec: tare consumes the same budget as freight; a unit stops at whichever of weight and volume binds first; the closing trim lands the total exactly on the tonnage; a remainder below the smallest sensible unit becomes a loose lot; two flights with the same tonnage and different densities need different unit counts
- [ ] 4.5 Position assignment respecting accepted bases and contours, compartment weight limits and one unit per position + unit spec
- [ ] 4.6 Shipper and consignee names via the existing faker dependency, locale resolved from the departure airport's country then continent
- [ ] 4.7 `GenerateFlightCargoManifestCommand`, dispatched from `mark-as-ready` alongside the passenger manifest
- [ ] 4.8 `HoldCapacityExceededError` (422) on release when the tonnage exceeds the resolved variant's weight or volume; skipped for uncurated types
- [ ] 4.9 Degraded path: an uncurated type generates units and shipments with no position and no compartment
- [ ] 4.10 `GetFlightCargoManifestQuery` + `GET /api/v1/flight/:id/cargo-manifest` with a status filter, operations and the flight's captain, reporting weight per compartment; distinct responses for "not released", "no manifest" and "hold configuration unknown"
- [ ] 4.11 Seed: cargo manifests across a widebody, a container-capable narrowbody, a bulk-only narrowbody, a freighter and an uncurated type
- [ ] 4.12 Feature: `features/cargo/manifest.generate.feature`, `manifest.get.feature` — the tonnage invariant, no duplicate positions, no compartment over its limit, bulk-only carries no ULD, uncurated type carries no positions, over-capacity 422, RBAC. Contents are asserted by shape, counts and invariants rather than whole bodies, because they are generated

## 5. Shipment journey (needs 4) — capability `cargo-shipment-journey`

- [ ] 5.1 Origin, destination, transfer role, onward carrier, onward flight number and connection minutes on `flight_cargo_shipment`
- [ ] 5.2 `model/shipment-journey.ts`: the four transfer roles derived from comparing origin against departure and destination against arrival + unit spec covering all four
- [ ] 5.3 Beyond-point selection weighted by the arrival airport's region, using the existing airport reference data
- [ ] 5.4 Air waybill prefix by role: the operator's own prefix for cargo raised here, another carrier's for an inbound transfer + unit spec
- [ ] 5.5 Unit grouping by onward destination ahead of every other grouping key; single-destination units marked as transferring intact, mixed units as broken down + unit spec
- [ ] 5.6 Tight-connection flag below the transfer minimum
- [ ] 5.7 Feature: `features/cargo/shipment-journey.feature` — all four roles present across a generated manifest, sealed and broken-down units, a tight connection reported, prefixes differing by role

## 6. Special handling and dangerous goods (needs 4) — capability `cargo-special-handling`

- [ ] 6.1 `dangerousGoods` JSON block on a shipment, populated from the commodity's `dg` entry
- [ ] 6.2 `model/cargo-aircraft-only.policy.ts`: one predicate on the loadsheet's passenger count, `CargoAircraftOnlyViolationError` (422), applied at generation and reconciliation + unit spec covering freighter, passenger flight, empty passenger aircraft and freighter carrying passengers
- [ ] 6.3 `model/segregation.policy.ts`: the segregation matrix (radioactive against live animals and film, infectious against foodstuffs, dry ice against live animals, oxidizers against flammable liquids, human remains against foodstuffs) + unit spec per pair, both orders
- [ ] 6.4 Heated and ventilated compartment requirements honoured at placement; a load with no suitable compartment is not carried + unit spec
- [ ] 6.5 Dry ice quantity totalled per compartment
- [ ] 6.6 Feature: `features/cargo/special-handling.feature` — a passenger flight carries no cargo-aircraft-only load, an empty passenger aircraft may, segregated pairs land in different compartments, live animals land in a heated ventilated compartment

## 7. Cold chain (needs 6) — capability `cargo-cold-chain`

- [ ] 7.1 `temperatureControl` JSON block on a shipment: regime, range, solution, endurance, set point where active
- [ ] 7.2 `model/cold-chain.ts` exposure across build-up, flight, connection and onward flight; margin; risk level + unit spec at each boundary
- [ ] 7.3 Deterministic explanation generated from the assessment's own inputs + unit spec asserting the whole sentence
- [ ] 7.4 Ambient temperature at the exposed airport folded in from the existing airport weather, and omitted cleanly when unknown + unit spec
- [ ] 7.5 Active solution preferred over passive where exposure would exceed a passive endurance
- [ ] 7.6 Assessment is advisory: it blocks no release, no loading and no boarding completion
- [ ] 7.7 Feature: `features/cargo/cold-chain.feature` — low, elevated and high risk each produced by a constructed flight; identical inputs produce an identical explanation; a high-risk shipment is still carried

## 8. Baggage (needs 4) — capabilities `baggage-containerisation`, `flight-fuel-planning`

- [ ] 8.1 `model/baggage.ts`: residual from payload less passengers at 84 kg less cargo; bags at 15/16/18 kg by `greatCircleDistance` + unit spec at each tier boundary
- [ ] 8.2 `InconsistentPayloadError` (422) on a negative or implausible residual, at release and at boarding completion; skipped for uncurated types
- [ ] 8.3 Baggage units containerised where positions exist and loose where they do not; `contentClass` and `bagCount` on the unit
- [ ] 8.4 Premium cabin baggage in its own unit marked priority, from the loadsheet's per-cabin breakdown; no priority unit on a single-class flight
- [ ] 8.5 Baggage excluded from the cargo invariant but included in compartment weight limits + unit spec
- [ ] 8.6 Correct any seeded loadsheet whose payload cannot be reconciled under the new check
- [ ] 8.7 Feature: `features/cargo/baggage.feature` — the residual is loaded, bag counts differ by sector length, priority unit present and absent, negative residual 422, cargo invariant unaffected

## 9. Reconciliation (needs 6) — capability `cargo-manifest-reconciliation`

- [ ] 9.1 `model/cargo-reconciliation.ts` plan: offloads in ascending offload priority, additions to close a shortfall, never offloading the highest priority + unit spec
- [ ] 9.2 `offloadReason` recorded per offloaded shipment; offloaded shipments retained, never deleted; a unit emptied by offloading frees its position
- [ ] 9.3 A final tonnage below the weight of the shipments that may not be offloaded is rejected as unprocessable
- [ ] 9.4 Added shipments observe every generation rule: cargo-aircraft-only, segregation, compartment environment, position compatibility, compartment limits
- [ ] 9.5 `ReconcileFlightCargoManifestCommand`, dispatched from `finish-boarding` alongside the passenger reconciliation
- [ ] 9.6 `HoldCapacityExceededError` and `InconsistentPayloadError` on the final loadsheet; both skipped for uncurated types
- [ ] 9.7 Feature: `features/cargo/manifest.reconcile.feature` — lower tonnage offloads by priority, higher adds, unchanged changes nothing, the invariant holds afterwards, remaining shipments untouched, offloaded shipments listed with reasons, status filter, over-capacity 422

## 10. Notification to captain (needs 7, 9) — capability `dangerous-goods-notification`

- [ ] 10.1 Migration: `flight_notoc` with `stage`, `issuedAt`, `document` JSON, `acknowledgedById`, `acknowledgedAt`, unique `(flightId, stage)`
- [ ] 10.2 `model/notoc.ts` document composition: dangerous goods section, other special loads section, cold chain section marked advisory, load summary section; "no dangerous goods loaded" where none are
- [ ] 10.3 Drill text per emergency response code from the published chart — inherent risk, risk to aircraft and occupants, spill and fire-fighting procedure — reported alongside each dangerous goods entry
- [ ] 10.4 `IssueNotocCommand` dispatched from `mark-as-ready` for the preliminary stage and from `finish-boarding` for the final stage, after the manifest work in each
- [ ] 10.5 Acknowledgement recorded from the existing transitions: the preliminary at `check-in`, the final by the `finish-boarding` request itself. No new endpoint and no new request field
- [ ] 10.6 `model/notoc-delta.ts` between the two stored snapshots: dangerous goods and special loads added or removed, shipments repositioned, tonnage and deadload change + unit spec including the no-change case
- [ ] 10.7 `GetFlightNotocQuery` + `GET /api/v1/flight/:id/notoc` with an optional stage, defaulting to the latest issued; operations and the flight's captain
- [ ] 10.8 NOTOC summary on the flight read model: dangerous goods count, cargo-aircraft-only count, special load count, highest cold chain risk, acknowledgement state per stage
- [ ] 10.9 Feature: `features/flight/notoc.get.feature`, `notoc.acknowledge.feature` — issued at release, acknowledged by check-in, reissued and acknowledged by finish-boarding, the preliminary unchanged by reconciliation, the delta after a change and after none, "no dangerous goods" for a clean flight, RBAC, unreleased flight 404

## 11. Briefing and emergency (needs 10) — capability `discord-flight-briefing`

- [ ] 11.1 Special load summary block in the check-in briefing; the explicit "no dangerous goods loaded" line; omitted entirely where no cargo manifest exists
- [ ] 11.2 Briefing carries the summary and a link back to the flight only, never the per-shipment detail
- [ ] 11.3 Emergency declaration: fill `dangerousGoodsOnBoard` from the cargo manifest when the pilot supplies none, preserve an explicit value + unit spec for all three cases
- [ ] 11.4 Feature: `features/flight/emergency` extension and a briefing assertion for the special load summary

## 12. Definition of Done (applied inside every group)

- [ ] 12.1 Every command and query handler registered in the module's `providers`, every action in its `controllers`
- [ ] 12.2 Swagger descriptions on every new field and endpoint, including the statement that position designators are this system's convention
- [ ] 12.3 No code comments; domain enums PascalCase and separate from the Prisma enums, cast at the boundary
- [ ] 12.4 `npm run lint`, `npm run test` and the functional suite green
- [ ] 12.5 Seed data updated so that both the positioned and the degraded paths are exercised
