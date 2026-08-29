<!--
Each group is an independent, individually shippable unit (one GitHub issue). Dependencies:
2 needs 1; 3 and 4 need 1 and 2; 5, 6 and 7 need 1 only and can run in parallel with 2, 3 and 4;
7 needs 6 for the track-segment marker; 8 needs 3, 4, 6 and 7. Group 1 is the only hard
prerequisite for everything. Group 2 is a correctness fix to shipped behaviour and is worth
landing on its own. Group 9 is the Definition of Done applied inside every group, not a
separate issue.
-->

## 1. Provider types and ETOPS fixture (independent)

- [x] 1.1 `simbrief.types.ts`: replace the `etops` block — `rule`, and `entry`/`exit` as their own type carrying `pos_lat_fix`/`pos_long_fix`, `pos_lat_apt`/`pos_long_apt`, `icao_code`, `elapsed_time`, `min_fob`, `est_fob`, `etops_condition`, `div_time`, `div_burn`, `critical_fuel`, `div_altitude` and a single `div_airport`
- [x] 1.2 `simbrief.types.ts`: `equal_time_point` as a distinct type — `pos_lat`/`pos_long`, no airport identity, `div_airport` as an array — accepting object-or-array for the point itself, since the plan numbers it `ETP1`
- [x] 1.3 `simbrief.types.ts`: `critical_point` with `fix_type`, `pos_lat`/`pos_long`, `elapsed_time`, `est_fob` and `critical_fuel` only — it carries no condition and no diversion legs
- [x] 1.4 `simbrief.types.ts`: widen `suitable_airport` with `suitability_start`/`_end`, `plan_rwy`, `fcst_cig`/`fcst_vis`, `trans_alt`/`trans_level`, position and elevation — no METAR, TAF or ATIS, which are not stored
- [x] 1.5 `simbrief.types.ts`: add `navlog.fix[]` (`ident`, `pos_lat`, `pos_long`, `altitude_feet`, `time_total`, `via_airway`, `stage`), `tracks` (`nat[]` with `id`, `group`, `tmi`, `addr`, `route`, `levels`, `start`, `end`, `fixes.fix[]`, plus `nat_notams`) and `atc.fir_etops`
- [x] 1.6 Every added field tolerates `EmptyElement` where SimBrief renders an absent value as `{}`, following the existing convention in the file
- [x] 1.7 `SimbriefClient.getRouteMapData(url)`: fetch the companion map file the payload links to in `map_data` and read `etopsruledist`, `etopsthreshold`, `etopsrule` and `natsdir` from it with targeted expressions — the file is parsed, never evaluated
- [x] 1.8 The companion fetch degrades: missing, unreachable, non-200 or unparseable yields no ring figures and never fails the import; failures are logged, not raised
- [x] 1.9 New mock fixture: a full ETOPS North Atlantic payload (the existing mock gained `div_airport` on entry/exit and a SkyLink expectation for CYQX in group 2; the full payload is still outstanding) (three points, two suitable airports, a 26-fix navlog, sixteen tracks across two TMIs). The existing non-ETOPS fixture stays as the negative case
- [x] 1.10 `simbrief.client.spec.ts`: the ETOPS fixture parses, including the array-versus-single shapes of `div_airport`, `equal_time_point` and `suitable_airport`, plus the companion map file parsing and each of its degradation paths

## 2. Correct the adequate/suitable airport roles (needs 1)

- [x] 2.1 `AirportType` gains `EtopsSuitable`; `EtopsEntry` and `EtopsExit` keep meaning the adequate airport, so no stored row changes interpretation
- [x] 2.2 `collectAlternateCandidates`: import `etops.entry.div_airport.icao_code` and `etops.exit.div_airport.icao_code` as `EtopsSuitable`, alongside the adequate airports it already imports
- [x] 2.3 Import every `etops.suitable_airport[].icao_code` as `EtopsSuitable`, deduplicated against the diversion airports — on the reference plan CYQX and EINN each appear in both roles
- [x] 2.4 Unit spec: entry maps CYYT to `EtopsEntry` and CYQX to `EtopsSuitable`; exit maps EINN to both types from one point; an airport in two roles is imported once
- [x] 2.5 Feature: a flight imported from an ETOPS plan reports both its adequate and its suitable airports, with the suitable ones being the airports the diversion legs name
- [x] 2.6 Confirm `airport-notams` ingestion is unaffected — it already iterates entry, exit and `suitable_airport` for NOTAMs regardless of role

## 3. ETOPS points and their diversion airports (needs 1, 2)

- [x] 3.1 Migration: `flight.etopsRuleMinutes`; `flight_etops_point` and `flight_etops_diversion_airport`, both cascade-deleted with the flight
- [x] 3.2 `EtopsPointKind` (`Entry`, `Exit`, `EqualTime`, `Critical`) and `EtopsCondition` domain enums, PascalCase keys, cast at the boundary; an unrecognised condition code is stored as published, not rejected
- [x] 3.3 `model/etops-point.mapper.ts`: map a point per kind — `pos_lat_fix` for entry and exit, `pos_lat` for the equal-time point — with `adequateAirportId` null on the ETP, every point carrying a position, and no fuel figures mapped
- [x] 3.4 Unit spec for the mapper: entry and exit read the fix position and not the airport position; the ETP reads its own; the adequate airport is null only on the ETP; every mapped point has coordinates
- [x] 3.5 Store every equal-time point the plan publishes, ordered, accepting object-or-array
- [x] 3.6 `model/etops-critical-point.ts`: resolve the critical point by position — mark the coinciding point where one exists, otherwise store it as a point of kind `Critical`
- [x] 3.7 Unit spec for the resolution: the reference plan marks the ETP and stores three points with no duplicate position; a critical point at an unmatched position becomes its own point; exactly one point is critical in both cases
- [x] 3.8 Write one diversion-airport row per `div_airport` — two for the equal-time point, one for entry and exit — storing the airport and its order only, no track, distance, wind or fuel
- [x] 3.9 Store `flight.etopsRuleDistance` and `flight.etopsThresholdMinutes` from the companion map file, both nullable so an unavailable file leaves the ETOPS plan intact
- [x] 3.10 Unit spec: the threshold ring derives from the rule radius as `radius x threshold / rule` (437.0 nm at 370 min), and the reference plan's entry and exit fixes lie on it within a nautical mile of their adequate airports
- [x] 3.11 Persist the snapshot inside the existing SimBrief import, before the flight-created event is emitted

## 4. ETOPS suitable airports (needs 1, 2)

- [x] 4.1 Migration: `flight_etops_airport`, cascade-deleted with the flight
- [x] 4.2 Map the suitability window, planned runway, transition altitude and level
- [x] 4.3 Map the ceiling and visibility forecast for the suitability window
- [x] 4.4 Map no METAR, TAF, ATIS, observed conditions or flight category — current weather stays with `airport-weather`
- [x] 4.5 Unit spec: importing a plan writes nothing to `AirportWeather`

## 5. Waypoint catalogue (needs 1)

- [x] 5.1 Migration: `waypoint`, unique on identifier + ICAO region, with kind, position, optional frequency and last-seen timestamp
- [x] 5.2 `WaypointKind` domain enum (`Waypoint`, `Navaid`), PascalCase keys, mapped from the plan's `wpt` and `vor`
- [x] 5.3 `model/waypoint-harvester.ts`: collect named waypoints with coordinates from the route, the alternate routes and the oceanic tracks, excluding `ltlg` and `apt`
- [x] 5.4 Unit spec for the harvester: a VOR keeps its frequency; a plain waypoint has none; top of climb, top of descent and coordinate-named points are excluded; airports are excluded; track fixes are collected without a region
- [x] 5.5 Upsert on identifier + region — a waypoint seen again updates its position and last-seen rather than duplicating
- [x] 5.6 Unit spec: re-importing the same plan leaves the catalogue size unchanged; two identical identifiers in different regions are held separately
- [x] 5.7 `GET /api/v1/waypoint/:ident` for any authenticated role, 404 for an identifier never seen
- [x] 5.8 Feature: importing a plan catalogues its waypoints; reading a known one reports position, kind and region; reading an unknown one 404s

## 6. Planned route (needs 1)

<!-- Scope added after the group was written: the route is exposed on its own endpoint,
     carries the leg distance and track angles SimBrief publishes per fix, and the plan's
     route string is stored alongside it. -->

- [ ] 6.1 Migration: `flight_route_fix`, cascade-deleted with the flight
- [ ] 6.2 Map `navlog.fix[]` in order — ident, position, altitude, elapsed time, airway, stage — plus the leg `distance` and the `track_true`/`track_mag` angles the plan publishes per fix, leaving wind, temperature, Mach, ground speed and fuel unmapped
- [ ] 6.3 Keep the `TOC` and `TOD` pseudo-fixes — they carry real positions and mark where the planned altitude changes character
- [ ] 6.4 Write the departure airport as the route's first fix — the airport's own position, field elevation, zero elapsed time — since the navlog omits the origin but includes the destination
- [ ] 6.5 Unit spec: order is preserved, every fix has a position, the first fix is the departure airport at zero elapsed time and the last is the destination, and the route is independent of `positionReports`
- [ ] 6.6 Feature: a flight reports its planned route before departure, every fix positioned, running airport to airport with no gap before the first plan fix
- [ ] 6.7 Feature: the planned altitude of every fix is reported, so the vertical profile is drawable from the same rows
- [ ] 6.8 Store the plan's route string on `flight.route`, which the import has never populated
- [ ] 6.9 `GET /api/v1/flight/:flightId/route` returning the route as ordered positioned points with their distances and angles, plus the route string
- [ ] 6.10 Feature: the route endpoint reports every point positioned, airport to airport, with leg distances and track angles
- [ ] 6.11 Feature: a flight created without a plan reports no planned route

## 7. Oceanic tracks (needs 1; 6 for the segment marker)

- [ ] 7.1 Migration: `flight.oceanicRouting`, `flight.oceanicTrackId`, `flight.oceanicTrackDirection`, `flight_oceanic_track` with `fixes` as JSON, cascade-deleted with the flight
- [ ] 7.2 `OceanicRouting` (`Track`, `TrackGeometry`, `Random`) and `TrackDirection` domain enums, PascalCase keys
- [ ] 7.3 Take the flight's applicable track direction from the companion file's `natsdir` rather than inferring it from geography
- [ ] 7.4 Store every published track from both directions, with identifier, direction from `group`, TMI, issuing OCA from `addr`, route, levels, validity window and fixes
- [ ] 7.5 `model/oceanic-routing.ts`: classify from `navlog.fix[].via_airway` matching `NAT<id>`, then whether `atc.route` contains that token — no match at all is `Random`, matched and filed is `Track`, matched and not filed is `TrackGeometry`
- [ ] 7.6 Unit spec for the classifier: the reference plan resolves to `TrackGeometry` on Track W; a plan filing `NATW` in its ATC route resolves to `Track`; a plan with no `NAT` airway resolves to `Random`
- [ ] 7.7 Feature: an ETOPS oceanic flight reports its tracks split by direction, with the selected track identified and the routing status distinguishing planned-along from cleared-on
- [ ] 7.8 Feature: the route fixes belonging to the selected track are identifiable by their airway, so the track segment can be drawn distinctly
- [ ] 7.9 Feature: a flight whose plan publishes no tracks reports none and a `Random` routing status

## 8. The briefing endpoint (needs 3, 4, 6, 7)

- [ ] 8.1 `GetEtopsBriefingQuery` assembling the ETOPS plan, points, diversion legs, airports, planned route, tracks, hazards and charts into one document
- [ ] 8.2 Report the rule and threshold radii alongside the airports they centre on, so the rings can be drawn without recomputation
- [ ] 8.3 Every position in the response — points, diversion airports, route fixes, track fixes — reported in the same terms, so the whole briefing can be drawn without further derivation
- [ ] 8.4 `GET /api/v1/flight/:flightId/etops-briefing` with the role set already governing `GET /flight/:flightId/ofp`
- [ ] 8.5 A flight with no imported plan returns 404 reusing the OFP endpoint's existing error and message
- [ ] 8.6 A non-ETOPS flight reports its route, tracks, hazards and charts and no ETOPS section
- [ ] 8.7 Feature: the briefing read across every role that can read the OFP, plus 401 unauthenticated, 400 on a malformed id and 404 for a flight with no plan
- [ ] 8.8 Feature: the briefing never labels an airport suitable as a verdict — the forecast and window are reported without a legality claim

## 9. Definition of done (applied inside every group)

- [ ] 9.1 No explanatory or documentation comments in the code
- [ ] 9.2 Domain enums are PascalCase and separate from Prisma enums, cast at the boundary
- [ ] 9.3 Every cucumber scenario asserts a response body, never a status code alone
- [ ] 9.4 Seed data covers an ETOPS flight so the briefing is reachable in a fresh environment
- [ ] 9.5 `openspec validate add-etops-briefing --strict` passes
