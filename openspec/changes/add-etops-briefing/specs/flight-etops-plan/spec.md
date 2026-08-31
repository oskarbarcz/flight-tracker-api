## Purpose

The ETOPS plan a flight was built against: the diversion rule it is certified to, the entry,
exit, equal-time and critical points it passes, the airports each point would turn toward, and
the range rings that make the constraint drawable. A snapshot taken when the plan is imported,
so a briefing read later shows what the flight was planned against.

## ADDED Requirements

### Requirement: An ETOPS flight records the rule it is planned against

When a flight is created from a SimBrief operational flight plan that carries an ETOPS section,
the system SHALL store the ETOPS rule time in minutes as published. A flight whose plan carries
no ETOPS section SHALL record no rule time, and SHALL NOT be prevented from being created.

#### Scenario: An ETOPS plan records its rule time

- **WHEN** a flight is created from a plan carrying an ETOPS rule of 370 minutes
- **THEN** the flight reports an ETOPS rule time of 370 minutes

#### Scenario: A plan without an ETOPS section

- **WHEN** a flight is created from a plan carrying no ETOPS section
- **THEN** the flight reports no ETOPS rule time and the import completes normally

### Requirement: The plan's ETOPS points are stored with their positions and fuel

The system SHALL store each ETOPS point the plan computes — the entry point, the exit point and
the equal-time point — recording for each its own position, the elapsed time from departure at
which it is reached, the minimum fuel required on board there, the fuel expected on board
there, the critical fuel for its diversion, the condition the calculation assumes, and the
diversion altitude.

The position stored SHALL be the position of the point itself and SHALL NOT be the position of
any airport associated with it.

#### Scenario: The three points are stored

- **WHEN** a flight is created from a plan carrying an entry point, an exit point and an equal-time point
- **THEN** three ETOPS points are recorded, one of each kind, each with its position, elapsed time, fuel figures and condition

#### Scenario: A point's position is the point, not its airport

- **GIVEN** an entry point at 51.75 N whose adequate airport lies at 47.62 N
- **WHEN** the flight's ETOPS points are read
- **THEN** the entry point reports the position of the point and not the position of the airport

#### Scenario: An unrecognised condition code is preserved

- **WHEN** a plan reports an ETOPS condition the system does not recognise
- **THEN** the condition is stored as published and the import completes normally

### Requirement: An ETOPS point distinguishes its adequate airport from its suitable airport

The system SHALL record the adequate airport of an entry or exit point — the airport defining
the threshold, published as the point's own ICAO code — separately from the suitable airport
its diversion leg names. These SHALL NOT be conflated, and the airport a crew would divert to
SHALL be the one the diversion leg names.

An equal-time point SHALL record no adequate airport, having none.

#### Scenario: Entry point roles are distinguished

- **GIVEN** an entry point whose published ICAO code is CYYT and whose diversion leg names CYQX
- **WHEN** the flight's ETOPS points are read
- **THEN** the entry point reports CYYT as its adequate airport and CYQX as the airport its diversion leg names

#### Scenario: One airport in both roles at the same point

- **GIVEN** an exit point whose published ICAO code and whose diversion leg both name EINN
- **WHEN** the flight's ETOPS points are read
- **THEN** the exit point reports EINN in both roles, and the airport is imported once

#### Scenario: An equal-time point has no adequate airport

- **WHEN** the flight's equal-time point is read
- **THEN** it reports no adequate airport

### Requirement: Each ETOPS point records its diversion legs

The system SHALL record one diversion leg per airport the point can divert to, each carrying
the airport, the true and magnetic track toward it, the distance, the average wind component
and temperature deviation along the leg, the diversion time and burn, and the fuel expected on
arrival. An equal-time point SHALL record two legs, one toward each of its airports; an entry
or exit point SHALL record one.

#### Scenario: The equal-time point has two legs

- **WHEN** the flight's equal-time point is read
- **THEN** it reports two diversion legs, one toward each of its airports, each with its own track, distance and wind component

#### Scenario: Entry and exit have one leg each

- **WHEN** the flight's entry and exit points are read
- **THEN** each reports exactly one diversion leg

#### Scenario: Equal fuel on arrival is not treated as duplication

- **WHEN** an equal-time point's two legs report the same fuel on arrival
- **THEN** both legs are recorded, since equal fuel on arrival is what makes the point an equal-time point

### Requirement: Every stored ETOPS point can be plotted

The system SHALL store every ETOPS point with the position the plan publishes for it, so that
each point can be drawn on a map without further derivation. No point the plan publishes SHALL
be stored without a position, and no point SHALL be discarded on the grounds that another point
resembles it.

#### Scenario: Every point carries a position

- **WHEN** the flight's ETOPS points are read
- **THEN** every point reports a latitude and a longitude

#### Scenario: Points can be drawn against the planned route

- **WHEN** the flight's ETOPS points and planned route are read together
- **THEN** each point's position and the route's fixes are reported in the same terms, so the points can be placed along the route

### Requirement: The critical point is stored, whether or not it coincides with another point

The system SHALL record which point the plan's critical point names. Where the critical point
shares its position with a point already stored, the system SHALL mark that point critical
rather than storing a second point at the same position. Where the critical point names a
position no stored point occupies, the system SHALL store it as a point in its own right.

Exactly one stored point SHALL carry the mark, and the critical point's position SHALL be
plottable in either case.

#### Scenario: The critical point coincides with the equal-time point

- **GIVEN** a plan whose critical point shares the equal-time point's position, elapsed time and fuel exactly
- **WHEN** the flight's ETOPS points are read
- **THEN** three points are reported, the equal-time point is marked critical, and no two points share a position

#### Scenario: The critical point names a position of its own

- **GIVEN** a plan whose critical point lies at a position no other ETOPS point occupies
- **WHEN** the flight's ETOPS points are read
- **THEN** it is reported as a point in its own right, marked critical, with its own position

#### Scenario: Exactly one point is critical

- **WHEN** the flight's ETOPS points are read
- **THEN** exactly one of them is marked critical

### Requirement: A plan may carry more than one equal-time point

The system SHALL store every equal-time point the plan publishes, ordered as the plan numbers
them, and SHALL NOT assume a plan carries only one.

#### Scenario: A plan with a single equal-time point

- **WHEN** a flight is created from a plan carrying one equal-time point
- **THEN** one equal-time point is reported

#### Scenario: A plan with two equal-time points

- **WHEN** a flight is created from a plan carrying two equal-time points
- **THEN** both are reported in order, each with its own position and diversion legs

### Requirement: The ETOPS range rings are stored so the constraint can be drawn

The system SHALL store the rule radius and the threshold time an ETOPS flight is planned
against, so that the rule ring and the threshold ring can be drawn around the flight's adequate
and suitable airports. These figures SHALL be taken as published rather than derived from the
diversion legs, whose speeds reflect a low-altitude diversion and not the cruise speed the
radius is built on.

Where the published figures cannot be obtained, the system SHALL record no radius, and the
flight SHALL still be created with its ETOPS plan intact.

#### Scenario: The rings are stored for an ETOPS flight

- **GIVEN** a flight planned against a 370 minute rule with a published rule radius of 2,694.8 nm
- **WHEN** the flight's ETOPS plan is read
- **THEN** it reports that radius and the threshold time, so both rings can be drawn

#### Scenario: The threshold ring places the entry and exit points

- **GIVEN** an entry point 438 nm from its adequate airport and a threshold ring of 437 nm
- **WHEN** the ETOPS plan and its points are read together
- **THEN** the entry point lies on the threshold ring around its adequate airport

#### Scenario: The rings are unavailable

- **WHEN** a flight is created from a plan whose published radius cannot be obtained
- **THEN** the flight reports no rule radius, its ETOPS points and airports are unaffected, and the import completes normally

### Requirement: The ETOPS fuel penalty is reported with the point that governs it

The system SHALL derive the fuel penalty ETOPS imposes as the greatest shortfall of expected
fuel on board against critical fuel across the flight's ETOPS points, and zero where no point
falls short. The system SHALL report the point that governs the result and the margin at that
point, so that a penalty of zero is explained rather than merely stated.

#### Scenario: No point falls short

- **GIVEN** a flight whose worst point carries 14,566 kg of critical fuel against 19,344 kg expected on board
- **WHEN** the ETOPS fuel penalty is read
- **THEN** the penalty is nil, the equal-time point is reported as governing, and a surplus of 4,778 kg is reported

#### Scenario: A point drives a penalty

- **GIVEN** a flight whose worst point requires more critical fuel than is expected on board
- **WHEN** the ETOPS fuel penalty is read
- **THEN** the penalty is the shortfall at that point and that point is reported as governing
