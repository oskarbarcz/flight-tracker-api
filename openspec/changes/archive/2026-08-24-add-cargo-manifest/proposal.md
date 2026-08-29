## Why

The app knows how much freight a flight carries — one number on the loadsheet, `cargo`, in
tons — and nothing else. There is no container, no commodity, no shipper, no destination and
no hold. `add-passenger-accommodation` solved the equivalent problem for the cabin: a pilot
can now see who is aboard and where they sit. Below the floor there is still an integer.

There is also a document missing. A captain commanding a flight carrying dangerous goods must
be given written notification of what is aboard, where it is loaded and what to do if it goes
wrong — the NOTOC, required by ICAO Annex 18 and acknowledged by the pilot-in-command. The app
has a captain, a briefing channel and an emergency declaration that already asks the pilot to
type in which dangerous goods classes are on board. Everything is in place except the load
itself.

Unlike the cabin, there is no catalogue to mirror. AeroLOPA publishes 1601 real seat maps;
nothing comparable exists for cargo holds, and no public source gives per-position designators
for a given type. What _is_ public is the vocabulary: IATA's ULD type codes, IATA's special
handling codes, the UN dangerous goods list, and the emergency response drill chart. So this
change builds its reference data in the repository and takes its authenticity from using the
industry's own vocabulary correctly rather than from mirroring a provider.

## What Changes

- **Curate hold reference data per airframe type.** Decks, compartments, ULD positions with
  base-size and contour compatibility, per-compartment weight limits and bulk volume. Shipped
  as JSON in the repository with a dataset spec, covering the seeded fleet (`B77W`, `A339`,
  `B752`, `B738`, `A321`, `A320`, `A319`) and the ten freighter designators, extending toward
  the common widebodies. Types without data degrade rather than fail.
- **Hold configuration is a variant chosen per aircraft, not a fact about the type.** The
  cargo loading system is a fitted option: some A320s take `AKH` containers and some are bulk
  only, and a 737 never takes a ULD at all. A type therefore offers variants and an aircraft
  points at one, defaulting to its type's bulk variant.
- **Catalogue 100 commodities as extendable configuration.** One JSON entry per commodity
  carrying its IATA special handling codes, density, piece weights, temperature regime,
  dangerous goods block, offload priority, source airports/countries/continents and the months
  it moves in. Selection resolves airport → country → continent → generic, the same ladder the
  passenger name locale already uses. Roughly thirty entries carry real UN numbers.
- **Generate a cargo manifest when a flight is released.** Commodities plausible for the
  departure region and the month are drawn, packed into ULDs bearing real IATA type codes and
  serials, and assigned to hold positions. Each shipment carries an 11-digit air waybill number
  whose check digit is its serial modulo 7. Packing respects both maximum gross weight and
  volume, so a container of flowers cubes out at a third of its weight limit while a container
  of batteries fills a third of its volume.
- **The manifest sums to the loadsheet exactly.** Shipment gross weights plus ULD tare weights
  equal the loadsheet's cargo tonnage — the cargo counterpart of "occupied seats equals the
  passenger count".
- **A shipment's journey extends beyond the flight.** Origin and final destination are
  independent of the flight's own airports, so a shipment may be raised here, terminate here,
  arrive as an inbound transfer or pass through on its way somewhere else, with an onward
  carrier, flight number and connection time. ULDs built for a single beyond-point transfer
  intact; mixed ones are broken down on arrival.
- **Fill the hold with baggage too.** Baggage weight is the loadsheet residual —
  `payload − passengers × 84 kg − cargo` — converted to bags at the EASA standard mass for the
  sector length and containerised, with premium-cabin bags in their own container. On a
  narrowbody the bags load loose. A residual that cannot be reconciled is reported as an
  inconsistent loadsheet.
- **Flag cargo that may not fly with passengers.** Cargo-aircraft-only shipments are refused on
  any flight carrying passengers, at generation and at reconciliation. The gate keys on the
  passenger count, not on the airframe or the service type, because ICAO defines a cargo
  aircraft as one carrying cargo and no passengers — which correctly permits an empty
  passenger aircraft operating as a freighter.
- **Enforce segregation.** Radioactive material away from live animals and undeveloped film,
  infectious substances away from foodstuffs, dry ice out of a compartment holding live
  animals, oxidizers away from flammable liquids, human remains away from foodstuffs.
- **Assess the cold chain and show the reasoning.** Every temperature-controlled shipment
  reports its regime, solution, endurance, total exposure across the flight and its onward
  connection, the resulting margin, a risk level and a plain-language explanation of why.
- **Reconcile against the final loadsheet.** A lower final cargo figure offloads shipments in
  ascending priority order — apparel before insulin, and never a transplant organ — recording a
  reason and retaining the shipment. A higher figure adds shipments. Offloaded shipments are
  kept, never deleted, exactly as no-show passengers are.
- **Issue a NOTOC at each of the two stages the pilot already acts at.** A preliminary NOTOC is
  issued when operations releases the flight and acknowledged when the pilot checks in; a final
  one is issued and acknowledged by the request that finishes boarding. Both are immutable
  snapshots, and the final one reports what changed since the preliminary was accepted. No new
  endpoint acknowledges anything: the existing transition _is_ the acknowledgement.
- **Derive the emergency response code rather than looking it up.** ICAO Doc 9481's code table
  is paywalled, but the drill chart that defines the codes is public: a drill number for the
  inherent risk and letters for additional risks. Every dangerous goods entry's code is
  constructed from its hazard class and properties, and the dataset spec asserts the
  derivation.
- **Default the emergency declaration's dangerous goods from the actual load.** The pilot's
  explicit value still wins; omitting it now yields the classes genuinely aboard.

Behaviour change for existing callers: `mark-as-ready` and `finish-boarding` gain a 422 when
the cargo tonnage exceeds the hold's weight or volume capacity, and when the payload residual
cannot be reconciled. Both checks apply only to aircraft whose type has curated hold data.

## Capabilities

### New Capabilities

- `aircraft-hold-layout`: the curated per-type hold reference data — decks, compartments,
  positions, ULD compatibility, limits, variants — and reading it.
- `aircraft-hold-assignment`: choosing which hold variant an aircraft has, and the default
  applied when none is chosen.
- `cargo-commodity-catalogue`: the commodity dataset and how a commodity is selected for a
  route and a month.
- `flight-cargo-manifest`: generating the manifest at release — ULD build-up, positions, air
  waybills, the tonnage invariant — and reading it.
- `cargo-shipment-journey`: a shipment's origin and destination beyond this flight, its
  transfer role, its onward connection, and ULDs built for a beyond-point.
- `cargo-special-handling`: the IATA special handling code vocabulary, the dangerous goods
  detail, the cargo-aircraft-only gate and the segregation rules.
- `cargo-cold-chain`: temperature regimes, endurance against exposure, and the risk assessment
  shown to the pilot.
- `baggage-containerisation`: baggage derived from the loadsheet residual and loaded into the
  hold.
- `cargo-manifest-reconciliation`: reconciling the manifest against the final loadsheet, and
  the retained offloads that result.
- `dangerous-goods-notification`: the two-stage NOTOC, its acknowledgement through the existing
  lifecycle actions, its delta, and the drill guidance it carries.

### Modified Capabilities

- `aircraft-management`: an aircraft gains a nullable hold variant, surfaced on aircraft reads.
- `flight-fuel-planning`: the loadsheet's cargo tonnage is now limited by the hold's capacity,
  and its payload must reconcile against passengers, baggage and cargo.
- `discord-flight-briefing`: the briefing gains a special load summary when a flight carries
  dangerous goods or other notifiable loads.

## Impact

- **API**: new reads for the hold catalogue, a hold variant assignment action on an aircraft,
  the cargo manifest (filterable by status), and the NOTOC (per stage). No new action
  acknowledges a NOTOC — `check-in` and `finish-boarding` do it.
- **Schema**: `flight_cargo_unit` (a ULD or a loose bulk lot at a position),
  `flight_cargo_shipment`, `flight_notoc`; `aircraft.holdVariant`. Dangerous goods and
  temperature control are stored as JSON blocks on a shipment because they are read as blocks.
- **Reference data**: `cargo-holds.json` and `cargo-commodities.json` under the new module,
  each with a dataset spec in the style of `airframes.spec.ts`. `airframes.json` is untouched —
  it carries no weights or volumes, so hold capacity is new data rather than a derivation.
- **Dependencies**: none new. The faker library already added for passenger names generates
  shipper and consignee names, with locale resolved from the departure airport's country rather
  than the operator's hub.
- **Errors**: `HoldCapacityExceededError` (422), `InconsistentPayloadError` (422),
  `CargoAircraftOnlyViolationError` (422), `SegregationViolationError` (422),
  `HoldVariantNotFoundError` (404), `CargoManifestNotGeneratedError` (404 on manifest reads).
- **Tests**: unit specs for the packing loop, the tonnage invariant, the AWB check digit, the
  commodity resolution ladder, the baggage residual, the cold chain arithmetic, the segregation
  matrix, the ERC derivation and the offload ordering; features for generation, reconciliation,
  the manifest read and both NOTOC stages. Manifest assertions match on shape, counts and
  invariants rather than whole bodies, because the contents are generated.
- **Not in scope**: weight and balance. No compartment arms, index units, %MAC or trim — the
  manifest reports weight per compartment and nothing derived from where it sits. Rotations are
  also out: a shipment's journey is expressed on the shipment, and no ULD is carried from one
  leg to the next.
