## Context

See proposal.md — Why. What matters for the approach is where the current generator draws its
limits. `capacityOf` sums every compartment's weight and volume into one hold-wide figure used
once, at release, against the cargo tonnage alone and at a maximum plausible density of
2000 kg/m³. From there on, placement is weight-only: `headroomOf` subtracts the weight already
in a compartment from that compartment's maximum, and both the cargo bulk lots and the baggage
lots are sized against it. A compartment's `volumeM3` is read only for the hold-wide sum and for
display. Cargo is planned first and takes every ULD position and all the loose weight it needs;
baggage is planned afterwards from what is left, and when nothing is left it becomes a lot with
no deck and no compartment — the same shape the manifest uses to say "this airframe type is
uncurated".

Two invariants constrain every option below. The manifest's cargo weights must sum to the
loadsheet's cargo tonnage exactly, and a curated aircraft must place everything it carries. They
can conflict: a tonnage of low-density freight can be unplaceable in a hold whose weight limits
would accept it. Something has to give, and the spec now says it is the release.

## Goals / Non-Goals

**Goals:**

- One residual per compartment — weight and volume — consulted by every placement decision.
- Baggage that is known before the cargo is planned reserves the room it needs, rather than
  competing for leftovers.
- An unplaceable load fails loudly at release instead of producing an impossible manifest.
- A dangerous goods rate defensible against how often hazardous freight actually flies, enforced
  by a test rather than by whoever last edited the catalogue.

**Non-Goals:**

- Weight and balance. Compartment volume is a container constraint, not a trim calculation; no
  arms, no index, no %MAC, as before.
- Geometry inside a compartment. A compartment is a weight budget and a volume budget; we do not
  pack shapes.
- Rewriting the ULD position model. Positions, bases and contours stay as they are.
- Making the release check cheap. It plans the load to decide; see the first decision.

## Decisions

### A compartment is a pair of residuals, not a weight

`headroomOf` becomes a residual over both dimensions, and every caller — `bulkLots`,
`planBaggageUnits` and the ULD placement in `planCargoLoad` — subtracts from both. A loose lot's
size is then the smaller of what the weight allows and what the volume allows at the commodity's
own density, rather than the weight alone.

The alternative was to place by weight as today and shrink afterwards where a compartment came out
over volume. Rejected: shrinking breaks the tonnage invariant, and the kilograms removed have
nowhere to go — which is precisely how a 4.72 m³ load ends up in a 4.1 m³ compartment and how
1,299 kg of bags end up nowhere.

### Density is a placement input, not a consequence

Where a compartment's volume is the binding constraint, the draw prefers a commodity dense enough
to fit the remaining volume, using the density the catalogue already carries. This mirrors how a
load controller fills a tight bay, and it keeps the tonnage invariant satisfiable far more often
than an unbiased draw does.

Where even the densest admissible commodity will not fit, the planner re-draws a bounded number of
times before giving up, because the density that made the load unplaceable was itself drawn. Only
after that does it refuse.

### The release check plans the load rather than estimating it

The hold-wide weight and volume check stays where it is — at the loadsheet write, as the cheap
guard that catches the grossly impossible early. The release, though, decides by planning: if the
planner cannot place the whole load, the release is refused with an error naming what did not fit.

The alternative was to compute a feasibility envelope from compartment volumes and a density band,
and keep the release check as arithmetic. Rejected: it duplicates the packing rules in a second
place that would drift, and it would still be wrong at the margin, because feasibility depends on
which commodities were drawn.

### Baggage reserves its room before the cargo is planned

The baggage plan is derived from the loadsheet, so it is known before any cargo exists. The planner
computes it first and **places** it first, into the compartment residuals and the occupied-position
set that cargo planning then reads. Reserving-then-filling and placing-first come to the same load,
and placing first needs no reservation bookkeeping: cargo simply sees a smaller hold.

Reserving positions is the part that matters on a narrowbody: the A320 CLS variant offers seven
AKH positions, and cargo took six of them before baggage was considered. Reserving first turns
"the bags have nowhere to go" into "the cargo has one position fewer", which is the correct
trade — bags are not optional.

The alternative was to keep planning cargo first and let baggage push cargo out where it must.
Rejected: it re-plans cargo after the fact, and the tonnage invariant makes that a rebuild rather
than an adjustment.

### The reported weights become tare-complete

`cargoKg` already includes cargo tare; `baggageKg` gains the tare of baggage containers, so the two
figures together account for every unit aboard. The NOTOC's deadload is the sum of the two and
therefore becomes complete in the same step; no new field, no shape change.

### Payload coherence is a loadsheet policy, not a cargo rule

The check belongs beside `assertFuelBreakdownConsistent` and `assertPassengerBreakdownConsistent`
in the flights module, applied on both write flows, throwing a typed unprocessable error. It is
deliberately a floor and not an equation: payload must be at least cargo plus passengers at the
standard adult mass, leaving whatever remains as baggage and mail. The derived-baggage fallback
stays exactly as it is — a payload can pass this floor and still leave an implausibly small
residual, which is the case the fallback exists for.

### The dangerous goods rate lives in the catalogue, guarded by a test

The `frequency` values on the thirty dangerous goods entries come down, and the entries that claim
a source _airport_ they only hold by being hazardous lose it — that tier multiplies a draw weight
by four, which is how paint, aerosols, perfumery, fire extinguishers, compressed oxygen, oxygen
generators and spirits came to dominate a Paris departure. A colocated test then walks every
seeded airport and every month and asserts the dangerous goods share of the offered weight stays
under a tenth, so a later catalogue edit cannot quietly undo it.

The alternative was a dangerous goods multiplier applied in `offeredCommodities`. Rejected: the
catalogue is meant to be readable and extendable by a non-programmer, and a hidden coefficient
would make its `frequency` numbers lie about what they do. The per-flight ceiling is the one piece
that has to be code, because it is a property of a manifest rather than of the catalogue.

Implementation revised two parts of this. First, whole-number frequencies cannot express the
target: with thirty hazardous entries in a hundred-entry catalogue, a floor of one still leaves
them a sixth of a thin airport's offered weight. `frequency` is a draw weight, not a count, so it
now takes fractional values — the hazardous entries sit at 0.15 of their former weight, which
holds the offered share under a tenth at every seeded airport in every month, worst case 5.7%.
That keeps the number in the JSON honest rather than correcting it behind the reader's back.

Second, the ceiling applies only to a flight carrying passengers. A freighter is a hazardous
cargo carrier by design — the seeded 747 freighter carries paint, lithium batteries and dry ice,
which is an ordinary day's load — and capping it would have made the fixture fleet less truthful,
not more. On a freighter the rate is held by the catalogue alone, which measurement puts at about
one hazardous consignment in twenty units.

## Risks / Trade-offs

- **Releases that used to succeed now fail.** → The refusal is the point, but it must not be
  capricious: the bounded re-draw, the density-biased draw and the baggage reservation together
  mean only a genuinely overloaded hold refuses. The error names the shortfall so operations can
  lower the tonnage.
- **Reserving bag positions costs cargo positions on narrowbodies.** → Cargo shifts into loose
  compartments and the manifest carries more bulk lots. The tonnage invariant is unaffected; the
  load simply looks more like a real narrowbody belly.
- **Fewer dangerous goods means the NOTOC is exercised less by accident.** → Three seeded flights
  carry hazardous consignments on purpose — the 747 freighter at three, two passenger flights at
  two each — so the notification, the briefing summary and the emergency drill stay covered by
  intent rather than by luck.
- **The payload floor rejects loadsheets clients previously got away with.** → It is a 422 naming
  the shortfall, and the seeded loadsheets must be checked against it before this ships; the
  desktop companion needs to surface the message rather than treat it as a generic failure.
- **Planning at release costs more than arithmetic.** → It already runs there; the check reuses
  that plan rather than adding a second pass.

## Migration Plan

No schema change and no migration: the tables already hold everything, the difference is what may
be written into them. Seeded cargo manifests are regenerated under the new rules, which lowers
their dangerous goods counts and moves some cargo from containers into bulk lots — the feature
expectations that name those counts move with them. A development database seeded before this
change may still hold a positionless baggage lot on a curated aircraft; reseeding clears it, and
nothing reads such a row in a way that breaks.
