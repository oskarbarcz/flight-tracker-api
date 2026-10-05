## ADDED Requirements

### Requirement: Cabin crew can propose a change to a gate

The system SHALL allow a cabin crew user to propose a change to a gate of an airport naming any
non-empty combination of its name, border category, terminal, linked parking stand and coordinates.
Each proposed value SHALL be validated as it would be for a direct edit of the gate. A proposed
terminal SHALL be a terminal of the gate's airport, and a proposed parking stand SHALL be a stand
of the gate's airport or `null`, which proposes unlinking the gate from its stand. Any other field
SHALL NOT be proposed as `null`. The system SHALL record the proposal as pending and SHALL NOT
change the gate. The airport a gate belongs to SHALL NOT be proposable. Operations and admin users
SHALL be rejected as forbidden and unauthenticated callers as unauthorized.

#### Scenario: Crew propose a stand and coordinates for a gate

- **WHEN** a cabin crew user proposes linking a gate to a stand of the same airport and different coordinates
- **THEN** the proposal is created as pending for that gate with the proposed stand and coordinates
- **AND** reading the gate still reports its previous stand and coordinates

#### Scenario: Crew propose unlinking a gate from its stand

- **WHEN** a cabin crew user proposes `null` as the stand of a gate that is linked to one
- **THEN** the proposal is created as pending, showing the gate's current stand beside the proposed `null`

#### Scenario: A stand of another airport is rejected

- **WHEN** a cabin crew user proposes linking a gate to a stand that does not belong to the gate's airport
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: A terminal of another airport is rejected for a gate

- **WHEN** a cabin crew user proposes moving a gate to a terminal that does not belong to the gate's airport
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: A gate of another airport is rejected

- **WHEN** a cabin crew user proposes a change to a gate through an airport it does not belong to
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: A required gate value proposed as null is rejected

- **WHEN** a cabin crew user proposes `null` as a gate's name
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: An invalid gate value is rejected

- **WHEN** a cabin crew user proposes a border category outside the known set
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: The airport is not proposable for a gate

- **WHEN** a cabin crew user proposes a different airport for a gate
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A gate proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the gate's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

#### Scenario: Operations cannot propose a gate change

- **WHEN** an operations user proposes a change to a gate
- **THEN** the request is rejected as forbidden

### Requirement: Cabin crew can propose a change to a terminal

The system SHALL allow a cabin crew user to propose a change to a terminal of an airport naming any
non-empty combination of its short name, full name, average taxi time, operator codes, briefing
notes and footprint. Each proposed value SHALL be validated as it would be for a direct edit of the
terminal, and only its briefing notes and footprint SHALL be proposable as `null`. The system SHALL
record the proposal as pending and SHALL NOT change the terminal. The airport a terminal belongs
to SHALL NOT be proposable. Operations and admin users SHALL be rejected as forbidden and
unauthenticated callers as unauthorized.

#### Scenario: Crew propose a taxi time and operators for a terminal

- **WHEN** a cabin crew user proposes a different average taxi time and operator codes for a terminal
- **THEN** the proposal is created as pending for that terminal with the proposed values
- **AND** reading the terminal still reports its previous taxi time and operator codes

#### Scenario: Crew propose a terminal footprint

- **WHEN** a cabin crew user proposes a footprint of at least three points for a terminal
- **THEN** the proposal is created as pending with the proposed footprint

#### Scenario: A footprint with too few points is rejected

- **WHEN** a cabin crew user proposes a terminal footprint of two points
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A required terminal value proposed as null is rejected

- **WHEN** a cabin crew user proposes `null` as a terminal's average taxi time
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A terminal of another airport is rejected

- **WHEN** a cabin crew user proposes a change to a terminal through an airport it does not belong to
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: The airport is not proposable for a terminal

- **WHEN** a cabin crew user proposes a different airport for a terminal
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A terminal proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the terminal's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

#### Scenario: Operations cannot propose a terminal change

- **WHEN** an operations user proposes a change to a terminal
- **THEN** the request is rejected as forbidden

### Requirement: Cabin crew can propose a change to a runway

The system SHALL allow a cabin crew user to propose a change to a runway of an airport naming any
non-empty combination of its designator, length, width, displaced threshold, true heading, magnetic
heading, threshold elevation, surface type, lighting type and threshold coordinates. Each proposed
value SHALL be validated as it would be for a direct edit of the runway, and proposed threshold
coordinates SHALL be a valid latitude and longitude. Only the displaced threshold, true heading and
threshold elevation SHALL be proposable as `null`. The system SHALL record the proposal as pending
and SHALL NOT change the runway. The airport a runway belongs to SHALL NOT be proposable. Operations
and admin users SHALL be rejected as forbidden and unauthenticated callers as unauthorized.

#### Scenario: Crew propose a lighting type and magnetic heading for a runway

- **WHEN** a cabin crew user proposes a different lighting type and magnetic heading for a runway
- **THEN** the proposal is created as pending for that runway with the proposed values
- **AND** reading the runway still reports its previous lighting type and magnetic heading

#### Scenario: An invalid designator is rejected

- **WHEN** a cabin crew user proposes a runway designator outside 01–36 with an optional L, C or R suffix
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: Malformed threshold coordinates are rejected

- **WHEN** a cabin crew user proposes threshold coordinates whose latitude is not a number
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A required runway value proposed as null is rejected

- **WHEN** a cabin crew user proposes `null` as a runway's length
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A runway of another airport is rejected

- **WHEN** a cabin crew user proposes a change to a runway through an airport it does not belong to
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: The airport is not proposable for a runway

- **WHEN** a cabin crew user proposes a different airport for a runway
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A runway proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the runway's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

#### Scenario: Operations cannot propose a runway change

- **WHEN** an operations user proposes a change to a runway
- **THEN** the request is rejected as forbidden

### Requirement: Gate, terminal and runway proposals are reviewed in the shared queue

The system SHALL list, show, accept, reject and let the requester withdraw gate, terminal and runway
proposals through the same review queue and actions as airport proposals. Accepting one of these
proposals SHALL apply every proposed value to the record at once, regardless of changes made to it
since submission. Accepting a gate proposal whose proposed stand or terminal no longer exists SHALL
be rejected as not found, leaving the proposal pending and the gate unchanged.

#### Scenario: The queue can be filtered to gate proposals

- **WHEN** an operations user lists proposals filtered by kind `gate`
- **THEN** only gate proposals are returned, oldest first

#### Scenario: The queue can be filtered to terminal proposals

- **WHEN** an operations user lists proposals filtered by kind `terminal`
- **THEN** only terminal proposals are returned, oldest first

#### Scenario: The queue can be filtered to runway proposals

- **WHEN** an operations user lists proposals filtered by kind `runway`
- **THEN** only runway proposals are returned, oldest first

#### Scenario: A reviewer sees current and proposed gate values

- **WHEN** an operations user reads a pending gate proposal that links the gate to a stand
- **THEN** the response lists the stand field with the gate's current stand beside the proposed one

#### Scenario: A reviewer sees current and proposed runway values

- **WHEN** an operations user reads a pending runway proposal that changes its lighting type
- **THEN** the response lists the lighting type field with the runway's current value beside the proposed one

#### Scenario: Accepting applies the gate values

- **WHEN** an operations user accepts a pending gate proposal linking the gate to a stand
- **THEN** the proposal is accepted
- **AND** reading the gate reports the proposed stand

#### Scenario: Accepting applies the terminal values

- **WHEN** an admin accepts a pending terminal proposal changing its average taxi time
- **THEN** the proposal is accepted
- **AND** reading the terminal reports the proposed taxi time

#### Scenario: Accepting applies the runway values

- **WHEN** an operations user accepts a pending runway proposal changing its lighting type
- **THEN** the proposal is accepted
- **AND** reading the runway reports the proposed lighting type

#### Scenario: A gate proposal whose stand was removed cannot be accepted

- **GIVEN** a pending gate proposal linking the gate to a stand, after which an operations user removed that stand
- **WHEN** an operations user accepts the proposal
- **THEN** the request is rejected as not found
- **AND** the proposal stays pending and the gate is unchanged

## MODIFIED Requirements

### Requirement: New kinds of data join the same queue

The system SHALL identify every proposal by its kind of data and the record it targets, so that
proposals for every supported kind appear in the same review queue and are decided by the same
accept, reject and withdraw actions. Airports, parking stands, gates, terminals and runways SHALL
be the supported kinds. Until a kind is supported, the system SHALL NOT accept proposals of that
kind.

#### Scenario: Only supported kinds can be filtered

- **WHEN** an operations user lists the review queue filtered by a kind of data that is not supported
- **THEN** the request is rejected with a validation error listing the supported kinds

### Requirement: Cabin crew can propose a change to an airport

The system SHALL allow a cabin crew user to propose a change to an airport naming any non-empty
combination of its continent, name, country, timezone, location, shape and city, where the city is
an existing city identified by id. Each proposed value SHALL be validated as it would be for a
direct edit of the airport, and only its shape SHALL be proposable as `null`. The system SHALL
record the proposal as pending, attributed to the proposing user, and SHALL NOT change the airport.
The response SHALL return the created proposal.

#### Scenario: Crew propose a new timezone and location

- **WHEN** a cabin crew user proposes a different timezone and location for an existing airport
- **THEN** the proposal is created as pending with the proposed timezone and location
- **AND** reading the airport still reports its previous timezone and location

#### Scenario: Crew propose a different city

- **WHEN** a cabin crew user proposes moving an airport to another existing city by its id
- **THEN** the proposal is created as pending naming that city

#### Scenario: An empty proposal is rejected

- **WHEN** a cabin crew user proposes a change to an airport that names no field
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: An invalid value is rejected

- **WHEN** a cabin crew user proposes a country that is not a known country code
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A required airport value proposed as null is rejected

- **WHEN** a cabin crew user proposes `null` as an airport's city
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A proposal for an unknown airport is rejected

- **WHEN** a cabin crew user proposes a change to an airport that does not exist
- **THEN** the request is rejected as not found

#### Scenario: A proposal naming an unknown city is rejected

- **WHEN** a cabin crew user proposes moving an airport to a city id that does not exist
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: A proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the airport's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

### Requirement: Cabin crew can propose a change to a parking stand

The system SHALL allow a cabin crew user to propose a change to a parking stand of an airport naming
any non-empty combination of its name, terminal, jet bridge, stairs, deicing, deicing notes, ground
power, pre-conditioned air, type, spot type, assistance, location category, noise sensitivity, noise
sensitivity notes, noise sensitivity start and end time, fueling options and coordinates. Each
proposed value SHALL be validated as it would be for a direct edit of the stand, and a proposed
terminal SHALL be a terminal of the stand's airport. Only its deicing notes, noise sensitivity
notes, noise sensitivity start and end time and coordinates SHALL be proposable as `null`. The
system SHALL record the proposal as pending and SHALL NOT change the stand. The airport a stand
belongs to SHALL NOT be proposable. Operations and admin users SHALL be rejected as forbidden and
unauthenticated callers as unauthorized.

#### Scenario: Crew propose ground power and coordinates for a stand

- **WHEN** a cabin crew user proposes different ground power and coordinates for a stand
- **THEN** the proposal is created as pending for that stand with the proposed values
- **AND** reading the stand still reports its previous ground power and coordinates

#### Scenario: Crew propose another terminal of the same airport

- **WHEN** a cabin crew user proposes moving a stand to another terminal of the same airport
- **THEN** the proposal is created as pending naming that terminal

#### Scenario: A terminal of another airport is rejected

- **WHEN** a cabin crew user proposes a terminal that does not belong to the stand's airport
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: A stand of another airport is rejected

- **WHEN** a cabin crew user proposes a change to a stand through an airport it does not belong to
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: An invalid stand value is rejected

- **WHEN** a cabin crew user proposes a ground power value outside the known set
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A required stand value proposed as null is rejected

- **WHEN** a cabin crew user proposes `null` as a stand's ground power
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: The airport is not proposable

- **WHEN** a cabin crew user proposes a different airport for a stand
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A stand proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the stand's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

#### Scenario: Operations cannot propose a stand change

- **WHEN** an operations user proposes a change to a stand
- **THEN** the request is rejected as forbidden
