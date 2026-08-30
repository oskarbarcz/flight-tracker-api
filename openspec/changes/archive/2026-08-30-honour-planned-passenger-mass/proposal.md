## Why

A pilot imports a SimBrief flight plan, changes nothing, and the first attempt to update the
preliminary loadsheet — or to finish boarding on the final one — is rejected with
`Payload of 22600 kg cannot carry 23628 kg of cargo and passengers.` The plan is not wrong. The
floor is.

Two things make an internally consistent OFP unplannable:

- The floor added by `harden-cargo-load-planning` measures every loadsheet against **our**
  standard adult mass of 84 kg. SimBrief's passenger mass is configured per airframe and is
  routinely lighter — the 1,028 kg shortfall above is exactly the passenger count multiplied by
  the difference between 84 kg and the mass the plan was built with. The plan's payload contains
  its own load precisely; it just never promised to contain ours.
- The import rounds every weight to 0.1 t. Payload can round down 50 kg while cargo rounds up
  50 kg, so up to 100 kg of shortfall is manufactured out of figures that reconciled exactly.

The import compounds it by writing the preliminary loadsheet straight to the repository without
ever running the policy, so the flight is created carrying a loadsheet the rest of the domain
already considers impossible. Nothing surfaces until the user touches it.

An imported flight plan is authoritative. It must never be rejected by a floor its own figures
cannot satisfy.

## What Changes

- A loadsheet carries the **per-passenger mass it was planned with**. At import that mass is read
  off the plan itself — the payload less its cargo, spread over the passengers — so the floor a
  SimBrief loadsheet is measured against is the one SimBrief used. A loadsheet with no plan behind
  it keeps the 84 kg standard adult mass.
- The payload floor measures against that mass instead of the constant. The requirement is
  unchanged in substance: a payload must still contain the cargo and the passengers it declares.
  Only the passenger mass stops being an assumption imposed on someone else's plan.
- The planned passenger mass is **system-derived, never client-supplied** — otherwise a request
  could name its own floor and defeat the check. It is set when the plan is imported, preserved
  across preliminary updates, and inherited by the final loadsheet.
- Imported weights keep kilogram precision instead of being rounded to the nearest 100 kg.
  `cargo` gains the third decimal place the other tonnages already have, so no field is the lossy
  one.

## Capabilities

### New Capabilities

None. The behaviour being corrected already belongs to an existing capability.

### Modified Capabilities

- `flight-fuel-planning`: the payload floor measures a loadsheet against the passenger mass it
  was planned with rather than a fixed standard adult mass, and weights imported from a flight
  plan are stored to the kilogram.

## Impact

- `src/modules/flights/model/loadsheet.model.ts` — `Loadsheet` gains a read-only
  `passengerMass`; `cargo` moves from 2 to 3 decimal places.
- `src/modules/flights/model/loadsheet.policy.ts` — `assertPayloadAccountsForLoad` reads the
  loadsheet's own passenger mass, falling back to `STANDARD_ADULT_KG`.
- `src/modules/flights/application/command/create-flight-from-simbrief.command.ts` — derives the
  passenger mass from the OFP; `ofpWeightToTons` stops rounding to 0.1 t.
- `src/modules/flights/application/command/update-preliminary-loadsheet.command.ts` and
  `finish-boarding.command.ts` — carry the stored passenger mass forward over whatever the
  request body claims, before the floor is asserted.
- API contract: `passengerMass` appears on the flight read and is ignored on write. No existing
  field changes meaning, and no currently accepted loadsheet becomes rejected.
- Depends on `harden-cargo-load-planning` being synced into `openspec/specs/`: the requirement
  this change modifies still lives in that change's delta.
