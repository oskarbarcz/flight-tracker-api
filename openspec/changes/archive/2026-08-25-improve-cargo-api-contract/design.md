# Design — Cargo API Contract

## Context

See proposal.md — Why. What matters for the approach is where the information already lives.

The special handling codes are already a domain enum (`SpecialHandlingCode`, 57 members). The
commodity identifiers are already a curated dataset of 100 entries loaded at start-up. The
segregation rules are already a matrix, recently rewritten in terms of code families
(`FOODSTUFF_CODES`, `LIVE_ANIMAL_CODES`, `RADIOACTIVE_CODES`) so a pair no longer has to be
enumerated by hand. None of the four documentation gaps needs new knowledge — each needs an
existing fact carried into the published document.

The fifth gap is different in kind. `@ApiProperty({ nullable: true })` with no `type` gives Nest
nothing to reflect, so it emits `type: object`. That is not a cargo problem: it is 133
properties across ten modules, and the cargo ones are simply where somebody finally looked.

```
untyped `object` properties in the served document
  cargo / NOTOC schemas ......  23
  everything else ............ 110
  total ...................... 133
```

## Goals / Non-goals

**Goals.** A client can read the published document and learn every value a closed-set field may
hold, and the real type of every nullable field. A conflict aboard is visible on the manifest.
The hold diagram renders for every type the fleet actually operates.

**Non-goals.** A cross-flight cargo query, an air waybill lookup, cargo socket events and cargo
statistics were all considered and dropped. A segregation *dictionary* endpoint was considered
and dropped in favour of per-flight advisories. No PDF rendering. No rotation-level aggregation.

## Decisions

### The enumerations are derived, never transcribed

`shc` is documented with the existing `SpecialHandlingCode` enum. `commodity` is documented with
an identifier list derived from the loaded catalogue at module evaluation, not a hand-written
copy. Adding a commodity to the dataset therefore updates the published contract by itself.

*Alternative considered*: a literal union transcribed into the DTO. Rejected — a second copy of
a hundred slugs that nothing keeps in step with the first.

### The advisory reports the pair, so the matrix computes pairs

`conflicts()` answers a boolean, which is the wrong shape for a document that has to name what
clashes. The policy gains a function returning the offending pairs for a set of codes, and
`conflicts()` becomes a thin "is that list non-empty". One rule table, two questions of it.

Advisories are computed per compartment over **loaded** shipments only, from the codes already
carried on each shipment row. Offloaded freight is out of the hold and cannot clash with what
remains.

*Alternative considered*: recomputing from the commodity catalogue by identifier. Rejected — the
shipment already stores its codes, and a manifest must describe what was loaded even if the
catalogue is edited afterwards.

### The advisory is expected to be empty, and that is the point

Generation refuses to place a conflicting pair, so a manifest the system built reports nothing.
The field earns its place on the loads it did not build: a seeded fixture, a hand-corrected
manifest, or a future path that writes shipments directly. Reporting "no conflicts" positively
is worth more than the field being absent, for the same reason the notification states that no
dangerous goods are loaded rather than omitting the section.

### Curating hold data is scoped by the fleet, not by ambition

Of the nine airframe types the fleet operates, eight are curated; `B788` is the one that is not.
The spec requirement is therefore fleet coverage, which is checkable, rather than "more types",
which is not. A dataset test asserts every type an aircraft is recorded as resolves to a layout,
so the catalogue cannot silently fall behind the fleet again.

*Alternative considered*: curating the twenty most common widebodies. Rejected as unfalsifiable —
there is no test that says when it is finished, and the degraded path exists precisely so that an
unknown type is handled.

### The untyped-object sweep is verified against the served document, not the source

The fix is mechanical — give every `@ApiProperty` that declares `nullable` an explicit `type`,
and give the two genuinely structured cargo fields (`heaviestPiece`, `changes`) real classes.
Grepping the source is unreliable, because what matters is what Nest emitted. The sweep is
therefore driven and verified by fetching the document and looking for properties that are
`object` with neither `properties` nor `$ref`, and a scenario keeps the count at zero.

*Alternative considered*: fixing only the 23 cargo properties. Rejected by the change's owner —
the same defect blocks every other client surface, and the sweep is the same work either way.

## Risks / Trade-offs

- **Enumerating the commodity catalogue makes the dataset part of the public contract** → that is
  the intent; the alternative is a slug the client cannot interpret. Removing a commodity becomes
  a contract change, which is correct and now visible.
- **A hundred-value enum is large in the document** → it is a flat list of short slugs, and it is
  what a client needs to build a label dictionary. Paginating or omitting it defeats the purpose.
- **Touching 133 decorators across ten modules risks a careless edit** → `@ApiProperty` is
  documentation only; request validation is `class-validator` and is not touched. The functional
  suite covers the response bodies themselves, so a wrong type in a decorator cannot change a
  served value, only its description.
- **A client that generated types from the old document will see nullable fields change from
  `object`/`unknown` to a real type** → strictly more information; code that compiled against
  `unknown` continues to compile.
- **The advisory is empty on every generated flight, so it is easy to believe it is broken** →
  the seeded fixture deliberately includes a conflicting compartment so the non-empty case is
  exercised, and the scenarios assert both.

## Migration Plan

No migration. Nothing stored changes, no seed reset is required, and every change is additive to
the response or corrective to its description. Rolling back is reverting the commit.
