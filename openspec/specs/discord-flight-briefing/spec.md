# discord-flight-briefing Specification

## Purpose

Delivers the pre-flight briefing to a pilot as a Discord private message the moment they check in, and lets each pilot decide whether they want to receive it.

## Requirements

### Requirement: Briefing is delivered on check-in

The system SHALL send a briefing private message on Discord to the pilot who checks in for a flight, provided that pilot has a linked Discord account and has briefing messages enabled.

#### Scenario: Pilot with a linked account receives the briefing

- **WHEN** a pilot with a linked Discord account and briefings enabled checks in for a flight
- **THEN** a briefing private message for that flight is delivered to that pilot

#### Scenario: Pilot without a linked account receives nothing

- **WHEN** a pilot with no linked Discord account checks in for a flight
- **THEN** no briefing message is delivered

#### Scenario: Pilot who disabled briefings receives nothing

- **WHEN** a pilot who has disabled briefing messages checks in for a flight
- **THEN** no briefing message is delivered

#### Scenario: Delivery failure does not fail the check-in

- **WHEN** the briefing cannot be delivered because Discord is unreachable or rejects the message
- **THEN** the check-in still succeeds and the flight is marked as checked in

### Requirement: Briefing states the flight, route and aircraft

The briefing SHALL identify the flight by its flight number and state the route as the departure and destination cities with their IATA codes, together with the registration and type of the aircraft operating it.

#### Scenario: Flight identity in the briefing

- **WHEN** a pilot checks in for flight LH55 from Frankfurt to Newark on aircraft D-AIMK
- **THEN** the briefing names flight LH 55, the route Frankfurt (FRA) to Newark (EWR), and the aircraft D-AIMK with its type

### Requirement: Briefing presents the estimated schedule

The briefing SHALL present the estimated schedule entered at check-in as out, off, on and in times in chronological order, each in UTC, followed by the estimated block time between the out and in times.

#### Scenario: Schedule block in the briefing

- **WHEN** a pilot checks in with an estimated off-block time of 09:00Z, take-off at 09:20Z, landing at 12:30Z and on-block at 12:40Z
- **THEN** the briefing lists out 09:00z, off 09:20z, on 12:30z and in 12:40z, and reports a block time of 3h 40m

### Requirement: Briefing carries departure airport weather

The briefing SHALL include the ATIS, METAR and TAF held for the departure airport, each reproduced verbatim as the provider published it. A report the system does not hold SHALL be omitted from the briefing rather than shown empty.

#### Scenario: All departure reports available

- **WHEN** the system holds an ATIS, a METAR and a TAF for the departure airport at check-in
- **THEN** the briefing reproduces all three reports and labels the ATIS with the departure airport's ICAO code

#### Scenario: No ATIS published for the departure airport

- **WHEN** the system holds a METAR and a TAF but no ATIS for the departure airport
- **THEN** the briefing reproduces the METAR and the TAF and contains no ATIS section

### Requirement: Briefing carries the operational flight plan

The briefing SHALL attach the operational flight plan document when the flight has one, and SHALL NOT mention the plan in the message body; a flight without an operational flight plan SHALL produce a briefing with no attachment.

#### Scenario: Flight imported from SimBrief

- **WHEN** a pilot checks in for a flight that has an operational flight plan
- **THEN** the briefing carries the plan document as an attachment and its body does not reference the plan

#### Scenario: Manually created flight

- **WHEN** a pilot checks in for a flight that has no operational flight plan
- **THEN** the briefing carries no attachment

### Requirement: Briefing links back to the flight

The briefing SHALL close with a link that opens the briefed flight in the Flight Tracker app.

#### Scenario: Link to the flight

- **WHEN** a briefing is delivered for a flight
- **THEN** it ends with a link to that flight in the Flight Tracker app

### Requirement: Pilot can read their Discord briefing setting

The system SHALL let a signed-in user read every Discord private-message setting held for them. A setting MAY govern more than one message. A user who has never changed a setting SHALL be reported as having it enabled.

#### Scenario: Reading the default setting

- **WHEN** a signed-in user who never changed a setting reads their Discord settings
- **THEN** the response reports every setting as enabled

#### Scenario: Unauthenticated read is rejected

- **WHEN** Discord settings are read without a valid token
- **THEN** the request is rejected as unauthorized

### Requirement: Pilot can change their Discord briefing setting

The system SHALL let a signed-in user enable or disable each Discord private-message setting independently, and SHALL answer the change with the user's resulting Discord settings. A change SHALL leave every setting the request did not name untouched, and SHALL NOT require a linked Discord account.

#### Scenario: Disabling briefings

- **WHEN** a signed-in user disables briefing messages
- **THEN** the response reports briefings as disabled and later reads report the same

#### Scenario: Re-enabling briefings

- **WHEN** a signed-in user who had disabled briefing messages enables them again
- **THEN** the response reports briefings as enabled

#### Scenario: Changing one setting leaves the others alone

- **WHEN** a signed-in user who had disabled briefing messages disables delay messages without naming the briefing setting
- **THEN** the response reports both as disabled and every other setting unchanged

#### Scenario: Invalid setting value is rejected

- **WHEN** a signed-in user submits a setting that is not a boolean
- **THEN** the request is rejected as a validation failure

#### Scenario: Unauthenticated change is rejected

- **WHEN** Discord settings are changed without a valid token
- **THEN** the request is rejected as unauthorized
