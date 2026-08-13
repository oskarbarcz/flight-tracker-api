## Purpose

Keeps the pilot flying a sector informed over Discord at the operational moments after check-in — when the load is known, when it is final, and when a departure delay needs allocating or has been approved.

## ADDED Requirements

### Requirement: Operational messages reach the flight's captain

The system SHALL send each operational private message to the captain of the flight it concerns, provided that captain has a linked Discord account and has the setting governing that message enabled. A single setting MAY govern more than one message — the delay allocation request and the delay approval share one. A flight with no captain SHALL produce no message.

#### Scenario: Captain receives the message

- **WHEN** an operational moment occurs on a flight whose captain has a linked Discord account and the governing setting enabled
- **THEN** that captain receives the message

#### Scenario: Captain disabled that kind of message

- **WHEN** the captain has disabled the setting governing the message the moment would produce
- **THEN** no message is delivered, and the captain's other messages are unaffected

#### Scenario: Captain has no linked account

- **WHEN** the captain has no linked Discord account
- **THEN** no message is delivered

#### Scenario: Flight has no captain

- **WHEN** the moment occurs on a flight nobody has checked in for
- **THEN** no message is delivered

#### Scenario: Delivery failure does not fail the action

- **WHEN** a message cannot be delivered because Discord is unreachable or rejects it
- **THEN** the action that triggered it still succeeds

### Requirement: Preliminary loadsheet is sent when boarding starts

The system SHALL send the captain the flight's preliminary loadsheet when boarding starts, carrying the crew assigned to the flight with each member's name and role, and the passenger count, cargo, payload, zero fuel weight and block fuel. Boarding a flight that has no preliminary loadsheet SHALL produce no message.

#### Scenario: Preliminary loadsheet delivered on boarding start

- **WHEN** boarding starts on a flight that has a preliminary loadsheet
- **THEN** the captain receives a message stating it is the preliminary loadsheet, with the loadsheet figures

#### Scenario: Assigned crew are named

- **WHEN** the flight has crew assigned to it
- **THEN** the message lists each crew member by name with their role

#### Scenario: Flight with no assigned crew

- **WHEN** the flight has no crew assigned
- **THEN** the message carries the loadsheet figures and no crew list

#### Scenario: Flight with no preliminary loadsheet

- **WHEN** boarding starts on a flight with no preliminary loadsheet
- **THEN** no message is delivered

### Requirement: Final loadsheet is sent when boarding finishes

The system SHALL send the captain the flight's final loadsheet when boarding finishes, carrying the same figures as the preliminary message and identifying itself as the final loadsheet. Finishing boarding on a flight that has no final loadsheet SHALL produce no message.

#### Scenario: Final loadsheet delivered on boarding finish

- **WHEN** boarding finishes on a flight that has a final loadsheet
- **THEN** the captain receives a message stating it is the final loadsheet, with the loadsheet figures

#### Scenario: Final loadsheet differs from the preliminary one

- **WHEN** the final loadsheet carries different figures from the preliminary one
- **THEN** the message reports the final figures

### Requirement: Delay allocation is requested when a delay is raised

The system SHALL tell the captain when a departure delay is raised against their flight, stating how many minutes must be allocated and linking to where the allocation is made.

#### Scenario: Captain is asked to allocate

- **WHEN** a departure delay is raised for a flight
- **THEN** the captain receives a message stating the delay in minutes and asking for it to be allocated

#### Scenario: Message links to the allocation screen

- **WHEN** a delay allocation message is delivered
- **THEN** it carries a link to the delay allocation screen for that flight

### Requirement: Approved allocations are confirmed

The system SHALL tell the captain when operations accepts a delay report filed against their flight.

#### Scenario: Captain is told the allocation was approved

- **WHEN** operations accepts a delay report on a flight
- **THEN** the captain receives a message confirming the delay allocation was approved

#### Scenario: Rejected reports produce no confirmation

- **WHEN** operations rejects a delay report
- **THEN** no approval message is delivered
