## Context

See `proposal.md` § Why for motivation and `specs/airframe-service-type/spec.md` for the
behaviour contract.

Three pieces of current state shape the approach:

**Airframes are curated static data, not a table.** `src/modules/airframes/data/airframes.json`
holds 212 entries, loaded once by `data/airframes.ts` and cast to `readonly Airframe[]`;
`findAirframeByType` is a linear scan over that array. There is no Prisma model, so
"adding a field to an airframe" means editing the JSON and the model class — no migration,
and no per-operator override.

**The same axis is already named twice.** `Flight.serviceType` (`passenger | cargo`) and
`Operator.serviceType` (`passenger | cargo | both`) both describe what is carried, at the
leg level and the business level. The airframe is the third level of the same axis.

**The airframe payload is reused wherever an aircraft appears.** The `Airframe` model
class is what `GET /api/v1/airframe/{type}` returns and what the aircraft read embeds as
its resolved airframe, so a property added to the class reaches every one of those bodies
at once — including, via `features/_helper/deep-compare.ts`'s exact-key matching, every
full-body assertion over them.

## Goals / Non-Goals

**Goals:**

- Let a client tell a freighter from a passenger airframe without a hard-coded list.
- Use the vocabulary the API already uses for this axis at the flight and operator levels.
- Make an airframe added later fail loudly if it omits the value.

**Non-Goals:**

- Deriving or validating a flight's service type against its aircraft's airframe. A
  freighter can fly a positioning leg with passengers aboard, and an operator can run a
  passenger airframe as a cargo-only "preighter" charter; the three values stay
  independent.
- Filtering the airframe list by service type. The field is returned; no query parameter.
- Modelling seat or cargo capacity, or the difference between a combi and a full
  freighter. One classification per type designator is the whole scope.

## Decisions

### The value is named `serviceType`, with `passenger | cargo | both`

`AirframeServiceType { Passenger = 'passenger', Cargo = 'cargo', Both = 'both' }` in
`model/airframe.model.ts`, declared on `Airframe.serviceType` with `@IsEnum` and an
`@ApiProperty` that states the classification rule.

_Why:_ the name and the literals match `Operator.serviceType` exactly, so a client
reading an operator body and an airframe body sees one vocabulary for one concept.
`both` is needed here for the same reason it is needed on operators and not on flights: a
single leg carries one thing, but a type designator such as `C208` or `B738` covers
factory passenger and factory freighter variants that ICAO does not distinguish.

_Alternatives considered:_ a boolean `isFreighter` — rejected, it cannot express the
dual-role case that a third of the interesting airframes fall into. A nullable field for
"unclassified" — rejected, every airframe in the dataset has a knowable factory role, and
a null would push a tri-state into every consumer for no descriptive gain.

### Classification follows the factory role of the type designator

Designators that exist only as freighters (`B77F`, `B74F`, `B75F`, `B76F`, `A30F`, `MD1F`,
`A225`, `A3ST`) are `cargo` — ten entries. Utility and multi-role types delivered from the
factory for either passengers or freight (`C208`, `DHC6`, `PC12`, `L410`, `C130`, `IL76`,
`DC3`) are `both` — twenty-one entries. The remaining 181 are `passenger`.

_Why:_ the type designator is what the API stores on an aircraft, and ICAO already gives
jetliner freighters their own designator — a 777F is `B77F`, not `B772`. Classifying by the
factory role of the variants a designator covers is therefore both applicable to all 212
entries and the answer a client needs, since "can this type be dispatched with freight" is
the question being asked.

_Why not the conversion market:_ almost any airliner has been converted to a freighter by
somebody. Including conversions would drag most of the passenger jets into `both` and make
the field useless — a `B738` stays `passenger` even though 737-800BCFs fly every day. The
rule is deliberately about how the airframe leaves the factory.

_Consequence:_ `both` is concentrated in the turboprop and military-transport end of the
dataset, where one airframe genuinely does both jobs, and the jetliners split cleanly into
a passenger designator and a freighter designator.

### The dataset is guarded by a unit test, not by runtime validation

`data/airframes.spec.ts` asserts that every entry's `serviceType` is a member of the enum,
and pins three representative classifications (`B77F` cargo, `B772` passenger, `C208`
both).

_Why:_ the JSON is cast to `Airframe[]` at import time, so `@IsEnum` on the model never
runs against it — the decorator only guards request payloads. A test over the dataset is
the only thing that can catch a missing or misspelled value, and it catches it at build
time rather than on the first read of that airframe.

_Why pin three values:_ the membership check alone would pass a dataset where every entry
says `passenger`. The three pins make the classification rule itself regression-tested,
one per possible value.

## Risks / Trade-offs

**Full-body assertions break in bulk** → `deep-compare.ts` matches on exact key count, so
every assertion carrying an airframe body fails the moment the field exists. Thirty-odd
occurrences across the aircraft, flight, airframe, and user features; the task list treats
sweeping the field in as one explicit step rather than discovering them one failure at a
time under `failFast`.

**The classification is a judgement call per designator** → 212 entries were classified by
hand from the factory variants each designator covers. Some are arguable (regional
turboprops with quick-change interiors); the rule is stated in the spec and in the
`@ApiProperty` description so a later correction is a data edit against a written rule,
not a re-litigation.

**A stale cached airframe list** → `GET /api/v1/airframe` is cached for 24 hours under a
single key. After deploy, a client can read a body without the field until that entry
expires. Accepted: the field is additive, and the dataset never changes at runtime.

## Migration Plan

1. Add the enum and the property to `model/airframe.model.ts`.
2. Add `serviceType` to all 212 entries in `data/airframes.json`.
3. Add `data/airframes.spec.ts` and run the Jest suite — it fails on any entry missed in
   step 2.
4. Sweep the field into the affected `.feature` full-body assertions, then run the
   functional suite.

**Rollback:** remove the property and the field. Nothing persists it, so there is no data
to clean up; clients reading it get one fewer key.
