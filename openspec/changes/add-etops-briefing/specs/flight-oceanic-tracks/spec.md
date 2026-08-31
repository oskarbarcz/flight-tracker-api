## Purpose

The oceanic track message published with a flight's plan, kept per flight as published, and the
three-state record of how the flight relates to it: cleared on a track, following a track's
geometry, or randomly routed.

## ADDED Requirements

### Requirement: A flight snapshots the oceanic track message it was planned against

When a flight is created from a SimBrief operational flight plan publishing organised track
data, the system SHALL store every track the plan publishes against that flight, in both
directions, as published. The snapshot SHALL belong to the flight and SHALL NOT be shared
between flights, so that a briefing read later reports the tracks the flight was actually
planned against rather than whatever tracks are current at the time of reading.

#### Scenario: Every published track is stored

- **WHEN** a flight is created from a plan publishing sixteen tracks
- **THEN** all sixteen are recorded against that flight

#### Scenario: Both directions are kept

- **WHEN** a plan publishes an eastbound and a westbound set
- **THEN** both sets are recorded, and neither is discarded at import

#### Scenario: A later flight does not alter an earlier snapshot

- **GIVEN** a flight whose tracks were snapshotted at import
- **WHEN** another flight is later created from a plan publishing a reissued track message
- **THEN** the first flight's tracks are unchanged

#### Scenario: A plan without tracks

- **WHEN** a flight is created from a plan publishing no track data
- **THEN** no tracks are recorded and the import completes normally

### Requirement: Each stored track carries its direction, message and validity

The system SHALL record for each track its identifier, its direction, the message identifier it
was published under, the oceanic control area that issued it, its route, the flight levels
available on it, the period it is valid for, and its fixes with their positions so that the
track can be drawn.

Tracks published under different message identifiers SHALL retain their own validity periods,
since the sets are issued separately and need not be valid at the same time.

#### Scenario: A track reports its message and validity

- **WHEN** an eastbound track published under message 237 by Gander is read
- **THEN** it reports that identifier, that issuing area, its direction, its levels and its own validity period

#### Scenario: The two directions carry different validity periods

- **GIVEN** a plan whose westbound set expired before its eastbound set became valid
- **WHEN** the flight's tracks are read
- **THEN** each direction reports its own period, and the expired set is not presented as current

#### Scenario: A track can be drawn

- **WHEN** a track is read
- **THEN** its fixes are reported with positions, in order

### Requirement: A flight reports how it relates to the track structure

The system SHALL classify a flight's oceanic routing as one of three states: routed along a
track and filed as that track; routed along a track's geometry but filed as individual
waypoints; or not routed along any track. Where either of the first two applies, the system
SHALL record which track. The classification SHALL be resolved at import.

A flight routed along a track's geometry SHALL NOT be reported as being on that track, because
the two describe different clearances.

#### Scenario: Planned along a track that is not active

- **GIVEN** a plan routing along Track W's waypoints, filing them individually, whose remark states the track is not active at the crossing time
- **WHEN** the flight's oceanic routing is read
- **THEN** it reports that the flight follows Track W's geometry, names Track W, and does not report the flight as being on Track W

#### Scenario: Flying an active track

- **GIVEN** a plan routing along a track and filing that track in its ATC route
- **WHEN** the flight's oceanic routing is read
- **THEN** it reports the flight as being on that track

#### Scenario: A random route

- **GIVEN** a plan whose route follows no published track
- **WHEN** the flight's oceanic routing is read
- **THEN** it reports the flight as randomly routed and names no track
