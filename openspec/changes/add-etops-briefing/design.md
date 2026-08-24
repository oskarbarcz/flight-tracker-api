# Design — ETOPS Briefing

## Context

See proposal.md — Why. This section records what was verified against a live ETOPS payload
before the design was written, because three findings contradict the obvious approach.

The reference plan throughout is SimBrief request `183877565`: BAW720, KJFK → EGLL, A350-900
`G-NXWB`, ETOPS rule 370 minutes, generated 24 Aug 2026 19:00 Z. It is a genuine ETOPS
North Atlantic crossing and every number quoted below is from it.

### `etops.entry.icao_code` is not the diversion airport

This is the finding that makes the current import wrong, and it is only visible by reading the
JSON against the rendered plan side by side.

```
JSON                                          rendered OFP
──────────────────────────────────────────    ─────────────────────────────
etops.entry.icao_code       = CYYT        ──▶ (AAP)   adequate airport
etops.entry.pos_lat_fix     = 51.7549     ──▶ N5145.3  the entry point itself
etops.entry.pos_lat_apt     = 47.6237     ──▶ CYYT's own position
etops.entry.div_airport
            .icao_code      = CYQX        ──▶ SAP     suitable airport
```

The plan's ETOPS table prints the suitable airport in the `SAP` column and the adequate airport
beneath it in parentheses:

```
ETOPS   SAP        ELTME TIME   DIST     MORA    ICE CFUEL  FOB  COND
                    (AAP)        ISA      W/C
ENTRY   CYQX        0242 0129    457      028    0.3   8.8  23.1  DC
N5145.3 W04327.5    (CYYT)       P12     M023
ETP1    CYQX/EINN   0323 0239  824/895  028/047  0.6  14.6  19.3  DC
N5205.8 W03328.0               P09/P03 M022/P011
EXIT    EINN        0416 0121    435      047    0.3   7.6  14.5  DC
N5256.6 W02055.9    (EINN)       P03     P003
```

Two roles, two airports, and at the exit point they happen to be the same airport — which is
exactly the coincidence that lets the current code look correct in casual testing. At the entry
point they differ, and the system stores the one the crew would not fly to.

Note also that the point's own coordinates and the adequate airport's coordinates are both
present and are not the same location: `pos_lat_fix` is the entry fix at 51.75 N, `pos_lat_apt`
is CYYT at 47.62 N. Confusing them would put the ETOPS entry 240 nm from where it is.

### The three points are not the same shape

The reader cannot treat entry, exit and the equal-time point uniformly. Their key sets differ,
and the position fields are named differently for the same concept:

```
                        entry / exit          equal_time_point    critical_point
position of the point   pos_lat_fix           pos_lat             pos_lat
                        pos_long_fix          pos_long            pos_long
position of the airport pos_lat_apt           —                   —
                        pos_long_apt
airport identity        icao_code, iata_code, —                   —
                        faa_code, icao_region
fuel and timing         all present           all present         elapsed_time, est_fob,
                                                                  critical_fuel only
diversion legs          div_airport (object)  div_airport (array  —
                                              of 2)
discriminator           —                     —                   fix_type: "ETP"
```

An equal-time point has no airport identity at all, which is correct — it is a point between
two airports, not near one. So `adequateAirportId` is nullable and null on the ETP, and the
mapping from payload to `posLat`/`posLong` is per point kind rather than one shared accessor.
Reading `pos_lat_fix` on an ETP silently yields nothing.

### The forecast pair is planning data; the observation is not

The plan publishes both a forecast and an observation per ETOPS airport:

```
        fcst_cig  fcst_vis    metar_ceiling  metar_visibility   metar_category
CYQX        900      8050              900              9999    ifr
EINN       9999      9650             9999              9650    vfr
```

Only the left pair is operational. `fcst_cig`/`fcst_vis` are the conditions forecast **for the
suitability window** — the figures the dispatcher planned the diversion against, and the ones
that pair with the window to mean anything. The observation is a snapshot of the weather at
plan time, already stale by pushback and completely stale in flight.

So the forecast pair is stored and the observation is not — no METAR, no TAF, no ATIS, no
observed ceiling or visibility, no flight category. Current conditions are `airport-weather`'s
job and it already does it properly, with refresh and provider handling this change has no
reason to duplicate. See the decision below.

### The fuel penalty is derivable, and deriving it is the point

`fuel.etops` is `0` on the reference plan. Stored alone that is indistinguishable from "not
computed", and it tells a pilot nothing. The arithmetic behind it was verified end to end:

```
                       critical_fuel    est_fob     margin
ENTRY                       8 809       23 090     +14 281
ETP1                       14 566       19 344      +4 778   ← governing
EXIT                        7 618       14 481      +6 863

penalty = max(0, max(critical_fuel − est_fob)) = max(0, −4 778) = 0
```

Two further identities were confirmed and are worth knowing because they make the numbers
explicable rather than magic:

```
est_fob − min_fob = 1 035 at all three points  = the contingency fuel exactly
min_fob           = fuel-to-destination + FINRES + ALTN
                    16 685 + 5 370 = 22 055 at the entry point ✓
```

So `min_fob` is the fuel needed to finish the flight normally, and the gap above it is
contingency. The ETOPS requirement (`critical_fuel`) is a separate and, here, much smaller
number. The briefing should say which point governs and by what margin, because that is the
question the figure `0` is silently answering.

### Planned along a track ≠ cleared on a track

The plan tags six navlog fixes `via_airway: "NATW"`, which reads like "this flight is on
Track W". The ATC route string tells a different story:

```
atc.route: ... ALLEX N503B ALLRY/M085F400 DCT 51N050W 52N040W 52N030W 53N020W DCT MALOT ...
                                          ▲
                                          no NAT token anywhere — individual waypoints
```

And the dispatcher remark says why in plain text:

```
general.dx_rmk: TRACK W IS NOT ACTIVE, CROSSING 30W AT 2327Z
                FILED USING INDIVIDUAL TRACK WAYPOINTS
```

Confirmed by timestamps:

```
24 Aug                                                25 Aug
19:00Z   19:50Z                 23:27Z          01:00Z ─────── 08:00Z
  │        │                       │               │             │
  │        │                       │               ╰─ Track W valid ─╯
generated takeoff            crosses 30W              (TMI 237)
                                   │
                                   ╰── 93 min before the track opens
```

So the flight is planned along Track W's geometry and flies none of it as a track. A boolean
"is on a track" is false; a stored track identifier is misleading; only three states are
honest. This is not an edge case — SimBrief routes along track geometry whenever the winds
favour it and the timing does not.

The track message also splits in two, which a single validity window would flatten:

```
A B C D E F G H   West  TMI 236  EGGX  24 11:30Z → 19:00Z   expired at generation
T U V W X Y Z     East  TMI 237  CZQX  25 01:00Z → 08:00Z   the flight's direction
```

Eight of the sixteen tracks were already dead when the plan was generated. Storing them without
their direction and validity would put expired westbound tracks in an eastbound briefing.

### What has no structured form

Path-searched across the entire payload. These appear only inside `text.plan_html`:

```
ETOPS planning minima (WX MIN: 600-3219) ...... rendered text only
MORA per segment (028, 047) .................. rendered text only
ICE fuel (0.3, 0.6) .......................... rendered text only
ETOPS pseudo-waypoints in the navlog ......... rendered text only
  (navlog.fix has 26 entries, none named ETP1 or ETOPS ENTRY)
```

The minima absence is the consequential one. The plan prints
`CYQX WX MIN: 600-3219  FCST WX: 900-8050` — forecast better than minima, so Gander is legal —
and the JSON carries `fcst_cig` and `fcst_vis` but nothing to compare them against.

### What already exists and should not be rebuilt

```
SimbriefClient + OFP import ................... reuse
AirportWeather (METAR/TAF/ATIS, per airport) .. do NOT displace — see Decisions
  WeatherSource.SayIntentions ................. matches SimBrief's own ATIS network
AirportType.EtopsEntry / EtopsExit ............ keep meaning, add suitable types
airport-notams ETOPS harvest .................. already correct, unaffected
FuelBreakdown.etops ........................... already stores fuel.etops
GET /flight/:id/ofp ........................... unchanged
send-flight-briefing.listener ................. extend
```

## Goals / Non-goals

**Goals.** Store what the plan says about ETOPS as queryable structure, per flight, frozen at
import. Name the diversion airports correctly. Report the fuel penalty with the reasoning that
produces it. Describe the flight's relationship to the oceanic track structure without
overstating it. Serve it all from one read.

**Non-goals.** Computing ETOPS. Nothing here recalculates a point, a diversion or a fuel
figure — SimBrief is the planning authority and this change is a faithful reader of its output.
Asserting legality: without planning minima the briefing reports conditions and windows and
stops short of "suitable ✓". Live weather: `airport-weather` keeps that job. Replacing the OFP
endpoint. Weight and balance, performance, and the non-ETOPS parts of the payload listed at the
end of the proposal.

## Decisions

### The briefing is a snapshot, not a projection

Every table is written once at import and never refreshed. A briefing is a point-in-time
document: it records what was known when the flight was planned, and a crew comparing it
against current conditions needs the original to still say what it said. This also makes the
read trivially cheap and removes any dependency on SimBrief being reachable later.

The consequence is duplication with `airport-weather`, and that is accepted deliberately.

### No weather is captured at all

An earlier draft stored the plan's METAR, TAF and ATIS per ETOPS airport so the briefing could
show what was known at planning time. That is dropped. This briefing is an operational
document — where the aircraft can go, how far, and when those airports are usable — and a
frozen observation from before pushback answers none of that.

Dropping it removes a real design tension rather than deferring one. `AirportWeather` is
`@@unique([airportId, source, informationType])`, one *current* report per airport per source,
so a captured report either fights that constraint or needs a parallel table with a different
lifetime. With no capture there is one weather path and no ambiguity: `airport-weather` serves
current conditions for every airport including the ETOPS ones, and the briefing points at
airports rather than restating their weather.

This makes the `airport-weather` monitoring delta load-bearing rather than incidental — it is
now the only way a crew sees conditions at a diversion airport, which is why it is in scope.

What stays on the ETOPS airport row is planning data the plan computed and nothing republishes:
the suitability window, the planned runway, the forecast ceiling and visibility for that window,
and the transition altitude and level.

### Adequate and suitable airports get distinct types

`AirportType` gains `EtopsSuitable`. `EtopsEntry` and `EtopsExit` keep their current meaning —
the adequate airport at each threshold — so no stored row changes interpretation and no
migration of existing data is needed. The suitable airports are additional rows.

An airport routinely holds two roles at once: on the reference plan EINN is the adequate
airport at the exit point, the suitable airport at the exit point, *and* a suitable airport in
`etops.suitable_airport`. The existing alternate-airport table already tolerates one airport in
several roles, and `airport-notams` already has a scenario for exactly this, so nothing new is
required to handle it.

### Every published point is stored with a position, and the critical point is one of them

The governing rule is that **every position the ETOPS section publishes is stored as a
plottable point**. A briefing that cannot draw its own points on a map is a table, and the
whole purpose of an equal-time point is spatial.

`etops.critical_point` duplicates the equal-time point exactly on the reference plan — verified
field by field:

```
                pos_lat              pos_long             elapsed  est_fob  critical_fuel
critical_point  52.095984771429      −33.466876671682     12186    19344    14566
equal_time_point 52.095984771429     −33.466876671682     12186    19344    14566
                 ▲ identical ────────────────────────────────────────────────────▲
```

with one field the ETP lacks: `fix_type: "ETP"`, naming which point it is.

So on this plan the critical point *is* the ETP, and storing it as a separate row would put two
markers at the same coordinates and list the ETP twice in the briefing. But the naive fix —
treating it purely as a flag — silently loses the point entirely if `fix_type` ever names
something that is not among the stored points. `fix_type` is a discriminator, which means the
provider expects more than one value.

The design therefore resolves the critical point by position rather than assuming coincidence:

```
critical_point position matches a stored point?
  │
  ├── yes ──▶ mark that point critical            (the reference plan: marks the ETP)
  │
  └── no  ──▶ store it as a point of kind Critical, marked critical
```

Either way exactly one stored point carries the mark, every stored point has coordinates, and
nothing the plan publishes goes unstored. `EtopsPointKind` therefore carries `Critical`
alongside `Entry`, `Exit` and `EqualTime` — a kind that is expected to go unused on most plans
and exists so that an unusual one is not silently dropped.

### More than one equal-time point is possible

The rendered plan labels the equal-time point `ETP1`. The numbering implies `ETP2`, and a
longer oceanic crossing with three suitable airports would have one. The payload delivers
`equal_time_point` as an object here, so the reader must accept object-or-array exactly as
`toOfpArray` already does for `div_airport`, `alternate` and `suitable_airport` — and the point
table must not assume a single equal-time row. This costs nothing now and prevents a crash on
the first Pacific crossing.

### Diversion legs are a child table, because the ETP has two

Entry and exit carry one `div_airport`; the equal-time point carries an array of two, one
toward each side. Flattening onto the point would mean nullable second-leg columns and a
read that has to know which fields pair with which. A child table keyed by point makes "one
leg or two" a row count, and the ETP's two legs sort naturally by direction.

Note that both ETP legs report the same `est_fob` of 6,773 kg — that is the definition of an
equal-time point, not a data error, and the model should not treat the pair as redundant.

### Routing status is an enum on the flight, resolved at import

`OceanicRouting` with `Track`, `TrackGeometry` and `Random`, plus a nullable track identifier
meaningful for the first two. Resolved once at import from three signals, in order:

```
navlog has via_airway matching NAT<id>   ──┬── no  ──▶ Random
                                           │
                                          yes
                                           │
atc.route contains that NAT token        ──┼── yes ──▶ Track
                                           │
                                           no  ──────▶ TrackGeometry
```

Deriving this on read instead would mean re-parsing route strings on every request and would
break the moment the stored payload is no longer at hand. It is a classification, it is stable,
and it belongs next to the data it classifies.

### Tracks are stored per flight, both directions, as published

Sixteen rows per ETOPS North Atlantic flight, duplicated across every flight planned that
night. The alternative — one global track table keyed by TMI — normalises the duplication away
but breaks the snapshot guarantee: a briefing read next week would render whatever the track
table holds then, not what the flight was planned against. Track messages are also reissued
under the same TMI, so the key is not as stable as it looks. Sixteen small rows per flight is a
price worth paying for a briefing that stays true.

Both directions are stored because both are in the message and discarding half at write time
makes the stored plan an edited version of what the dispatcher saw. The read reports
`direction`, and filtering is the caller's decision.

### The range rings come from a companion file, because the payload cannot produce them

The defining visual of an ETOPS chart is the circles: the rule radius around each suitable
airport, and the threshold ring that fixes where ETOPS begins. The JSON cannot draw them. The
radius is rule time × one-engine-inoperative cruise speed, and no OEI, single-engine or
driftdown speed appears anywhere in the payload — searched by path across every field.

Deriving it from the diversion legs looks tempting and is wrong:

```
entry leg   457 nm / 89.4 min  = 307 kt
ETP leg     824 nm / 159.2 min = 311 kt      ← not the OEI cruise speed
```

Those diversions are flown at `div_altitude: 10000` for the depressurization case. Low and
slow, and nothing to do with the speed the rule radius is built on.

The `map_data` field is not data — it is a URL to a companion JavaScript file SimBrief
generates for its own route viewer, and that file carries exactly the missing numbers:

```js
var etopsrule      = 370;
var etopsruledist  = 2694.8333333333;   // nm — the rule radius
var etopsthreshold = 60;                // minutes
var natsdir        = "E";               // which track set applies to this flight
```

The arithmetic closes: `2694.8333 ÷ (370 ÷ 60) = 437.0 kt`, and the threshold ring is that same
speed for 60 minutes — `437.0 nm`. One stored number yields both circles, and the implied OEI
speed is recoverable from it if ever needed.

Incidentally, that file's `routing[0]` is `KJFK`. SimBrief prepends the origin to its own map
route exactly as this design decided to, independently.

**The cost is a second HTTP fetch of an undocumented format.** It is a JavaScript file, not
JSON, so it is read with targeted expressions for the four scalars above rather than executed —
nothing in it is evaluated. It is small, same-host, and its URL is handed over in the payload.
Mitigation is degradation, not retry: a file that is missing, unreachable or unparseable leaves
the ring fields null, the briefing renders without circles, and the import succeeds. No ETOPS
data depends on it — it adds a layer to the map and nothing else.

`natsdir` is taken with it, because it answers directly which track direction applies rather
than inferring it from the flight's geography.

Two things in that file are deliberately ignored: `altnroutes`, redundant with the JSON's
`alternate_navlog` which already carries coordinates, and the per-airport weather blobs, for
the reason given above.

### The planned route is stored too, because the points need something to sit on

Plotting an ETOPS point requires the route it lies on. Checked what the system has:

```
flight.route ............ a string: "DCT MERIT DCT HFD ... ALLRY DCT 51N050W ..."
                          idents only, no coordinates
flight.positionReports .. where the aircraft actually went — flown, not planned,
                          and empty before departure
navlog.fix[] ............ 26 fixes with pos_lat/pos_long — NOT STORED
```

So today a briefing could place an equal-time point at 52.1 N 33.5 W and have nothing to draw
it against. The ETOPS points, the diversion legs and the tracks are all spatial, and the route
is the one line that makes them legible — an ETP is only meaningful as a position *along a
route* between two airports.

The planned route is therefore stored as ordered fixes with their positions. This is the
minimum of `navlog` needed for the briefing to be drawable: ident, position, altitude, elapsed
time and the airway used to reach it. The rest of the navlog — per-fix wind, temperature, Mach,
ground speed, fuel remaining, MORA, tropopause, shear — is deliberately left out, because it
belongs to a flight-log feature rather than to an ETOPS briefing, and storing it here would
make this change the owner of a table it does not use.

The `via_airway` field is the exception and is kept, because the oceanic routing classifier
already reads it and the briefing needs it to show which segment of the route is the track.

**Every fix carries a real position.** Checked all 26 on the reference plan: none is missing a
latitude or a longitude, and all are given to six decimal places. The route is drawable as
published, with no gap-filling and no lookup against a navdata source.

**The pseudo-fixes are kept.** `TOC` and `TOD` are not navigation waypoints, but they carry
genuine positions and are the points at which the altitude changes character. Keeping them
makes the vertical profile drawable from the same rows — 26,200 ft climbing at MERIT, 41,000 ft
at ORZEB, 2,600 ft at EGLL — rather than needing a second source.

**The departure airport is written as the first fix.** The navlog is asymmetric — the
destination appears as its final fix, the origin does not appear at all:

```
navlog.fix[0]  = MERIT  41.381950 −73.137431  26200 ft   ← 30 nm from the field
navlog.fix[25] = EGLL   51.477500  −0.461389   2600 ft   ← the destination IS a fix
                        ▲
                        exactly destination.pos_lat / pos_long
```

A route drawn straight from those rows starts in mid-air over Connecticut. Rather than leave
readers to patch the gap, the import writes the origin as the route's first fix, so the stored
route is symmetric and self-contained:

```
ordinal 0   KJFK   40.639928 −73.778692   13 ft   ete 0     stage CLB   ← added
ordinal 1   MERIT  41.381950 −73.137431   26200   ete 769   stage CLB
   …
ordinal 26  EGLL   51.477500  −0.461389   2600    ete 21930 stage DSC
```

The position is the airport's own, exactly as SimBrief already does for the destination. The
altitude is field elevation, because the flight is on the ground there — the destination's
2,600 ft is a crossing altitude rather than a field elevation, so the two ends are not
symmetric in altitude and should not be forced to be. Elapsed time is zero.

Doing this at import rather than at read means every consumer gets a complete route without
knowing the provider's quirk, and a route read back is drawable exactly as stored.

### Fixes are JSON on the track row

A track's fixes are read only as a whole — to draw it — and never queried individually. Seven
rows per track times sixteen tracks per flight would be 112 rows of pure ballast. This mirrors
the existing treatment of `positionReports` on a flight.

## Data model

### Schema

```
flight
  etopsRuleMinutes      Int?            370
  etopsRuleDistance     Decimal?        2694.8333  nm — the rule ring radius
  etopsThresholdMinutes Int?            60         — the threshold ring
  oceanicRouting        OceanicRouting? track | track_geometry | random
  oceanicTrackId        String?         "W"   — set for track and track_geometry
  oceanicTrackDirection TrackDirection? east — from natsdir
                                        ring fields null when the companion file is unavailable

flight_etops_point                      3 rows on the reference plan
  flightId              → flight
  kind                  EtopsPointKind  entry | exit | equal_time | critical
  ordinal               Int             1 for ETP1, 2 for ETP2 where a plan has both
  isCritical            Boolean         true on the point critical_point names
  adequateAirportId     String?         → airport   CYYT   (null on the ETP)
  posLat, posLong       Decimal         the fix itself, not the airport
  elapsedSeconds        Int             9735
  minFob, estFob        Int             22055 / 23090   kg
  criticalFuel          Int             8809
  condition             EtopsCondition  DC
  divAltitude           Int             10000
  divTimeSeconds        Int             5366
  divBurn               Int             6689

flight_etops_diversion                  1 row per leg; 2 for the ETP
  pointId               → flight_etops_point
  airportId             → airport        CYQX
  trackTrue, trackMag   Int              265 / 279
  distance              Int              824
  avgWindComponent      Int              −22
  avgTempDeviation      Int              9
  estFob                Int              6773

flight_etops_airport                    2 rows on the reference plan
  flightId              → flight
  airportId             → airport
  suitabilityStart/End  DateTime         23:01Z → 02:52Z
  plannedRunway         String           "21"
  forecastCeiling       Int              900     fcst_cig  — for the window
  forecastVisibility    Int              8050    fcst_vis  — for the window
  transitionAlt/Level   Int
                                         no METAR, TAF, ATIS or observed
                                         conditions — see Decisions

flight_oceanic_track                    16 rows on the reference plan
  flightId              → flight
  identifier            String           "W"
  direction             TrackDirection   east | west
  tmi                   String           "237"
  issuingOca            String           "CZQX"
  route                 String
  levels                Int[]            [340,350,360,370,380,390,400]
  validFrom, validTo    DateTime
  fixes                 Json             [{ident, lat, long}]

flight_route_fix                        26 rows on the reference plan
  flightId              → flight
  ordinal               Int              order along the route
  ident                 String           "52N030W"
  posLat, posLong       Decimal
  altitude              Int              39000
  elapsedSeconds        Int              13032
  viaAirway             String?          "NATW" — the track segment marker
  stage                 String           CLB | CRZ | DSC

flight_enroute_hazard                   5 SIGMETs on the reference plan
  flightId              → flight
  identifier            String           "93E"
  hazardType            HazardType       convective
  fir                   String
  validFrom, validTo    DateTime
  text                  String

flight_briefing_chart                   10 on the reference plan
  flightId              → flight
  name                  String           "SigWx 1 of 4"
  url                   String           directory + link, resolved at import
  ordinal               Int
```

Every child table cascade-deletes with the flight, as `flight_cargo_*` does.

### Provider types

`simbrief.types.ts` currently declares the ETOPS block as
`{ entry: Airport; exit: Airport; suitable_airport?: Airport | Airport[] }`. Every field this
change needs is absent, and typing the points as `Airport` is what allowed the AAP/SAP
confusion to compile. The points get their own types — an ETOPS point has coordinates, fuel and
a condition and is not an airport — and `suitable_airport` keeps `Airport` widened with the
suitability and weather fields it genuinely carries.

`tracks`, `sigmets`, `images` and `atc.fir_etops` are added. The `EmptyElement` pattern already
in the file covers SimBrief's habit of rendering absent values as `{}`, which appears in this
payload on `faa_code`, `notam_schedule` and `selcal` — the ETOPS block relies on it too.

## Risks / Trade-offs

**No legality assertion.** The briefing shows forecast conditions and a window and cannot say
whether an airport meets its minima. A pilot could read `900-8050` as approval. Mitigated by
reporting the forecast as forecast and never labelling an airport "suitable" as a verdict — the
word describes its planned role, not an assessment. If minima matter later, parsing the ETOPS
table out of `plan_html` is the recoverable route.

**Sixteen track rows per flight.** Accepted for snapshot fidelity, as above. If volume ever
bites, the fixes JSON is the bulk and the tracks a flight was not planned along could be
pruned — but not before there is a reason.

**`DC` is inferred.** The condition code is undocumented. `div_altitude: 10000` makes
depressurization the overwhelmingly likely reading, and the regulatory scenarios are engine
failure, depressurization, and both together. The enum stores the code as published and the
description records the inference rather than asserting it as fact; an unrecognised code is
stored, not rejected.

**One reference payload.** Every finding here comes from a single ETOPS plan. A flight with
more than one ETP, more than two suitable airports, or a westbound crossing will exercise
paths this design reasons about but has not seen. The array-or-single handling already in
`toOfpArray` covers the shape variance; the fixture set should grow the first time a real plan
disagrees.
