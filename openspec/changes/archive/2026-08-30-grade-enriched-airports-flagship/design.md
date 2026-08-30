## Context

See proposal.md — Why.

The push handler (`PushAirportOsmDataHandler`) rebuilds the proposal from the retained pull,
applies the selected changes one at a time, and answers for every key with an outcome of `added`,
`removed`, `updated`, `skipped` or `failed`. It already tallies those outcomes into `PushTotals`
for the response, and it already writes airport-level fields through `AirportsRepository.update`,
so both the signal and the write path this change needs are in place.

The grade lives on the airport row as `dataQuality`, defaulting to `low`. Nothing but an explicit
`PATCH /api/v1/airport/:id` has ever written it.

## Goals / Non-Goals

**Goals:**

- The raise is decided from the same tally the response reports, so what the caller is told landed
  and what the grade reacts to can never disagree.
- One extra write at most per push, and none at all when the push wrote nothing.

**Non-Goals:**

- Reporting the new grade in the push response. The response describes what happened to the
  selected changes; the grade is read from the airport.
- Grading anything other than `flagship`, or working out a grade from which records an airport
  holds. The spec keeps the grade off any derived footing.
- Any reaction to the pull endpoint, which writes nothing.

## Decisions

**The raise happens once at the end of the handler, driven by the tally.**
`added + updated + removed > 0` is exactly "at least one change landed", and it is already
computed for the response. The alternative — raising from inside each `apply*` branch, or having
the repositories emit something the airport listens for — spreads one rule across five code paths
and would fire on writes that have nothing to do with enrichment.

**The write goes through `AirportsRepository.update` with a `dataQuality`-only patch.**
`UpdateAirportResponse` is a partial, so every other column is left untouched by Prisma, and the
handler already uses this path for airport fields. A dedicated repository method would add a
second way to write one column for no gain.

**A failure to raise the grade fails the push.**
The airport row was read successfully at the top of the same handler, so a failure here is not an
expected condition the way an unresolved terminal reference is — it means the write path is broken.
Swallowing it would leave the airport reporting a grade the system knows to be wrong, which is
worse than a `500` on a push whose retained pull can simply be pushed again. Unlike a per-change
failure, this is not something the caller can act on by reselecting keys, so it does not belong in
`PushedChange`.

**`skipped` and `failed` do not count.** A skipped change means the external data already agreed —
no curation happened in this push, and grading on it would let a review of an untouched airport
mint a `flagship`. A failed change wrote nothing by definition. This also keeps the functional
suite honest: the existing scenarios that write already reset the database, and the ones that
write nothing must stay side-effect free.

## Risks / Trade-offs

**An airport can reach `flagship` off one trivial change** — pushing a single runway length
correction grades the whole airport top marks. → Accepted: the grade is a curation signal, not an
audit, and operations can lower it by hand. Gating on some notion of "enough" changes would put the
grade back on the derived footing the spec rules out.

**Re-pushing an airport whose grade was deliberately lowered raises it again.** → Accepted and
specified: a push raises the grade, it does not pin it. Anyone who lowers a grade after enriching
is recording a judgement about data the enrichment could not supply, and pushing again is a new act.
