<!--
Each group is an independent, individually shippable unit (one GitHub issue). Dependencies:
2 needs 1; 3 and 4 need 1 and 2; 5, 6 and 7 need 1 only and can run in parallel with 2, 3 and
4; 6 needs 5 for the track-segment marker; 8 needs 3, 4, 5, 6 and 7. Group 1 is the only hard
prerequisite for everything. Group 2 is a correctness fix to shipped behaviour and is worth
landing on its own. Group 9 is the Definition of Done applied inside every group, not a
separate issue.
-->

## 1. Provider types and ETOPS fixture (independent)

- [ ] 1.1 `simbrief.types.ts`: replace the `etops` block — `rule`, and `entry`/`exit` as their own type carrying `pos_lat_fix`/`pos_long_fix`, `pos_lat_apt`/`pos_long_apt`, `icao_code`, `elapsed_time`, `min_fob`, `est_fob`, `etops_condition`, `div_time`, `div_burn`, `critical_fuel`, `div_altitude` and a single `div_airport`
- [ ] 1.2 `simbrief.types.ts`: `equal_time_point` as a distinct type — `pos_lat`/`pos_long`, no airport identity, `div_airport` as an array — accepting object-or-array for the point itself, since the plan numbers it `ETP1`
- [ ] 1.3 `simbrief.types.ts`: `critical_point` with `fix_type`, `pos_lat`/`pos_long`, `elapsed_time`, `est_fob` and `critical_fuel` only — it carries no condition and no diversion legs
- [ ] 1.4 `simbrief.types.ts`: widen `suitable_airport` with `suitability_start`/`_end`, `plan_rwy`, `fcst_cig`/`fcst_vis`, `metar_ceiling`/`metar_visibility`, `metar_category`, `trans_alt`/`trans_level`, `metar`/`metar_time`, `taf`/`taf_time` and the `atis` block
- [ ] 1.5 `simbrief.types.ts`: add `navlog.fix[]` (`ident`, `pos_lat`, `pos_long`, `altitude_feet`, `time_total`, `via_airway`, `stage`), `tracks` (`nat[]` with `id`, `group`, `tmi`, `addr`, `route`, `levels`, `start`, `end`, `fixes.fix[]`, plus `nat_notams`), `sigmets`, `images` and `atc.fir_etops`
- [ ] 1.6 Every added field tolerates `EmptyElement` where SimBrief renders an absent value as `{}`, following the existing convention in the file
- [ ] 1.7 `SimbriefClient.getRouteMapData(url)`: fetch the companion map file the payload links to in `map_data` and read `etopsruledist`, `etopsthreshold`, `etopsrule` and `natsdir` from it with targeted expressions — the file is parsed, never evaluated
- [ ] 1.8 The companion fetch degrades: missing, unreachable, non-200 or unparseable yields no ring figures and never fails the import; failures are logged, not raised
- [ ] 1.9 New mock fixture: a full ETOPS North Atlantic payload (three points, two suitable airports, a 26-fix navlog, sixteen tracks across two TMIs, SIGMETs, charts). The existing non-ETOPS fixture stays as the negative case
- [ ] 1.10 `simbrief.client.spec.ts`: the ETOPS fixture parses, including the array-versus-single shapes of `div_airport`, `equal_time_point` and `suitable_airport`, plus the companion map file parsing and each of its degradation paths

## 2. Correct the adequate/suitable airport roles (needs 1)

- [ ] 2.1 `AirportType` gains `EtopsSuitable`; `EtopsEntry` and `EtopsExit` keep meaning the adequate airport, so no stored row changes interpretation
- [ ] 2.2 `collectAlternateCandidates`: import `etops.entry.div_airport.icao_code` and `etops.exit.div_airport.icao_code` as `EtopsSuitable`, alongside the adequate airports it already imports
- [ ] 2.3 Import every `etops.suitable_airport[].icao_code` as `EtopsSuitable`, deduplicated against the diversion airports — on the reference plan CYQX and EINN each appear in both roles
- [ ] 2.4 Unit spec: entry maps CYYT to `EtopsEntry` and CYQX to `EtopsSuitable`; exit maps EINN to both types from one point; an airport in two roles is imported once
- [ ] 2.5 Feature: a flight imported from an ETOPS plan reports both its adequate and its suitable airports, with the suitable ones being the airports the diversion legs name
- [ ] 2.6 Confirm `airport-notams` ingestion is unaffected — it already iterates entry, exit and `suitable_airport` for NOTAMs regardless of role

## 3. ETOPS points and diversion legs (needs 1, 2)

- [ ] 3.1 Migration: `flight.etopsRuleMinutes`; `flight_etops_point` and `flight_etops_diversion`, both cascade-deleted with the flight
- [ ] 3.2 `EtopsPointKind` (`Entry`, `Exit`, `EqualTime`, `Critical`) and `EtopsCondition` domain enums, PascalCase keys, cast at the boundary; an unrecognised condition code is stored as published, not rejected
- [ ] 3.3 `model/etops-point.mapper.ts`: map a point per kind — `pos_lat_fix` for entry and exit, `pos_lat` for the equal-time point — with `adequateAirportId` null on the ETP, and every point carrying a position
- [ ] 3.4 Unit spec for the mapper: entry and exit read the fix position and not the airport position; the ETP reads its own; the adequate airport is null only on the ETP; every mapped point has coordinates
- [ ] 3.5 Store every equal-time point the plan publishes, ordered, accepting object-or-array
- [ ] 3.6 `model/etops-critical-point.ts`: resolve the critical point by position — mark the coinciding point where one exists, otherwise store it as a point of kind `Critical`
- [ ] 3.7 Unit spec for the resolution: the reference plan marks the ETP and stores three points with no duplicate position; a critical point at an unmatched position becomes its own point; exactly one point is critical in both cases
- [ ] 3.8 Write one diversion row per `div_airport` — two for the equal-time point, one for entry and exit — preserving both legs even where they report equal fuel on arrival
- [ ] 3.9 `model/etops-fuel-penalty.ts`: `max(0, max(criticalFuel − estFob))` returning the penalty and the governing point
- [ ] 3.10 Unit spec for the penalty: the nil case from the reference plan (governing point the ETP, 4,778 kg surplus, penalty 0), a case where a point does drive a penalty, and a single-point plan
- [ ] 3.11 Store `flight.etopsRuleDistance` and `flight.etopsThresholdMinutes` from the companion map file, both nullable so an unavailable file leaves the ETOPS plan intact
- [ ] 3.12 Unit spec: the threshold ring derives from the rule radius as `radius x threshold / rule` (437.0 nm at 370 min), and the reference plan's entry and exit fixes lie on it within a nautical mile of their adequate airports
- [ ] 3.13 Persist the snapshot inside the existing SimBrief import, before the flight-created event is emitted

## 4. ETOPS suitable airports (needs 1, 2)

- [ ] 4.1 Migration: `flight_etops_airport`, cascade-deleted with the flight
- [ ] 4.2 Map the suitability window, planned runway, transition altitude and level
- [ ] 4.3 Map the ceiling and visibility forecast for the suitability window
- [ ] 4.4 Map no METAR, TAF, ATIS, observed conditions or flight category — current weather stays with `airport-weather`
- [ ] 4.5 Unit spec: importing a plan writes nothing to `AirportWeather`
- [ ] 4.6 Feature: a flight's ETOPS airports report their windows, and the two airports have different windows
- [ ] 4.7 Feature: an ETOPS airport reports its forecast and no weather report

## 5. Planned route (needs 1)

- [ ] 5.1 Migration: `flight_route_fix`, cascade-deleted with the flight
- [ ] 5.2 Map `navlog.fix[]` in order — ident, position, altitude, elapsed time, airway, stage — leaving the per-fix wind, temperature, Mach, ground speed and fuel figures unmapped
- [ ] 5.3 Keep the `TOC` and `TOD` pseudo-fixes — they carry real positions and mark where the planned altitude changes character
- [ ] 5.4 Write the departure airport as the route's first fix — the airport's own position, field elevation, zero elapsed time — since the navlog omits the origin but includes the destination
- [ ] 5.5 Unit spec: order is preserved, every fix has a position, the first fix is the departure airport at zero elapsed time and the last is the destination, and the route is independent of `positionReports`
- [ ] 5.6 Feature: a flight reports its planned route before departure, every fix positioned, running airport to airport with no gap before the first plan fix
- [ ] 5.7 Feature: the planned altitude of every fix is reported, so the vertical profile is drawable from the same rows
- [ ] 5.8 Feature: a flight created without a plan reports no planned route

## 6. Oceanic tracks (needs 1; 5 for the segment marker)

- [ ] 6.1 Migration: `flight.oceanicRouting`, `flight.oceanicTrackId`, `flight.oceanicTrackDirection`, `flight_oceanic_track` with `fixes` as JSON, cascade-deleted with the flight
- [ ] 6.2 `OceanicRouting` (`Track`, `TrackGeometry`, `Random`) and `TrackDirection` domain enums, PascalCase keys
- [ ] 6.3 Take the flight's applicable track direction from the companion file's `natsdir` rather than inferring it from geography
- [ ] 6.4 Store every published track from both directions, with identifier, direction from `group`, TMI, issuing OCA from `addr`, route, levels, validity window and fixes
- [ ] 6.5 `model/oceanic-routing.ts`: classify from `navlog.fix[].via_airway` matching `NAT<id>`, then whether `atc.route` contains that token — no match at all is `Random`, matched and filed is `Track`, matched and not filed is `TrackGeometry`
- [ ] 6.6 Unit spec for the classifier: the reference plan resolves to `TrackGeometry` on Track W; a plan filing `NATW` in its ATC route resolves to `Track`; a plan with no `NAT` airway resolves to `Random`
- [ ] 6.7 Feature: an ETOPS oceanic flight reports its tracks split by direction, with the selected track identified and the routing status distinguishing planned-along from cleared-on
- [ ] 6.8 Feature: the route fixes belonging to the selected track are identifiable by their airway, so the track segment can be drawn distinctly
- [ ] 6.9 Feature: a flight whose plan publishes no tracks reports none and a `Random` routing status

## 7. Enroute hazards and charts (needs 1)

- [ ] 7.1 Migration: `flight_enroute_hazard` and `flight_briefing_chart`, cascade-deleted with the flight
- [ ] 7.2 `HazardType` domain enum from the SIGMET hazard, PascalCase keys, unrecognised values stored as published
- [ ] 7.3 Map SIGMETs — identifier, hazard, FIR, validity window, text — deduplicating the repeats the plan publishes across FIRs
- [ ] 7.4 Store the ETOPS-relevant FIRs from `atc.fir_etops`
- [ ] 7.5 Resolve chart URLs at import as `images.directory + link`, preserving the plan's order
- [ ] 7.6 Mark the route chart so it is identifiable among the charts — it already renders the ETOPS points, rings, alternates and tracks on one image
- [ ] 7.7 Feature: a flight reports its hazards and its charts, with chart names as the plan gives them, and the route chart identifiable

## 8. The briefing endpoint (needs 3, 4, 5, 6, 7)

- [ ] 8.1 `GetEtopsBriefingQuery` assembling the ETOPS plan, points, diversion legs, airports, planned route, tracks, hazards and charts into one document
- [ ] 8.2 Response model reporting the derived fuel penalty with its governing point, not just the raw figure
- [ ] 8.3 Report the rule and threshold radii alongside the airports they centre on, so the rings can be drawn without recomputation
- [ ] 8.4 Every position in the response — points, diversion airports, route fixes, track fixes — reported in the same terms, so the whole briefing can be drawn without further derivation
- [ ] 8.5 `GET /api/v1/flight/:flightId/etops-briefing` with the role set already governing `GET /flight/:flightId/ofp`
- [ ] 8.6 A flight with no imported plan returns 404 reusing the OFP endpoint's existing error and message
- [ ] 8.7 A non-ETOPS flight reports its route, tracks, hazards and charts and no ETOPS section
- [ ] 8.8 Feature: the briefing read across every role that can read the OFP, plus 401 unauthenticated, 400 on a malformed id and 404 for a flight with no plan
- [ ] 8.9 Feature: the briefing never labels an airport suitable as a verdict — the forecast and window are reported without a legality claim

## 9. Definition of done (applied inside every group)

- [ ] 9.1 No explanatory or documentation comments in the code
- [ ] 9.2 Domain enums are PascalCase and separate from Prisma enums, cast at the boundary
- [ ] 9.3 Every cucumber scenario asserts a response body, never a status code alone
- [ ] 9.4 Seed data covers an ETOPS flight so the briefing is reachable in a fresh environment
- [ ] 9.5 `openspec validate add-etops-briefing --strict` passes
