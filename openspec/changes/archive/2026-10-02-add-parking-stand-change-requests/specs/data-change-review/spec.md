## ADDED Requirements

### Requirement: Cabin crew can propose a change to a parking stand

The system SHALL allow a cabin crew user to propose a change to a parking stand of an airport naming
any non-empty combination of its name, terminal, jet bridge, stairs, deicing, deicing notes, ground
power, pre-conditioned air, type, spot type, assistance, location category, noise sensitivity, noise
sensitivity notes, noise sensitivity start and end time, fueling options and coordinates. Each
proposed value SHALL be validated as it would be for a direct edit of the stand, and a proposed
terminal SHALL be a terminal of the stand's airport. The system SHALL record the proposal as pending
and SHALL NOT change the stand. The airport a stand belongs to SHALL NOT be proposable. Operations
and admin users SHALL be rejected as forbidden and unauthenticated callers as unauthorized.

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

#### Scenario: The airport is not proposable

- **WHEN** a cabin crew user proposes a different airport for a stand
- **THEN** the request is rejected with a validation error and no proposal is created

#### Scenario: A stand proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the stand's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

#### Scenario: Operations cannot propose a stand change

- **WHEN** an operations user proposes a change to a stand
- **THEN** the request is rejected as forbidden

### Requirement: Stand proposals are reviewed in the shared queue

The system SHALL list, show, accept, reject and let the requester withdraw parking stand proposals
through the same review queue and actions as airport proposals. Accepting a stand proposal SHALL
apply every proposed value to the stand at once, regardless of changes made to it since submission.

#### Scenario: The queue can be filtered to stand proposals

- **WHEN** an operations user lists proposals filtered by kind `parkingPosition`
- **THEN** only parking stand proposals are returned, oldest first

#### Scenario: A reviewer sees current and proposed stand values

- **WHEN** an operations user reads a pending stand proposal that changes its terminal and name
- **THEN** the response lists the name and terminal fields with the stand's current values beside the proposed ones

#### Scenario: Accepting applies the stand values

- **WHEN** an operations user accepts a pending stand proposal changing its terminal and name
- **THEN** the proposal is accepted
- **AND** reading the stand reports the proposed terminal and name

## MODIFIED Requirements

### Requirement: New kinds of data join the same queue

The system SHALL identify every proposal by its kind of data and the record it targets, so that
proposals for every supported kind appear in the same review queue and are decided by the same
accept, reject and withdraw actions. Airports and parking stands SHALL be the supported kinds;
runways, terminals and gates, once supported, SHALL join the same queue. Until a kind is
supported, the system SHALL NOT accept proposals of that kind.

#### Scenario: Only supported kinds can be filtered

- **WHEN** an operations user lists the review queue filtered by a kind of data that is not supported
- **THEN** the request is rejected with a validation error listing the supported kinds
