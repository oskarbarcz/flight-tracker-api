# Design — Cargo Manifest

## Context

See proposal.md — Why. This section records only what was measured or verified before the
design was written, because several findings contradict the obvious approach.

### There is no catalogue to mirror, and one field is paywalled

`add-passenger-accommodation` could lean on AeroLOPA. Cargo has no equivalent. What was checked:

```
ULD type codes and dimensions .......... published, verifiable (the IATA ULD grammar)
IATA special handling codes ............ published, verifiable
UN numbers, proper shipping names,
  hazard classes, packing groups ....... published, verifiable
Cargo-aircraft-only restrictions ....... published (ICAO/IATA, 2016 lithium ban)
EASA standard passenger and bag masses . published
Compartment numbering (1/2 fwd,
  3/4 aft, 5 bulk) ..................... published
Per-position ULD designators ........... NOT published — airline load control manuals
Doc 9481 UN-number-to-drill-code list .. NOT published — paid ICAO publication
Aircraft Emergency Response Drill chart. published — the codes' construction rule
```

Two consequences shape the whole design.

**Position designators are ours.** Manufacturer airport-planning documents give loading
diagrams and counts, not designator strings, and those strings differ between operators
anyway. The design adopts an explicit convention — `<compartment><ordinal><side>`, giving
`11L`, `11R`, `12L`, `41P` for a full-width pallet and `BULK` for loose load — and states
plainly that it is a convention rather than a fact. This is the opposite of a seat designator,
where `12A` is real and canonical.

**Emergency response codes are constructed, not looked up.** Doc 9481 is four thousand
pre-computed answers, but the chart that computes them is public: a drill number 1–11 for the
inherent risk plus letters for additional risks (`A` anaesthetic, `C` corrosive, `E`
explosive, `F` flammable, `H` highly ignitable, `I` irritant, `L` other risk low or none, `M`
magnetic, `N` noxious, `P` toxic, `S` spontaneously combustible, `W` if wet gives off
poisonous or flammable gas, `X` oxidizer, `Y` infectious). Since this change invents its own
thirty dangerous goods entries, and therefore knows each one's class and subsidiary risks, the
code is derived from the published rule. The derivation was validated against an independently
sourced code: `UN1263 Paint, class 3, PG II → 3L` decomposes exactly as the chart predicts,
drill 3 "flammable liquid or solid" plus `L` "other risk low or none".

A trap worth recording, because it was hit while checking: **there are two unrelated systems
called ERG.** ICAO's aviation drill code is a digit plus letters (`3L`); the US
DOT/Transport Canada guide number is three digits (`128`), is freely available everywhere
online, and is the first thing a search returns. Printing a DOT guide number in a NOTOC column
would be exactly the sort of confidently wrong detail this design is trying to avoid, so the
dataset spec asserts the format and the class-to-drill mapping rather than trusting whatever
was copied in. The operational chart calls the field **ERC** (Emergency Response Code, column
15 of the NOTOC); IATA's own materials say "ERG code" for the same thing. `ercCode` is used
throughout.

### The number that makes the packer realistic

An `AKE` (LD3) has roughly 4.3 m³ of volume and a maximum gross weight of 1,588 kg, so its
break-even density is:

```
1588 kg / 4.3 m³ = 369 kg/m³

below it  →  cubes out    flowers at 120 kg/m³ fill the volume at 516 kg — 32% of MGW
at it     →  balanced     fresh salmon at 380 kg/m³
above it  →  weighs out   batteries at 900 kg/m³ leave 58% of the volume empty
```

Density per commodity is therefore not decoration. It is the single input that makes unit count
emergent — three containers per tonne of flowers, one per tonne of batteries — instead of
`ceil(tonnes / 1.588)` for everything.

### Container capability belongs to the airframe, not the type

The lower-deck cargo loading system is a fitted option. Some A320s take `AKH` containers, some
are bulk only, and no 737 takes a ULD at all. Hold *geometry* comes from the type; whether the
positions exist comes from the individual aircraft. Every aircraft, widebodies included, keeps
a loose-loaded bulk compartment.

### The lifecycle already has exactly two pilot actions

```
OPS                       PILOT                    PILOT
mark-as-ready             check-in                 finish-boarding
body: prelim loadsheet    body: Schedule           body: final Loadsheet
  |                         |                        |
  |- generate pax manifest  |                        |- reconcile pax manifest
  |- generate cargo manifest|                        |- reconcile cargo manifest
  \- issue PRELIM NOTOC     |                        \- issue FINAL NOTOC
                            \- acknowledges prelim      acknowledged by this request
```

Both pilot actions already carry a request body and both already emit an event carrying the
actor (`PilotCheckedInEvent`, `BoardingWasFinishedEvent`). Nothing needs adding to either
request for the pilot to accept a document, and the real-world rule that a reissued NOTOC must
be re-signed is exactly why there are two stages rather than one.

## Goals / Non-goals

**Goals.** A hold whose contents are believable for the route, the season and the aircraft. A
manifest that reconciles exactly to the loadsheet. A NOTOC a real load controller would
recognise, acknowledged where the pilot already acts. Reference data a non-programmer can
extend by editing JSON.

**Non-goals.** Weight and balance: no arms, no index units, no %MAC, no trim — the manifest
reports weight per compartment and derives nothing from where a unit sits, because the data to
do it properly is not available and doing it approximately is worse than not doing it.
Rotations: a shipment's onward journey is described on the shipment, and no ULD travels from one
leg to the next. A persistent ULD asset registry: serials are generated per flight and never
tracked between them. Individual piece tracking. Geometry inside a container.

## Decisions

### Hold data is code-shipped reference data, with no versioning

Cabin layouts needed `cabin_layout_version` and a pinned revision per flight, because a
manifest row referenced upstream data that could change underneath it. Hold data is ours and
ships in the repository, and a manifest row stores its position as a plain string. Editing
`cargo-holds.json` therefore cannot move an already-generated manifest, so none of the
versioning machinery has a counterpart here.

*Alternative considered*: a `hold_layout` table synchronised like the layout catalogue.
Rejected — there is no upstream to synchronise with, and it would invent a revision-pinning
problem that does not exist.

### A type offers variants; an aircraft points at one

`cargo-holds.json` is keyed by ICAO type and lists named variants. `aircraft.holdVariant` is a
nullable string; null means the type's declared default, which is always the bulk variant.

```
B738  →  b738-bulk                        only variant — honest about having no ULDs
A320  →  a320-bulk (default) | a320-cls    CLS fitted: AKH positions plus loose bulk
B77W  →  b77w-ld3 (default) | b77w-mixed   pallets forward, containers aft
B74F  →  b74f-nose | b74f-side             main deck loading door
```

*Alternative considered*: a boolean `containerCapable` on the aircraft. Rejected — it cannot
express the 767's LD2/LD3 choice or a freighter's door options, and it puts a capability flag
where a configuration name belongs.

### One table for ULDs and loose bulk

A ULD at position `12R` and a loose lot in the bulk hold are the same thing from the manifest's
point of view: a container of shipments at a location with a weight. `flight_cargo_unit`
carries `kind` (`uld` or `bulk_lot`); a bulk lot has a compartment but no position designator
and no ULD type, serial or tare.

*Alternative considered*: separate tables for containerised and bulk load. Rejected — every
read, every weight roll-up and every NOTOC section would have to union them.

### The cargo tonnage includes ULD tare, and the packer closes the gap

On a real loadsheet the traffic load includes the tare of the devices carrying it:

```
loadsheet.cargo × 1000  ==  sum of shipment gross weights  +  sum of unit tare weights
```

This is the cargo counterpart of "occupied seats equals the passenger count", and it has a
consequence the packer must respect: **opening a container reduces the cargo budget**, so unit
count and net cargo are mutually dependent and the loop is single-pass rather than
select-then-containerise. The last unit is left partly filled and the final shipment's piece
count is trimmed to close the gap exactly — which is also what real freight looks like.

*Alternative considered*: cargo as net weight with tare tracked separately. Cleaner arithmetic,
but it puts a number on the manifest that no real loadsheet carries.

### Baggage is the payload residual

```
baggageKg = payload − passengers × 84 − cargo       84 kg: EASA standard adult, incl. hand baggage
bags      = baggageKg / bagMass(distance)           15 / 16 / 18 kg by sector length
```

A negative or implausible residual means the loadsheet does not add up, and is reported as such
rather than clamped. This is a consistency check the loadsheet did not previously have.

*Alternative considered*: generating a bag count from the passenger count and ignoring the
payload. Rejected — it would let the manifest contradict the loadsheet, and the residual is
free.

### The cargo-aircraft-only gate keys on the passenger count

ICAO defines a cargo aircraft as one carrying cargo and no passengers, so the predicate is
`loadsheet.passengers === 0`, evaluated at generation and again at reconciliation through one
shared policy function. This correctly allows an empty passenger airframe operating as a
freighter, and correctly forbids CAO cargo on a freighter carrying paying passengers.

This does not break `flight-service-type`'s promise that the classification influences no other
behaviour: the passenger count drives the gate, not the service type.

*Alternative considered*: keying on `serviceType === cargo`, or on `AirframeServiceType`. Both
are wrong in the belly-freighter case, and the airframe one is also wrong for a freighter with
passengers aboard.

### The NOTOC is a stored snapshot per stage, not a projection

Reconciliation mutates the manifest, so deriving the preliminary NOTOC after boarding has
finished would produce a document the pilot never saw. `flight_notoc` stores one immutable row
per `(flightId, stage)` holding the rendered document as JSON plus who acknowledged it and
when. The delta on the final NOTOC is computed between the two stored snapshots.

*Alternative considered*: derive both on read from the manifest. Rejected — it makes the
preliminary document unrecoverable and the acknowledgement unprovable.

### Dangerous goods and temperature control are JSON blocks on a shipment

Both are read as whole blocks, both are absent on most shipments, and both carry eight to ten
fields. Flat columns would add twenty mostly-null columns to a hot table, and the project
already stores `loadsheets`, `timesheet` and `positionReports` as JSON.

*Alternative considered*: separate one-to-zero-or-one tables. Rejected — the join bought
nothing, since nothing queries across shipments by UN number.

### Hold weights and volumes are curated approximations, and say so

Published airport-planning documents give hold volumes and ULD counts per type; they do not
give per-compartment maximum weights, which live in airline weight-and-balance manuals. The
data therefore uses published total volumes and ULD counts where they are known, and derives
each compartment's maximum weight from its position count times the maximum gross weight of the
ULD it accepts. The result is internally consistent — compartment volume agrees with positions
times ULD volume, compartment weight agrees with positions times ULD weight — and in the right
ballpark against published totals, but it is curated data rather than manufacturer data and is
described as such wherever it is exposed.

*Alternative considered*: reading each type's airport-planning document before writing the
data. It would improve the totals for the types that publish them, but several publish no
per-compartment weights at all, so the derivation would remain either way.

### Commodity selection resolves by tiers, like the passenger name locale

```
departure airport IATA → country → continent → generic
  × the month falling in the commodity's declared months
  × its relative frequency weight
```

The faker locale for shipper and consignee names resolves from the *departure airport's*
country, where passenger names resolve from the operator's hub — the cargo was tendered where
the flight departs, not where the airline is based.

## Data model

### `cargo-holds.json` — reference data, keyed by ICAO type

```
type          B77W
variants[]    id, isDefault, decks[]
  deck        main | lower
  compartments[]  number, name, maxWeightKg, volumeM3, heated, ventilated, doorSide,
                  loading (uld | loose)
    positionTemplate?   rows, sides[], acceptedBases[], acceptedContours[], maxWeightKg
    positionOverrides?  designator + any template field to replace
```

`heated` and `ventilated` are what the live-animal rules read. `acceptedBases` and
`acceptedContours` are the second and third letters of the ULD grammar, which is what makes the
fuselage taper matter at the aft-most positions.

Positions are **declared as a template and expanded at load**, not enumerated. A widebody has
forty-odd of them and there are seventeen types to cover, so enumerating would mean some four
hundred near-identical hand-written objects. The template declares how many rows a compartment
has, which sides they occupy and what they accept; the expander applies the designator
convention in exactly one place, which makes uniqueness within a variant mechanically true
rather than something a test has to catch. Irregular positions — the aft taper accepting a
reduced contour only — are expressed as overrides on the template rather than as a second
mechanism for the regular case. A loosely loaded compartment simply declares no template.

*Alternative considered*: enumerating every position. Rejected for the volume of literal data
and because a mistyped designator would be invisible until a manifest collided on it.

### `cargo-commodities.json` — reference data, 100 entries

```
id, name, descriptions[]
shc[]                    IATA special handling codes
densityKgM3              drives cube-out versus weigh-out
piece { kgRange, packaging }, piecesRange
heaviestPiece?           HEA / BIG only — kg and dimensions, for the NOTOC
temperature?             regime (CRT | COL | FRO), minC, maxC,
                         solution (active | passive | dry_ice), enduranceHours
dg?                      unNumber, properShippingName, class, subsidiaryRisk, packingGroup,
                         netPerPackage, cao, ercCode, sourceNote
offloadPriority          1 shed first … 6 never
sources { airports[], countries[], continents[] }
demand { continents[] }
months[], monthPeak[]
frequency                relative draw weight
compartment { requiresHeated, requiresVentilated }
```

### Schema

```
flight_cargo_unit
  id, flightId, kind (uld | bulk_lot), deck, compartment, positionDesignator?,
  uldType?, uldSerial?, uldOwner?, tareKg?, grossKg,
  contentClass (cargo | baggage | mail), bagCount?, offpoint, beyondDestination?, sealed
  unique (flightId, positionDesignator) where positionDesignator is not null

flight_cargo_shipment
  id, flightId, unitId?, commodityId, description, awb, pieces, grossKg, volumeM3,
  shc[], shipper, consignee,
  origin, destination, transferRole, onwardCarrier?, onwardFlightNumber?, connectionMinutes?,
  dangerousGoods? (json), temperatureControl? (json),
  status (loaded | offloaded), offloadReason?
  index (flightId), index (flightId, status)

flight_notoc
  id, flightId, stage (preliminary | final), issuedAt, document (json),
  acknowledgedById?, acknowledgedAt?
  unique (flightId, stage)

aircraft.holdVariant  nullable string
```

`unitId` is nullable only for the degraded case where the aircraft's type has no hold data at
all and shipments therefore have nowhere to sit.

## Risks / Trade-offs

- **Position designators are invented** → stated as a convention in the spec and in the API
  description, never as a real-world fact. They are internally consistent and stable, which is
  all a client needs to draw a hold.
- **`ercCode` is derived, and two or three letter choices are judgement calls** (dry ice as `A`
  when it is strictly an asphyxiant; an environmentally hazardous substance with no natural
  letter) → each such entry records its reasoning in `sourceNote`, and the dataset spec asserts
  the drill number against the hazard class so a wrong number cannot survive. A wrong letter on
  a couple of thirty entries is the residual exposure.
- **The DOT-versus-ICAO confusion is easy to reintroduce** when someone extends the dataset →
  the format assertion rejects three-digit codes and unknown letters mechanically.
- **Hold data covers a fraction of 212 airframes** → the degraded path (shipments and units, no
  positions) is a first-class requirement with its own scenarios rather than an error, and the
  seeded fleet is fully covered so the positioned path stays exercised.
- **The packer must hit the tonnage exactly while respecting weight, volume, compatibility and
  segregation** → the closing trim applies to the last shipment's piece count, which on a very
  small tonnage could drive it to zero. Below the smallest sensible unit the load becomes loose
  bulk instead, which removes the tare term and makes the gap closable.
- **A hundred commodities is a lot of hand-written data to get right** → the dataset spec
  asserts the invariants that matter (every DG entry has a UN number, class and derived ERC;
  every entry has at least one source tier and one month; densities within 30–2000 kg/m³; every
  SHC in the vocabulary; offload priority in range), so a bad entry fails the build rather than
  reaching a manifest.
- **Cold chain risk is generated advice** → it is labelled advisory on the document, and it is
  deterministic, so a scenario can assert the whole sentence rather than matching loosely.
