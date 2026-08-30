## Why

An enrichment push is the single act that turns an uncurated airport into a curated one. It
reconciles the airport against OpenStreetMap in one reviewed pass — boundary shape, runways,
terminals, stands and gates — which is precisely the data the quality grade describes. Yet the
grade does not move. An airport that has just had its whole layout pushed still reads as `low`,
and `GET /api/v1/airport?dataQuality=low` — the way a curator finds outstanding work — keeps
handing that airport back as if nothing had been done to it.

The grade is only accurate today if whoever ran the enrichment also remembers to `PATCH` the
airport afterwards. Nobody does that reliably, so the one signal the system has about which
airports still need attention decays the moment the tool that fixes them is used.

## What Changes

- A push that **lands at least one change** grades the airport `flagship`. The airport has been
  reconciled against the source the curation workflow is built on; nothing more is expected of it.
- A push that writes **nothing** leaves the grade alone. Where every selected change was skipped —
  OpenStreetMap already agreed with the airport model — or failed on an unresolved dependency, no
  record changed and no claim about curation has been earned.
- The grade is raised outright, not stepped: an airport at `low` and one at `high` both come out
  of a successful push at `flagship`.
- The existing rule that the grade is an editorial judgement gains **one** carve-out, and keeps its
  substance otherwise. Adding a terminal, a runway or a shape by hand still never moves the grade,
  the grade still never recomputes itself from the data held, and operations can still set the
  grade back down afterwards — a push raises it, it does not pin it.

## Capabilities

### New Capabilities

None. The grade already belongs to an existing capability, and the enrichment endpoints it now
reacts to are unchanged.

### Modified Capabilities

- `airport-data-curation`: a completed OpenStreetMap enrichment push raises the airport's data
  quality grade to `flagship`, as the sole exception to the grade being a value only a person sets.

## Impact

- `src/modules/airports/application/command/osm/push-airport-osm-data.command.ts` — after the
  selected changes are applied, raises the grade when the tally records an added, updated or
  removed outcome.
- `features/airport/enrich/enrich.push.feature` — scenarios covering a push that lands, a push
  where everything is skipped, and a push where everything fails.
- API contract: unchanged. The push response keeps its shape; the new grade is observed by reading
  the airport.
- No effect on the pull endpoint — reviewing an airport against OpenStreetMap without pushing
  anything changes no record and no grade.
