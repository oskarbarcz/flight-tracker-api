## Context

`CreateFlightFromSimbriefHandler` (`src/modules/flights/application/command/create-flight-from-simbrief.command.ts`)
downloads one OFP through `SimbriefClient.getOperationalFlightPlan(userId)` — the
`json=2` variant of `xml.fetcher.php` — and maps it into a flight: airports via
`ImportAirportByIcaoCommand`, runways, fuel, crew. `simbrief.types.ts` models only the
handful of fields that mapping needs; everything else in the payload is untyped and
unread.

The payload carries NOTAMs in two independent places:

- `notams.notamdrec[]` — one flat list for the whole plan. Fields are
  `notam_created_dtg` / `notam_effective_dtg` / `notam_expire_dtg` (or
  `notam_expire_dtg_estimated`) / `notam_lastmod_dtg`, all `YYYYMMDDHHMM` strings, plus
  `notam_text` (the raw NOTAM), `notam_report`, `notam_nrc` and the undecoded
  `notam_qcode`. There is no HTML and no decoded Q-code. `icao_id` mixes airports and
  FIRs — in a sampled EDDP→VHHH plan, 805 records across 26 identifiers, most of them
  FIRs (`EDMM`, `LTAA`, `ZGZU`, …) with no `Airport` row to attach to.
- `origin.notam[]`, `destination.notam[]`, `alternate[].notam[]`,
  `enroute_altn.notam[]`, `takeoff_altn.notam[]`, `etops.suitable_airport.notam[]` — the
  same NOTAMs, re-emitted per airport, with `location_icao` / `location_type`, ISO-8601
  `date_created` / `date_effective` / `date_expire` / `date_modified`, `notam_html`,
  `notam_text`, `notam_raw`, `notam_nrc`, `notam_qcode`, and the decoded
  `notam_qcode_category` / `notam_qcode_subject` / `notam_qcode_status`. Same plan: 61
  records across 6 airports, every `location_type` = `Airport`.

The requested field list is the nested form's, field for field.

`airport-weather` is the closest existing shape: `AirportWeather` is a side table keyed
by airport, written from an upstream source, read through
`GET /api/v1/airport/:airportId/weather` with `@SkipAuth()`. `ListRunwaysByAirportHandler`
is the closest read shape: it checks `AirportsRepository.exists` first and throws
`AirportNotFoundError`, then returns a possibly-empty array.

`json=2` has two representation quirks that matter here:

- An empty XML element becomes `{}`, not `""` or `null`. So `date_expire: {}` on a NOTAM
  with no stated end, and `notam_schedule: {}` / `notam_is_obstacle: {}` throughout. In
  the sampled plan 5 of 61 nested NOTAMs had `date_expire: {}`, and
  `date_expire_is_estimated` was either `"1"` or `{}`.
- A section that occurs once is an object; the same section with several entries is an
  array. `alternate` came back as an array of two, while `etops.suitable_airport` came
  back as a single object carrying 12 NOTAMs.

## Goals / Non-Goals

**Goals:**

- NOTAMs stored per airport, with the plan's decoded fields preserved verbatim.
- Ingestion that cannot leave stale NOTAMs behind for an airport it touched, and cannot
  disturb an airport it did not.
- A read endpoint that answers "what is currently in force at this airport", matching the
  weather endpoint's auth and error conventions.
- No SimBrief-shaped types inside the `airports` module.

**Non-Goals:**

- FIR / enroute NOTAMs. Nothing to attach them to; `Airport` is the only location model.
- A scheduled NOTAM refresh. Ingestion happens when an OFP is imported, nothing else.
- Interpreting NOTAM content: no Q-code enum, no severity, no schedule expansion, no
  obstacle geometry.
- Per-flight NOTAM briefings, snapshots, or history. Storage is current state per airport,
  not an archive of what a given flight saw.
- Any second NOTAM source.

## Decisions

**1. Read the nested per-airport `notam[]` arrays, not `notams.notamdrec[]`.** The nested
form is the only one that carries `notam_html`, `notam_raw` and the decoded Q-code triple
— three of the requested columns cannot be filled from the flat list at all — and its
dates are already ISO 8601 instead of `YYYYMMDDHHMM` needing a hand-written parser. It is
also pre-scoped to an airport, so `location_icao` resolves against `Airport` directly
instead of us filtering FIR identifiers out of a 13×-larger list.
_Alternative considered:_ the flat list plus deriving the missing fields ourselves —
decoding `QMXLC` into category/subject/status against an ICAO Q-code table, and
generating the HTML highlighting. Rejected: it is a large translation table to own and
keep current, purely to reproduce data the same response already contains.

**2. The `flights` module maps the OFP; the `airports` module receives a neutral DTO.**
`ReplaceAirportNotamsCommand(airports: AirportNotams[])` where
`AirportNotams = { icaoCode: string; notams: AirportNotamData[] }` and `AirportNotamData`
is the column shape (`notamId`, `dateCreated`, …, `qcodeStatus`) owned by the `airports`
module. `CreateFlightFromSimbriefHandler` walks the OFP's airport sections and does the
translation, exactly as it already translates `fuel` into `FuelBreakdown` and `crew` into
`CrewMember[]`.
_Alternative considered:_ passing the `OperationalFlightPlan` into the airports module and
mapping there. Rejected — SimBrief is the flights module's provider; the airports module's
own upstream is SkyLink, and nothing in it should need to know a second wire format.

**3. Commanded from the import handler, not driven by a domain event.** The NOTAMs exist
only inside the OFP object the handler is holding; a `FlightWasCreatedEvent` listener
would have to re-download the plan to see them. Dispatching a command is also what the
handler already does for airports (`ImportAirportByIcaoCommand`) and crew
(`AssignCrewToFlightCommand`), and keeps ingestion inside the request, so the flight
response is never returned before its airports' NOTAMs are visible.

**4. Airports are addressed by ICAO code in the command; unknown codes are skipped.** The
handler already resolves origin/destination/alternates to ids, but the takeoff alternate
and the ETOPS suitable airports are not part of the flight and are never imported, so
there is no id to pass for them. Keying on `location_icao` lets one command carry every
section uniformly; the handler resolves codes to ids in a single
`findMany({ where: { icaoCode: { in: codes } } })` and drops what it cannot resolve.
_Alternative considered:_ importing every airport the OFP mentions so all sections resolve.
Rejected — it turns a NOTAM ingest into extra SkyLink imports and inserts airports no
flight references, purely as a side effect of briefing data.

**5. Replace per airport, in one transaction, including airports whose list is empty.**
`deleteMany({ airportId: { in: resolvedIds } })` then `createMany(rows)` inside
`prisma.$transaction`. The delete set is *every* airport resolved from the plan, not just
those with NOTAMs — otherwise an airport whose restrictions were lifted would keep serving
yesterday's set forever. Scoping the delete to the plan's airports (rather than truncating
the table) means two users importing different routes at the same time do not erase each
other's data, at the cost of NOTAMs for airports nobody has flown lately going stale in
place. Staleness is bounded by reading: `date_expire` filtering at query time hides
anything that has since lapsed, so a stale row is invisible rather than misleading.
_Alternative considered:_ upsert per `(airportId, notamId)` and delete the difference.
Rejected — same observable result, one round trip per NOTAM instead of two statements, and
it needs a diff to handle cancellations anyway.

**6. Deduplicate by `(icaoCode, notamId)` before insert.** One airport can legitimately
appear in two sections of the same plan — a destination alternate that is also an ETOPS
suitable airport — which would re-emit its NOTAMs and violate the unique constraint. The
handler merges sections by ICAO code and keeps the first record per `notamId`. The unique
index stays as the backstop, and NOTAM bodies are identical across sections, so which copy
wins is immaterial.

**7. `dateExpire` is nullable; `{}` and any non-string value read as "no expiry".** A NOTAM
with no stated end is genuinely open-ended (`C) PERM` / `UFN`), which `NULL` models
honestly, and the read filter treats `NULL` as always valid. Every non-date field is
mapped through the same guard, so a `{}` where a string was expected becomes an empty
string rather than throwing — the OFP is a third party's document and a whole flight
import must not fail because one NOTAM field came back empty.

**8. `date_expire_is_estimated` and `notam_schedule` are not stored.** The estimated flag
would need every consumer to decide what "expires 2026-10-08, probably" means, and the
answer for a briefing view is the same either way: still in force. `notam_schedule` was
empty on every sampled record and is a recurrence grammar (`DAILY 0600-1800`) that we do
not intend to expand. Both are single-column additions later if a UI asks for them.

**9. Q-code parts are stored as free-text `String`, not enums.** The values are SimBrief's
own decoded prose — `Concentration of birds`, `Limited to the following`, `Work in
progress`, `Standard instrument arrival` — drawn from the full ICAO Q-code table. That is
hundreds of values we do not control, so a domain enum would reject valid upstream data
the first time a new code appears. Consumers group by these strings; they are not branched
on in domain logic.

**10. The read endpoint returns only currently valid NOTAMs.** `dateExpire IS NULL OR
dateExpire >= now()`, ordered by `dateEffective` descending. An expired NOTAM is
operationally noise, and a client that has to filter by date itself will eventually get it
wrong. Expired rows are left in the table rather than deleted — they cost nothing, they
disappear at the next import of that airport, and no scheduled cleanup job is needed.
_Note:_ future-effective NOTAMs (`dateEffective > now()`) **are** returned. A plan is
briefed before it is flown, and a closure starting in two hours is exactly what a pilot
needs to see.

**11. `404` for an unknown airport, `200 []` for an airport with no NOTAMs.** Copied from
`ListRunwaysByAirportHandler`: `AirportsRepository.exists` first, then the list. "This
airport does not exist" and "this airport has nothing to report" are different answers and
a client should not have to guess which an empty array means. Public via `@SkipAuth()`,
like weather and runways — a NOTAM is public aeronautical information.

**12. Column names drop the redundant `notam` prefix; `notamId` and `qcode` are added.**
Inside `airport_notam`, `notam_html` says "notam" twice, so the columns are `html`, `text`,
`raw`, `nrc`, `qcode`, `qcodeCategory`, `qcodeSubject`, `qcodeStatus`, alongside the
`date*` names as requested. `notamId` (`A3912/26`) is kept distinct from the surrogate
`id` because it is the reference pilots quote and the only stable identity a NOTAM has —
it carries the unique constraint with `airportId`. `qcode` is stored beside its three
decoded parts so a future consumer can decode differently without a re-import.

## Risks / Trade-offs

- **[NOTAMs are only as fresh as the last import of that airport]** An airport nobody has
  planned a flight to for a month serves month-old data; a NOTAM issued an hour ago is
  invisible until someone imports a plan involving that airport. → Accepted: the source of
  data is an OFP, and OFPs are what the product has. Expiry filtering keeps stale rows
  from showing as current, and the response carries `dateModified` so a client can show
  how old the information is. A scheduled per-airport NOTAM fetch is the fix if this
  becomes a real complaint, and this table is the right place to put it.
- **[Stored data is SimBrief's interpretation, not the source AIS text]** `html`,
  `qcodeCategory`, `qcodeSubject` and `qcodeStatus` are SimBrief's decoding. If they change
  their vocabulary, our stored values change with the next import and older rows disagree
  with newer ones. → Mitigated by storing `raw` (the untouched NOTAM as issued) and
  `qcode`, so the authoritative text and code are always present; the decoded columns are
  presentation.
- **[`html` is upstream HTML rendered by clients]** `notam_html` contains `<b>` and `<br>`
  from a third party. Rendering it unescaped is an injection surface for whoever consumes
  the API. → Stored verbatim as documented (that is the requested field), flagged here:
  clients must sanitise, or render `text` instead, which is the same content without
  markup.
- **[One OFP writes NOTAMs for up to ~7 airports]** A plan with alternates and ETOPS
  airports deletes and reinserts tens of rows inside the flight-creation transaction — the
  sampled plan produced 61 rows. → Two statements regardless of row count, and
  `createMany` is one insert; negligible next to the SkyLink airport imports the same
  request already performs.
- **[A concurrent import for the same airport interleaves]** Two users importing plans that
  share an airport can have their delete/insert pairs interleave, and the loser's rows are
  the ones that survive. → Both are writing the same upstream data minutes apart, so the
  outcome differs only in freshness; the transaction guarantees no partial set is ever
  visible.
