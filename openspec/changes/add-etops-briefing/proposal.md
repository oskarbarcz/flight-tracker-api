## Why

A flight knows it is ETOPS. `flight.isEtops` is a boolean set from the plan, and that is the
entire extent of it. Everything that makes the word mean something — which airports the crew
would turn toward, when those airports are usable, how far away they are, how much fuel the
diversion needs, and whether the aircraft is even routed along an oceanic track — is fetched
from SimBrief on every import and then discarded.

Not quite all of it. The plan's rendered HTML is kept whole in `flight.ofpContent` and served
by `GET /flight/:id/ofp` as one opaque string. The information is technically present and
practically unusable: nothing can be queried, compared, sorted or shown next to anything else,
and the ETOPS section is 3,700 lines into a document that also contains every NOTAM for eight
airports. A pilot reading a briefing should not be reading a text file.

There is also a defect to correct first. `collectAlternateCandidates` stores
`etops.entry.icao_code` as the flight's `EtopsEntry` airport. That field is not the diversion
airport — it is the **adequate** airport that defines the ETOPS threshold, printed as `(AAP)`
in the plan. The airport a crew would actually divert to is nested one level down in
`div_airport`, and it is dropped. On the reference plan this stores Gander's threshold partner
`CYYT` while discarding `CYQX`, the airport 457 nm and 1 h 29 min away that the fuel
calculation is actually built on. The system currently names the wrong airport.

The last piece is oceanic. SimBrief publishes the full North Atlantic track message with the
plan, and which track the flight was planned along, but "planned along a track" and "cleared on
a track" are not the same thing — and on the reference plan they diverge. That distinction has
to survive into the briefing or the briefing lies.

## What Changes

- **Correct the ETOPS airport roles.** An ETOPS point distinguishes its **adequate** airport
  (the threshold reference, `etops.entry.icao_code`) from its **suitable** airport (the
  diversion target, `etops.entry.div_airport.icao_code`). Both are imported and both are kept,
  under distinct airport types. The existing `EtopsEntry` and `EtopsExit` types keep naming the
  adequate airport, so no stored data changes meaning; the suitable airports are new.
- **Snapshot the ETOPS plan per flight.** The rule time in minutes, and every point the plan
  computes — entry, exit, the equal-time point and the critical point — each stored with its
  own position, the elapsed time at which it is reached, the condition driving the calculation,
  and the airports it would turn toward.
- **Store no fuel figures.** The plan attaches fuel to every point and every diversion, and
  none of it is kept. The flight management system computes fuel on board and fuel to a
  diversion continuously from the actual aircraft state; a snapshot taken at plan time is
  coarser and staler than what the crew already has, and a second set of numbers beside the
  authoritative one invites reconciling two answers instead of trusting one. This also drops
  the derived ETOPS fuel penalty an earlier draft specified.
- **Store every point so it can be drawn.** Each point carries the position the plan publishes
  for it, because an equal-time point is a place and a briefing that cannot put it on a map has
  lost its meaning. The critical point is resolved against the points already stored: where it
  coincides with one — as it does on the reference plan, sharing the equal-time point's
  coordinates, elapsed time and fuel exactly — that point is marked critical rather than
  duplicated; where it names a position of its own, it is stored as a point in its own right.
  Nothing the plan publishes goes unstored, and no point is drawn twice.
- **Keep every waypoint the plan gives us, for good.** Each import contributes the named
  waypoints it publishes with coordinates — route fixes, alternate-route fixes and oceanic track
  fixes — to a catalogue keyed by identifier and ICAO region, so the system accumulates its own
  navigation data as it is used rather than depending on a navigation database it does not have.
  Roughly fifty waypoints per plan, more on an oceanic crossing. Computed points are excluded:
  the top of climb, the top of descent and positions named after their own coordinates describe
  one flight rather than the world, and airports are already held as airports. Navaids keep the
  frequency the plan reports.
- **Store the planned route the points lie on.** The system currently holds the route only as a
  string of identifiers with no coordinates, and the flown positions, which are empty until the
  aircraft moves. Neither can draw a planned route. The plan's route fixes are stored in order
  with their positions, altitudes, elapsed times and the airway used to reach each — enough to
  draw the route, place the ETOPS points along it, and shade the segment flown on a track. The
  per-fix wind, temperature, Mach, ground speed and fuel figures are left out: they belong to a
  flight log, not to this briefing.

- **Snapshot the ETOPS suitable airports with their suitability window.** Start and end of the
  period each airport must be usable, the planned runway, forecast ceiling and visibility, and
  transition altitude and level. The windows differ per airport and are the substance of the
  section: on the reference plan Gander must hold from 23:01 to 02:52 and Shannon only from
  00:52.
- **Keep the planning conditions, not the weather.** Each ETOPS airport keeps the forecast
  ceiling and visibility for its suitability window — the figures the diversion was planned
  against, meaningless apart from the window they belong to. No METAR, TAF, ATIS, observed
  conditions or flight category are captured: an observation frozen at planning time is stale
  before pushback and answers no operational question. Current conditions stay entirely with
  `airport-weather`, which already handles refresh and providers properly.
- **Draw the ETOPS range rings.** The rule radius around each suitable airport and the
  threshold ring that fixes where ETOPS begins — the defining geometry of an ETOPS chart, and
  the thing that makes the points mean something rather than float. The radius is not in the
  plan's JSON and cannot be derived from it, because no one-engine-inoperative speed appears
  anywhere in the payload, and the plan's own diversion figures are flown at 10,000 ft and imply
  the wrong speed entirely. It is published in the companion map file the plan links to, as
  `etopsruledist = 2694.8333` nm against a 370 minute rule, from which both rings follow. The
  track direction that applies to the flight is taken from the same file. Where the file cannot
  be read the rings are simply absent and the import still succeeds.
- **Snapshot the oceanic track message per flight.** Every track the plan publishes, each with
  its identifier, direction, TMI, issuing oceanic control area, route string, available flight
  levels, validity window and plottable fixes. Both directions are stored as published; the
  read side reports direction so a caller can show the relevant half. On the reference plan
  that is sixteen tracks under two separate messages — TMI 236 westbound, already expired at
  the moment the plan was generated, and TMI 237 eastbound.
- **Report the flight's routing against the track structure as three states, not a flag.** A
  flight is *on* a track when the plan routes along it and files it as a track; routed along
  *track geometry* when the plan follows the track's waypoints but files them individually;
  and on a *random* route when no track is involved. The reference plan is the middle case —
  planned along Track W, filed as individual waypoints, because the aircraft reaches 30 W at
  23:27 Z and Track W is not active until 01:00 Z. Reporting that flight as "on Track W" would
  be wrong about its clearance.

- **Serve the whole thing as one briefing.** `GET /flight/:id/etops-briefing`, readable by any
  role that can already read the OFP, returning a single document: the ETOPS plan and its
  points, the airports each turns toward, the suitable airports with their windows, the planned
  route, the oceanic tracks and the flight's routing against them, and the flight's routing against them. One read, everything assembled, nothing the caller has to stitch together — and
  enough geometry in it to draw the whole picture on a map. A flight planned without ETOPS
  reports the route and tracks it has and no ETOPS section; a flight not
  imported from SimBrief reports that no briefing exists.
No existing endpoint changes shape. `GET /flight/:id/ofp` keeps serving the rendered plan
unchanged, because a crew that wants the original document should still get it.

## Capabilities

### New Capabilities

- `flight-etops-plan`: the rule time, the entry, exit and equal-time points, the airports each
  turns toward, the critical point, and the range rings.
- `etops-suitable-airports`: the diversion airports of an ETOPS flight — their suitability
  windows, planned runway and the conditions forecast for those windows.
- `flight-planned-route`: the plan's route fixes in order with their positions, so the briefing
  and its points can be drawn.
- `navigation-waypoints`: a catalogue of waypoints and navaids with their positions, accumulated
  from every plan imported and readable on its own.
- `flight-oceanic-tracks`: the per-flight track message snapshot, and the three-state routing
  status describing how the flight relates to it.

### Modified Capabilities

- `airport-weather`: check-in monitoring extends to a flight's ETOPS diversion airports, which
  the current requirement does not name — it lists departure, destination, destination
  alternate and enroute alternate. Importing the suitable airports would otherwise start
  monitoring them silently, and an airport a crew may divert to over an ocean is the last one
  whose weather should go stale.

`airport-notams` is deliberately untouched. Its ingestion already walks the plan's ETOPS entry,
exit and suitable-airport sections for NOTAMs, and it keys on the sections rather than on the
airport's role, so correcting the adequate/suitable confusion changes nothing it does. Verified
rather than assumed.

## Impact

- **API**: one new read, `GET /api/v1/flight/:flightId/etops-briefing`, with the role set that
  already governs `GET /flight/:flightId/ofp`. 404 when the flight has no imported plan,
  matching the OFP endpoint's existing behaviour and message.
- **Schema**: `flight_etops_point` (one row per published point, carrying its position, elapsed
  time and condition), `flight_etops_diversion` (one row per leg, two for the equal-time point),
  `flight_etops_airport` (a suitable airport's window, planned runway and forecast conditions),
  `flight_route_fix` (the planned route in order, 26 rows on the reference plan), `waypoint`
  (the accumulated catalogue, keyed by identifier and region),
  `flight_oceanic_track` (one row per published track, with its fixes as JSON since they are
  read only as a whole).
  `flight.etopsRuleMinutes`, `flight.etopsRuleDistance`, `flight.etopsThresholdMinutes`,
  `flight.oceanicRouting` and `flight.oceanicTrackDirection` on the flight itself, the three
  ring-related fields nullable so an unavailable companion file leaves the plan intact. Every table is
  keyed by flight and cascade-deleted with it.
- **Provider fetch**: one additional GET per import, for the companion map file the payload
  links to in `map_data`. Same host, ~9 KB, and the only source of the ring radius. It is a
  JavaScript file rather than JSON, so it is read with targeted expressions and never executed.
  Any failure to fetch or parse leaves the ring fields null and the import unaffected.
- **Provider types**: `simbrief.types.ts` gains the full `etops` block — currently typed as
  `{ entry, exit, suitable_airport }` and missing `rule`, `critical_point`,
  `equal_time_point`, and every fuel and diversion field on the points — plus `tracks`,
  and `atc.fir_etops`. The existing `Airport` type is not widened; the
  ETOPS point shape is distinct from an airport and gets its own type.
- **Domain enums**: `EtopsCondition`, `OceanicRouting`, `TrackDirection` — all
  PascalCase keys, separate from any Prisma enum, cast at the boundary.
- **Errors**: none new. The briefing reuses the OFP endpoint's existing not-found error.
- **Tests**: unit specs for the fuel-penalty derivation including the nil case, the
  adequate-versus-suitable mapping, the three-state routing classification against an active
  track, an inactive track and a random route, and the track-direction split. Features for the
  briefing read across roles, an ETOPS flight, a non-ETOPS flight with tracks, a flight with no
  plan. A new SimBrief mock fixture carrying a full ETOPS payload is
  required; the existing fixture is a non-ETOPS plan and stays as the negative case.
- **Not in scope**: ETOPS planning minima, MORA and ice fuel. All three appear in the ETOPS
  table of the rendered plan and in no structured field — the reference plan prints
  `WX MIN: 600-3219` for both airports with no JSON equivalent anywhere in the payload. Without
  minima the briefing reports forecast conditions and the suitability window but does not
  assert that an airport is legally usable, and it must not imply otherwise. Recovering them
  means either parsing `text.plan_html` or assuming a fixed add-on, and neither is worth doing
  blind. Deferred with it: the ETOPS pseudo-waypoints, which the rendered plan shows in the
  navlog as `ETOPS ENTRY`, `ETP1` and `ETOPS EXIT` but which are absent from `navlog.fix`, so
  plotting a point on the route means using its own coordinates rather than a route fix.
- **Also available, deliberately deferred**: the payload carries a great deal more that is not
  ETOPS briefing and should not be smuggled in behind it. The navlog's geometry is taken
  because the briefing cannot be drawn without it; its per-fix wind, temperature, Mach, ground
  speed, fuel remaining, MORA, tropopause and shear are not, because those describe how the
  flight is flown rather than where it may divert. Left whole for later: the structured takeoff
  and landing report (eight runways at the origin with V-speeds, flex temperature, limit codes
  and declared distances, currently kept only as the raw `runwayAnalysis` text), the ten
  what-if scenarios in `impacts`, the alternate navlogs, the role-keyed `weather` block, and
  the filed ICAO flight plan text. Each is a change of its own.
