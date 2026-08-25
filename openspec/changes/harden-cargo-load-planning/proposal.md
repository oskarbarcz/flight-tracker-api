## Why

Releasing a flight with 7 t of cargo and 188 passengers on an A320 produced a hold that cannot
exist: a bulk compartment filled to 4.72 m³ against a 4.1 m³ limit, and 87 bags — 1,299 kg —
written with no deck and no compartment at all, which is the shape reserved for an airframe
type the catalogue does not know. The same flight drew five dangerous goods consignments out of
eight, because 22% of the commodity catalogue by draw weight is dangerous goods where the real
figure is a few percent. None of it was caught, because the generator only ever checks weight,
the loadsheet that triggered it was itself impossible, and no requirement states how often
hazardous freight should appear.

## What Changes

- A compartment's volume becomes a limit the generator observes, not a figure it only reports.
  Loose lots — cargo and baggage alike — are placed against remaining volume as well as
  remaining weight.
- Baggage that cannot be placed in the hold stops becoming a positionless lot. Where the
  airframe type is curated, every unit carries a deck and a compartment or the release is
  refused; the positionless manifest returns to meaning exactly one thing — no curated hold data.
- The cargo tonnage a release is checked against becomes the whole deadload — cargo and the
  baggage the same loadsheet implies — so a tonnage that leaves the bags nowhere to go is
  rejected at release rather than discovered on the manifest.
- The manifest's reported totals account for every kilogram aboard: a baggage container's tare
  is currently in neither `cargoKg` nor `baggageKg`.
- A preliminary or final loadsheet whose payload cannot contain its own cargo and passengers is
  rejected as unprocessable, instead of being accepted and silently forcing the derived-baggage
  fallback.
- Dangerous goods become as rare on a manifest as they are in a real hold: the catalogue's draw
  weights are recalibrated and a per-flight ceiling caps how many consignments may be hazardous.
- Temperature regimes stop being mixed within a compartment. A bay holds one climate, so a frozen
  and a cool consignment are separated unless each travels in a container that controls its own.
- The manifests are generated from the preliminary loadsheet rather than at release, and
  regenerated on every later write, so what the hold reports can never describe a loadsheet the
  flight no longer has. Releasing becomes a state transition.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `flight-cargo-manifest`: compartment volume becomes a limit generation observes; a positionless
  unit is admissible only where the airframe type has no curated hold data; the reported weights
  account for every unit's tare.
- `baggage-containerisation`: baggage occupies the hold by volume as well as by weight, and
  baggage that will not fit is a release failure rather than an unplaced lot.
- `flight-fuel-planning`: a loadsheet whose payload is smaller than its cargo plus its passengers
  at the standard adult mass is rejected as unprocessable.
- `cargo-commodity-catalogue`: the share of the offered pool that is dangerous goods is stated and
  bounded, and a flight carrying passengers carries few hazardous consignments.
- `cargo-cold-chain`: a compartment carries one temperature regime unless the freight travels in
  containers that maintain their own.
- `flight-manifest`: the passengers are seated when the preliminary loadsheet is written, and
  reseated on every later write.
- `dangerous-goods-notification`: the preliminary notification is issued from the preliminary
  loadsheet and reissued unacknowledged whenever that loadsheet changes.

## Impact

- `src/modules/manifest/model/cargo-packing.ts` — `headroomOf`, `bulkLots` and `planBaggageUnits`
  gain volume as a placement dimension; the positionless baggage fallback is removed.
- `src/modules/manifest/model/hold-capacity.ts` — capacity is computed per compartment, not only
  as a hold-wide aggregate.
- `src/modules/manifest/application/command/generate-flight-cargo-manifest.command.ts` and
  `reconcile-flight-cargo-manifest.command.ts` — the capacity check covers cargo plus baggage.
- `src/modules/manifest/application/query/get-flight-cargo-load.query.ts` — `cargoKg` and
  `baggageKg` become tare-complete.
- `src/modules/manifest/data/cargo-commodities.data.json` — dangerous goods draw frequencies and
  source tiers recalibrated; `src/modules/manifest/model/commodity-selection.ts` gains the cap.
- `src/modules/flights/application/command/update-preliminary-loadsheet.command.ts` and
  `finish-boarding.command.ts` — payload coherence check on both loadsheet write flows.
- `prisma/seed/resource/cargo-flights.seed.ts` and `cargo-manifests.seed.ts` — seeded manifests
  are regenerated under the new rules; their dangerous goods counts fall.
- No database migration: no schema change, only what may be written into it.
