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

- [x] 2.1 Migration: `aircraft.holdVariant` nullable string
- [x] 2.2 `resolveHoldVariant(aircraft, airframeType)` + unit spec: assigned variant wins, null falls back to the type default, uncurated type resolves to nothing
- [x] 2.3 `AssignAircraftHoldVariantCommand` and `RemoveAircraftHoldVariantCommand`, rejecting a variant the type does not offer
- [x] 2.4 `PUT` and `DELETE /api/v1/operator/:operatorId/aircraft/:aircraftId/hold-variant`, `@Role(UserRole.Operations)`, following the nesting the cabin layout assignment already uses
- [x] 2.5 Add `holdVariant` to every aircraft read model; confirm aircraft create and edit ignore it
- [x] 2.6 Seed: assign the container-capable variant to one A320 and leave the rest defaulted, so both paths stay covered
- [x] 2.7 Feature: `features/aircraft/hold-variant.assign.feature` — assign, reject unknown variant, remove restores default, RBAC, `holdVariant` present on aircraft reads

## 3. Commodity catalogue (independent) — capability `cargo-commodity-catalogue`

- [x] 3.1 `data/cargo-commodities.json`: 100 entries across perishables, pharma, live animals, high tech, batteries, other dangerous goods, automotive and industrial, aerospace and AOG, consumer, valuables, human and restricted, mail, dry foodstuffs, outsize and project cargo
- [x] 3.2 Roughly 30 entries carry a `dg` block with a real UN number, proper shipping name, class, subsidiary risk, packing group, net quantity per package and cargo-aircraft-only flag
- [x] 3.3 `ercCode` derived per dangerous goods entry from the published drill chart (drill number from the hazard class, letters from the additional risks); `sourceNote` records the reasoning wherever a letter is a judgement call
- [x] 3.4 `model/commodity.model.ts` and the special handling code vocabulary as a domain enum in PascalCase
- [x] 3.5 `data/cargo-commodities.spec.ts` dataset invariants: exactly 100 entries; every entry has a name, at least one SHC, a density in 30–2000 kg/m³, a piece range, a piece count range, an offload priority in range, at least one month and at least one source tier; every SHC is in the vocabulary; every `dg` entry has a UN number, class and `ercCode`; `ercCode` matches `/^(?:[1-9]|1[01])[ACEFHILMNPSWXY]+$/` and its drill number equals the mapping for its hazard class; `heaviestPiece` present only on heavy or outsized entries
- [x] 3.6 `selectCommodities(departureAirport, month)` + unit spec for the resolution ladder: airport tier, country tier, continent tier, generic fallback never empty, out-of-season entry excluded, frequency weighting respected
- [x] 3.7 `commodityDensity` derived volume helper + unit spec proving cube-out below and weigh-out above the 369 kg/m³ break-even of an `AKE`

## 4. Cargo manifest generation (needs 1, 2, 3) — capabilities `flight-cargo-manifest`, `flight-fuel-planning`

- [x] 4.1 Migration: `flight_cargo_unit`, `flight_cargo_shipment` with their enums (`kind`, `contentClass`, `status`, `offloadReason`, `transferRole`) and indexes; unique `(flightId, positionDesignator)` where the designator is not null
- [x] 4.2 `model/awb.ts`: 11-digit air waybill number with a check digit equal to the serial modulo 7 + unit spec including a known-good example
- [x] 4.3 `model/uld.ts`: ULD type table with base, contour, volume, tare range and maximum gross weight; serial and owner code generation
- [x] 4.4 `model/cargo-packing.ts` single-pass packer + unit spec: tare consumes the same budget as freight; a unit stops at whichever of weight and volume binds first; the closing trim lands the total exactly on the tonnage; a remainder below the smallest sensible unit becomes a loose lot; two flights with the same tonnage and different densities need different unit counts
- [x] 4.5 Position assignment respecting accepted bases and contours, compartment weight limits and one unit per position + unit spec
- [x] 4.6 Shipper and consignee names via the existing faker dependency, locale resolved from the departure airport's country then continent
- [x] 4.7 `GenerateFlightCargoManifestCommand`, dispatched from `mark-as-ready` alongside the passenger manifest
- [x] 4.8 `HoldCapacityExceededError` (422) on release when the tonnage exceeds the resolved variant's weight or volume; skipped for uncurated types
- [x] 4.9 Degraded path: an uncurated type generates units and shipments with no position and no compartment
- [x] 4.10 `GetFlightCargoManifestQuery` + `GET /api/v1/flight/:id/cargo-manifest` with a status filter, operations and the flight's captain, reporting weight per compartment; distinct responses for "not released", "no manifest" and "hold configuration unknown"
- [x] 4.11 Seed: cargo manifests across a widebody, a container-capable narrowbody, a bulk-only narrowbody, a freighter and an uncurated type
- [x] 4.12 Feature: cargo generation scenarios in `features/flight/actions/flight.mark-as-ready.feature` (generation has no endpoint of its own, so it is tested where it is triggered) and `features/flight/cargo-manifest.get.feature` — the tonnage invariant, no duplicate positions, no compartment over its limit, bulk-only carries no ULD, uncurated type carries no positions, over-capacity 422, RBAC. Contents are asserted by shape, counts and invariants rather than whole bodies, because they are generated

## 5. Shipment journey (needs 4) — capability `cargo-shipment-journey`

- [x] 5.1 Origin, destination, transfer role, onward carrier, onward flight number and connection minutes on `flight_cargo_shipment`
- [x] 5.2 `model/shipment-journey.ts`: the four transfer roles derived from comparing origin against departure and destination against arrival + unit spec covering all four
- [x] 5.3 Beyond-point selection weighted by the arrival airport's region, using the existing airport reference data
- [x] 5.4 Air waybill prefix by role: the operator's own prefix for cargo raised here, another carrier's for an inbound transfer + unit spec
- [x] 5.5 Unit grouping by onward destination ahead of every other grouping key; single-destination units marked as transferring intact, mixed units as broken down + unit spec
- [x] 5.6 Tight-connection flag below the transfer minimum
- [x] 5.7 Journey fields asserted where they are observable: the full unit and shipment contract in `features/flight/cargo-manifest.get.feature`, and the manifest-level transfer counts in every cargo scenario of `features/flight/actions/flight.mark-as-ready.feature`. Role distribution, sealing and prefix-by-role are unit-tested, being generated values a feature cannot pin

## 6. Special handling and dangerous goods (needs 4) — capability `cargo-special-handling`

- [x] 6.1 `dangerousGoods` JSON block on a shipment, populated from the commodity's `dg` entry
- [x] 6.2 `model/cargo-aircraft-only.policy.ts`: one predicate on the loadsheet's passenger count, applied by withholding restricted commodities from the offered pool rather than by raising an error, at generation and reconciliation + unit spec covering freighter, passenger flight, empty passenger aircraft and freighter carrying passengers
- [x] 6.3 `model/segregation.policy.ts`: the segregation matrix (radioactive against live animals and film, infectious against foodstuffs, dry ice against live animals, oxidizers against flammable liquids, human remains against foodstuffs) + unit spec per pair, both orders
- [x] 6.4 Heated and ventilated compartment requirements honoured at placement; a load with no suitable compartment is not carried + unit spec
- [x] 6.5 Dry ice quantity totalled per compartment
- [x] 6.6 A passenger flight carrying no cargo-aircraft-only load asserted in `features/flight/actions/flight.mark-as-ready.feature`; the dangerous goods block and dry ice per compartment asserted in `features/flight/cargo-manifest.get.feature`. Segregation and compartment suitability are unit-tested, being placement decisions no endpoint exposes directly

## 7. Cold chain (needs 6) — capability `cargo-cold-chain`

- [x] 7.1 `temperatureControl` JSON block on a shipment: regime, range, solution, endurance, set point where active
- [x] 7.2 `model/cold-chain.ts` exposure across build-up, flight, connection and onward flight; margin; risk level + unit spec at each boundary
- [x] 7.3 Deterministic explanation generated from the assessment's own inputs + unit spec asserting the whole sentence
- [x] 7.4 Ambient temperature at the exposed airport folded in from the existing airport weather, and omitted cleanly when unknown + unit spec
- [x] 7.5 Active solution preferred over passive where exposure would exceed a passive endurance
- [x] 7.6 Assessment is advisory: it blocks no release, no loading and no boarding completion
- [x] 7.7 Cold chain asserted where it is observable: the assessment on the enumerated shipment and the worst risk aboard in `features/flight/cargo-manifest.get.feature`, and a release that succeeds while carrying at-risk load in `features/flight/actions/flight.mark-as-ready.feature`. Risk boundaries and the generated explanations are unit-tested, being values a feature cannot pin

## 8. Baggage (needs 4) — capabilities `baggage-containerisation`, `flight-fuel-planning`

- [x] 8.1 `model/baggage.ts`: residual from payload less passengers at 84 kg less cargo; bags at 15/16/18 kg by `greatCircleDistance` + unit spec at each tier boundary
- [x] 8.2 Graceful fallback instead of a rejection: a negative or implausible residual derives the baggage from the passenger count, and the manifest reports which source it used. No loadsheet is rejected for its baggage allowance, because the seeded fleet shows a payload stated as passengers plus cargo alone is a legitimate way to fill one
- [x] 8.3 Baggage units containerised where positions exist and loose where they do not; `contentClass` and `bagCount` on the unit
- [x] 8.4 Premium cabin baggage in its own unit marked priority, from the loadsheet's per-cabin breakdown; no priority unit on a single-class flight
- [x] 8.5 Baggage excluded from the cargo invariant but included in compartment weight limits + unit spec
- [x] 8.6 No seeded loadsheet needed correcting: 10 of 40 leave no baggage allowance and now fall back to a derived baggage weight instead of being rejected. `AF2017` gained a cabin breakdown so the priority-baggage path is exercised
- [x] 8.7 Baggage asserted where it is observable: reconciled, derived and no-passenger cases in `features/flight/actions/flight.mark-as-ready.feature`, and the unit-level bag count and priority flag in `features/flight/cargo-manifest.get.feature`. Sector-length bag masses, the plausibility band and the placement invariants are unit-tested

## 9. Reconciliation (needs 6) — capability `cargo-manifest-reconciliation`

- [x] 9.1 `model/cargo-reconciliation.ts` plan: offloads in ascending offload priority, heaviest first within a priority, additions to close a shortfall, never offloading the highest priority + unit spec. A whole-shipment offload usually overshoots, so the plan reports the overshoot as an addition and the manifest lands on the tonnage exactly without touching a shipment that stays
- [x] 9.2 `offloadReason` and the position the shipment left recorded per offloaded shipment; offloaded shipments retained, never deleted; a unit emptied by offloading frees its position and drops to zero tare and gross, so it stops counting against the tonnage while still carrying its offloaded freight
- [x] 9.3 A final tonnage below the weight of the shipments that may not be offloaded is rejected as unprocessable
- [x] 9.4 Added shipments observe every generation rule: `planCargoLoad` now accepts the hold's existing occupancy — positions taken, weight already in each compartment, special handling already loaded there — so cargo-aircraft-only, segregation, compartment environment, position compatibility and compartment limits all apply to an addition exactly as they do at generation
- [x] 9.5 `ReconcileFlightCargoManifestCommand`, dispatched from `finish-boarding` alongside the passenger reconciliation
- [x] 9.6 Hold weight and volume capacity rejected on the final loadsheet, skipped for uncurated types. `InconsistentPayloadError` is not implemented: group 8 established that a payload which cannot account for baggage falls back to a derived figure rather than being rejected, and the reconciliation spec carries no payload-consistency requirement
- [x] 9.7 Feature: reconciliation has no endpoint of its own, so it is tested where it is triggered — `features/flight/actions/flight.finish-boarding.feature` (lower tonnage offloads by priority, higher adds without disturbing what is aboard, unchanged leaves the whole manifest byte-identical, below the protected load 422, over capacity 422, neither finishing boarding, uncurated type reconciles without positions) — and where it is read, `features/flight/cargo-manifest.get.feature` (offloaded shipments listed with reason and the position they left, loaded filter excluding them). Seed: `cargo-manifests.seed.ts` hand-writes a four-container manifest on a released B77W and a positionless one on an uncurated type, so the offload order is asserted against known freight rather than generated freight

## 10. Notification to captain (needs 7, 9) — capability `dangerous-goods-notification`

- [x] 10.1 Migration: `flight_notoc` with `stage`, `issuedAt`, `document` JSON, `acknowledgedById`, `acknowledgedAt`, unique `(flightId, stage)`
- [x] 10.2 `model/notoc.ts` document composition: dangerous goods section, other special loads section, cold chain section marked advisory, load summary section; "no dangerous goods loaded" where none are, stated in as many words rather than left empty. A dangerous goods shipment is never repeated in the special loads section, and a unit emptied by offloading is left out of the unit counts
- [x] 10.3 Drill text per emergency response code from the published chart — inherent risk, risk to aircraft and occupants, spill and fire-fighting procedure — reported alongside each dangerous goods entry, with one additional risk per drill letter. Unit spec asserts every dangerous goods entry in the catalogue resolves to a drill and that its drill number matches the hazard class
- [x] 10.4 `IssueNotocCommand` dispatched from `mark-as-ready` for the preliminary stage and from `finish-boarding` for the final stage, after the manifest work in each. A released flight with no cargo manifest at all still gets a document, so the "every released flight" rule holds
- [x] 10.5 Acknowledgement recorded from the existing transitions: the preliminary at `check-in`, the final by the `finish-boarding` request itself. No new endpoint and no new request field
- [x] 10.6 `model/notoc-delta.ts` between the two stored snapshots: dangerous goods and special loads added or removed, shipments repositioned, tonnage and deadload change + unit spec including the no-change case
- [x] 10.7 `GetFlightNotocQuery` + `GET /api/v1/flight/:id/notoc` with an optional stage, defaulting to the latest issued; operations and the flight's captain. Lives in its own `notoc` module, reading the cargo manifest over the bus through a new `GetFlightCargoLoadQuery` that carries no actor check, so the RBAC-guarded manifest query stays the only place the captain rule is applied
- [x] 10.8 `hasNotoc` flag on the flight read model rather than a counts-and-acknowledgement summary: the dedicated endpoint already serves all of that, and a flight only lacks a notification before it is released, so a flag is the whole of what the read model can usefully add
- [x] 10.9 Feature: acknowledgement has no endpoint of its own, so it is tested where it happens — `features/flight/actions/flight.check-in-pilot.feature` (checking in acknowledges the preliminary document while leaving the document itself untouched) and `flight.finish-boarding.feature` (the final document issued, acknowledged and reporting what changed; a reconciliation that changed nothing reporting none). Issuance at release is asserted in `flight.mark-as-ready.feature`, and reading in `features/flight/notoc.get.feature` — a document carrying dangerous goods asserted in full, "no dangerous goods loaded" for a clean flight, the preliminary unchanged by reconciliation, RBAC for operations, the captain, another pilot and an anonymous caller, an unreleased flight 404 and an unknown stage 400. The seeded freighter manifest makes every one of those an exact assertion rather than a wildcard

## 11. Briefing and emergency (needs 10) — capability `discord-flight-briefing`

- [x] 11.1 Special load summary block in the check-in briefing; the explicit "no dangerous goods loaded" line where nothing notifiable is aboard; omitted entirely where no cargo manifest exists. The counts come from one `GetNotifiableLoadSummaryQuery` in the notoc module, derived from the same composition the document uses, so the briefing and the document can never disagree
- [x] 11.2 Briefing carries the summary and a pointer to the flight only, never the per-shipment detail — asserted negatively against an air waybill, a proper shipping name and a shipment description
- [x] 11.3 Emergency declaration: `dangerousGoodsOnBoard` became optional, filled from the loaded shipments' hazard classes when the pilot supplies none and kept verbatim when they do — an explicit empty array included, since a pilot declaring none is stating something. `model/emergency-dangerous-goods.ts` maps hazard classes onto the declarable classes, collapsing the gas and flammable-solid divisions, with a unit spec covering all three cases and asserting every hazard class maps
- [x] 11.4 Feature: three briefing scenarios in `features/flight/actions/flight.check-in-pilot.feature` (carrying dangerous goods, carrying nothing notifiable, and no cargo manifest at all) and three in `features/flight/emergency/flight.declare-emergency.feature` (filled, preserved, and none aboard). Seed: a clean-load flight in `ready` for the "nothing notifiable" briefing, plus manifests on the two flights the emergency features already fly — one carrying class 3 and class 9, one carrying nothing hazardous — sized to the tonnage their loadsheets already declare. A `not containing` step was added to the Discord context, since "the briefing omits the summary" had no way to be expressed

## 12. Definition of Done (applied inside every group)

- [x] 12.1 Audited across the whole repository, not just this change: all 206 CQRS handlers appear in a module's `providers` and all 145 actions in a `controllers`, the `manifest` module's own 17 handlers and 5 actions included
- [x] 12.2 Every field of the 23 API-shaped classes carries an `@ApiProperty`, and all five endpoints carry a summary and a description. The designator convention was stated on the hold-layout and cargo-manifest endpoints but not on the notification to captain, which prints positions of its own — added there, on both its position fields and its endpoint description
- [x] 12.3 No comment survives in anything this change wrote; the one JSDoc left in a touched file predates it (PR #145, on `resolvePilots`) and was left alone. All 30 domain enums declare PascalCase members, none re-exports a Prisma enum, and Prisma types stay inside the repositories and the two write-boundary mappers that cast at the edge
- [x] 12.4 `npm run lint`, `npm run format`, 733 unit tests and 1233 functional scenarios green; the Swagger document builds and serves all six paths and the ten new schemas
- [x] 12.5 Both paths are seeded and exercised. Positioned: a widebody with four containers, a freighter on an explicit non-default variant loading a main deck, and two more widebodies carrying the emergency fixtures. Degraded: two flights on an uncurated type, every unit a loose lot with no position. Generation at release covers the same spread — widebody, container-capable A320 on `a320-cls`, bulk-only B738, freighter on `b74f-nose`, and the uncurated type
