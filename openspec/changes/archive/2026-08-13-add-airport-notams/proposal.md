## Why

A SimBrief OFP arrives with the NOTAMs for every airport on the plan already parsed,
decoded, and HTML-highlighted — and today the import throws all of it away. The flight
briefing therefore stops at METAR/TAF: nothing tells a pilot that the taxiway they were
assigned is closed to their aircraft category, that an approach minimum was raised, or
that the runway they planned is out of service. That information is in the payload the
import already downloads.

`airport-weather` established the pattern for airport-scoped, externally sourced,
periodically replaced data: a side table keyed by airport, filled by an upstream fetch,
read through a public `GET /api/v1/airport/:airportId/...` endpoint. NOTAMs fit it
exactly, with one difference — the source is the OFP that is already being parsed, not a
separate scheduled fetch, so ingestion is free.

## What Changes

- Add an `airport_notam` table: NOTAMs are stored per airport, many rows per airport.
- On `POST /api/v1/flight/create-with-simbrief`, ingest the NOTAMs the OFP carries for
  **every airport section it contains** — origin, destination, each destination
  alternate, the takeoff alternate, the enroute alternate, and each ETOPS suitable
  airport. Origin, destination, alternates and the enroute alternate are already imported
  as airports by the existing flow, so their NOTAMs always find their airport; sections
  the flight does not reference (takeoff alternate, ETOPS suitable airports) contribute
  NOTAMs only when their airport is already known, and are otherwise skipped — the NOTAM
  path never triggers an airport import of its own.
- Ingestion is a **replace, scoped to the airports in that OFP**: for each airport
  present in the plan, its stored NOTAMs are deleted and the plan's current set inserted,
  in one transaction. An airport that appears in the plan with an empty NOTAM list ends
  up with no rows — stale NOTAMs never linger. Airports absent from the plan are left
  untouched, so a concurrent import for another route cannot wipe them.
- Add `GET /api/v1/airport/:airportId/notam` — public, no authentication, mirroring the
  weather and runway read endpoints. It returns the airport's **currently valid** NOTAMs
  (no expiry, or an expiry in the future), newest effective first, and an empty array
  when the airport has none. An unknown airport id is `404`; a malformed one is `400`.

Data comes from the per-airport `notam[]` arrays nested under each airport section of the
OFP (`origin.notam[]`, `destination.notam[]`, …) — **not** from the top-level
`notams.notamdrec[]` list. The nested form is the only one carrying the requested
fields: it has `notam_html`, `notam_raw` and the decoded Q-code triple, its dates are
ISO 8601 rather than `YYYYMMDDHHMM` strings, and it is already scoped to an airport,
whereas the flat list mixes in FIR-level records (a sample OFP: 61 airport NOTAMs nested
vs. 805 flat records across 26 ICAO identifiers, most of them FIRs).

Stored fields, and where each comes from:

| Column          | OFP field                                                      |
| --------------- | -------------------------------------------------------------- |
| `airportId`     | resolved from `notam.location_icao`                            |
| `notamId`       | `notam_id` (e.g. `A3912/26`)                                   |
| `dateCreated`   | `date_created`                                                 |
| `dateEffective` | `date_effective`                                               |
| `dateExpire`    | `date_expire` — nullable, absent for NOTAMs with no stated end |
| `dateModified`  | `date_modified`                                                |
| `html`          | `notam_html`                                                   |
| `text`          | `notam_text`                                                   |
| `raw`           | `notam_raw`                                                    |
| `nrc`           | `notam_nrc` (`NOTAMN` / `NOTAMR` / `NOTAMC`)                   |
| `qcode`         | `notam_qcode` (e.g. `QMXLC`)                                   |
| `qcodeCategory` | `notam_qcode_category` (e.g. `Airport`, `Runway`, `SID`)       |
| `qcodeSubject`  | `notam_qcode_subject` (e.g. `Taxiway`)                         |
| `qcodeStatus`   | `notam_qcode_status` (e.g. `Closed`)                           |

`notamId` and `qcode` are additions to the requested field list: `notamId` is the only
stable identifier a NOTAM has, so it carries the uniqueness constraint and lets a client
display the reference pilots actually quote; `qcode` is the raw code the three decoded
columns are derived from. The requested `notam_*` prefixes are dropped from column names
where the table already says `notam` (`notam_html` → `html`), and the `date_*` names are
kept as given, camelCased.

No breaking API changes: one new endpoint, one new table, and a new side effect on an
existing import.

## Capabilities

### New Capabilities

- `airport-notams`: storing the NOTAMs of an airport, replacing them from an imported
  SimBrief flight plan, and serving the currently valid ones over a public read endpoint.

### Modified Capabilities

- _None._ `flight-fuel-planning` (which owns the SimBrief import contract) keeps its
  behaviour unchanged; NOTAM ingestion is an additional side effect of the same request
  and is specified entirely within `airport-notams`, the way `operator-crew` specifies
  its own SimBrief-triggered import.

## Impact

- **Schema/migration:** new `airport_notam` table with a `Airport` foreign key
  (`onDelete: Cascade`), unique on `(airportId, notamId)`, indexed on
  `(airportId, dateExpire)`. New `notams` back-relation on `Airport`.
- **`airports` module:** `AirportNotamsRepository`; `ReplaceAirportNotamsCommand` +
  handler; `ListAirportNotamsQuery` + handler; `ListNotamsAction`
  (`GET /api/v1/airport/:airportId/notam`); `GetAirportNotamResponse` model.
- **`flights` module:** `CreateFlightFromSimbriefHandler` collects the OFP's airport
  sections and dispatches `ReplaceAirportNotamsCommand` after the airports are imported.
- **`simbrief` provider:** `SimbriefNotam` type; `notam?: SimbriefNotam[]` on the OFP
  `Airport` type; the OFP type gains `takeoff_altn`, `enroute_station`, and
  `etops.suitable_airport`, which today are not modelled but do carry NOTAMs.
- **Seed:** new `prisma/seed/resource/notams.seed.ts`, loaded from `load-resources.ts`,
  giving one airport a mix of valid and expired NOTAMs and another none.
- **Mock:** `docker/mock/simbrief.json` OFP bodies gain nested `notam` arrays so the
  import path is exercised end to end.
- **Functional tests:** `features/airport/notam/airport.list-notams.feature` for the read
  endpoint, and assertions on the SimBrief import feature that NOTAMs land for the
  plan's airports and that a re-import replaces rather than duplicates them.
