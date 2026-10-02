# data-change-review Specification

## Purpose

Lets cabin crew propose corrections to curated reference data — airports first, later runways,
terminals, parking stands and gates — and lets operations and admins review every proposal in one
queue before anything changes.

## Requirements

### Requirement: Cabin crew can propose a change to an airport

The system SHALL allow a cabin crew user to propose a change to an airport naming any non-empty
combination of its continent, name, country, timezone, location, shape and city, where the city is
an existing city identified by id. Each proposed value SHALL be validated as it would be for a
direct edit of the airport. The system SHALL record the proposal as pending, attributed to the
proposing user, and SHALL NOT change the airport. The response SHALL return the created proposal.

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

#### Scenario: A proposal for an unknown airport is rejected

- **WHEN** a cabin crew user proposes a change to an airport that does not exist
- **THEN** the request is rejected as not found

#### Scenario: A proposal naming an unknown city is rejected

- **WHEN** a cabin crew user proposes moving an airport to a city id that does not exist
- **THEN** the request is rejected as not found and no proposal is created

#### Scenario: A proposal that changes nothing is rejected

- **WHEN** a cabin crew user proposes values that are all equal to the airport's current values
- **THEN** the request is rejected as unprocessable and no proposal is created

### Requirement: Only cabin crew may propose a change

The system SHALL reject a proposal from an operations or admin user as forbidden, since those roles
edit data directly, and SHALL reject a proposal without an access token as unauthorized.

#### Scenario: Operations cannot propose a change

- **WHEN** an operations user proposes a change to an airport
- **THEN** the request is rejected as forbidden

#### Scenario: Admins cannot propose a change

- **WHEN** an admin proposes a change to an airport
- **THEN** the request is rejected as forbidden

#### Scenario: An unauthenticated caller cannot propose a change

- **WHEN** a proposal is sent without an access token
- **THEN** the request is rejected as unauthorized

### Requirement: Several proposals may be pending for the same data

The system SHALL accept a new proposal for an airport even when other proposals for that airport,
from the same or another user, are still pending.

#### Scenario: A second proposal for the same airport

- **GIVEN** a pending proposal for an airport
- **WHEN** another cabin crew user proposes a change to the same airport
- **THEN** the proposal is created and both proposals are pending

### Requirement: One review queue holds every kind of proposal

The system SHALL let operations users and admins list proposals of every kind of data in one queue,
each entry naming its kind, the record it targets, the proposing user, its status and when it was
submitted. The list SHALL be ordered oldest submission first and SHALL be filterable by status and
by kind of data. Cabin crew users SHALL be rejected as forbidden and unauthenticated callers as
unauthorized.

#### Scenario: Operations list pending proposals

- **WHEN** an operations user lists proposals filtered by status `pending`
- **THEN** only pending proposals are returned, oldest first

#### Scenario: Admins list the queue

- **WHEN** an admin lists proposals without a filter
- **THEN** proposals in every status are returned, oldest first

#### Scenario: The queue can be filtered by kind of data

- **WHEN** an operations user lists proposals filtered by kind `airport`
- **THEN** only airport proposals are returned

#### Scenario: Cabin crew cannot read the queue

- **WHEN** a cabin crew user lists the review queue
- **THEN** the request is rejected as forbidden

### Requirement: A reviewer sees current and proposed values

The system SHALL let operations users and admins read a single proposal, reporting for each field
it touches the field's current value, read at the time of the request, beside the proposed value.
An unknown proposal SHALL be rejected as not found.

#### Scenario: Reading a pending proposal

- **WHEN** an operations user reads a pending proposal that changes an airport's name
- **THEN** the response lists the name field with the airport's current name and the proposed name

#### Scenario: Drift since submission is visible

- **GIVEN** a pending proposal changing an airport's timezone, after which an operations user edited that airport's timezone directly
- **WHEN** an operations user reads the proposal
- **THEN** the current value shown is the timezone after the direct edit

#### Scenario: Reading an unknown proposal

- **WHEN** an operations user reads a proposal id that does not exist
- **THEN** the request is rejected as not found

### Requirement: A reviewer accepts a proposal as a whole

The system SHALL let operations users and admins accept a pending proposal, applying all of its
proposed values to the targeted record at once, regardless of changes made to that record since
the proposal was submitted. The proposal SHALL become accepted, recording who decided it and when.
Accepting a proposal that is not pending SHALL be rejected as a conflict, and accepting a proposal
whose target no longer exists SHALL be rejected as not found, leaving the proposal pending.

#### Scenario: Accepting applies the proposed values

- **WHEN** an operations user accepts a pending proposal that changes an airport's name and city
- **THEN** the proposal is accepted
- **AND** reading the airport reports the proposed name and city

#### Scenario: Last write wins

- **GIVEN** a pending proposal changing an airport's timezone, after which an operations user edited that airport's timezone directly
- **WHEN** an operations user accepts the proposal
- **THEN** the airport reports the proposed timezone

#### Scenario: A decided proposal cannot be accepted again

- **WHEN** an operations user accepts a proposal that is already rejected
- **THEN** the request is rejected as a conflict and the proposal stays rejected

#### Scenario: Cabin crew cannot accept a proposal

- **WHEN** a cabin crew user accepts a pending proposal
- **THEN** the request is rejected as forbidden and the proposal stays pending

### Requirement: A reviewer rejects a proposal with a reason

The system SHALL let operations users and admins reject a pending proposal with a non-empty reason,
leaving the targeted record unchanged. The proposal SHALL become rejected, recording the reason,
who decided it and when. Rejecting a proposal that is not pending SHALL be rejected as a conflict.

#### Scenario: Rejecting keeps the data as it was

- **WHEN** an admin rejects a pending airport proposal with a reason
- **THEN** the proposal is rejected with that reason and the airport is unchanged

#### Scenario: A rejection needs a reason

- **WHEN** an operations user rejects a pending proposal without a reason
- **THEN** the request is rejected with a validation error and the proposal stays pending

#### Scenario: A decided proposal cannot be rejected

- **WHEN** an operations user rejects a proposal that is already accepted
- **THEN** the request is rejected as a conflict

### Requirement: Crew follow and withdraw their own proposals

The system SHALL let a cabin crew user list only their own proposals, newest first, each with its
status and, once rejected, the reason, optionally filtered by status. An unknown status
filter SHALL be rejected with a validation error naming the accepted statuses. The system SHALL let the proposing user withdraw their own
pending proposal, after which it SHALL be withdrawn and SHALL no longer be decidable. Withdrawing
another user's proposal SHALL be rejected as forbidden, and withdrawing a proposal that is not
pending SHALL be rejected as a conflict.

#### Scenario: Crew list their own proposals

- **WHEN** a cabin crew user lists their proposals
- **THEN** only proposals they submitted are returned, including rejected ones with the reason

#### Scenario: Crew filter their proposals by status

- **WHEN** a cabin crew user lists their proposals filtered by status `pending`
- **THEN** only their own pending proposals are returned, newest first

#### Scenario: An unknown status filter is rejected

- **WHEN** a cabin crew user lists their proposals filtered by a status that does not exist
- **THEN** the request is rejected with a validation error listing the accepted statuses

#### Scenario: Crew withdraw a pending proposal

- **WHEN** a cabin crew user withdraws their own pending proposal
- **THEN** the proposal is withdrawn and accepting it afterwards is rejected as a conflict

#### Scenario: Crew cannot withdraw someone else's proposal

- **WHEN** a cabin crew user withdraws a pending proposal submitted by another user
- **THEN** the request is rejected as forbidden and the proposal stays pending

#### Scenario: A decided proposal cannot be withdrawn

- **WHEN** a cabin crew user withdraws their own accepted proposal
- **THEN** the request is rejected as a conflict

### Requirement: New kinds of data join the same queue

The system SHALL identify every proposal by its kind of data and the record it targets, so that
proposals for every supported kind appear in the same review queue and are decided by the same
accept, reject and withdraw actions. Airports and parking stands SHALL be the supported kinds;
runways, terminals and gates, once supported, SHALL join the same queue. Until a kind is
supported, the system SHALL NOT accept proposals of that kind.

#### Scenario: Only supported kinds can be filtered

- **WHEN** an operations user lists the review queue filtered by a kind of data that is not supported
- **THEN** the request is rejected with a validation error listing the supported kinds

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
