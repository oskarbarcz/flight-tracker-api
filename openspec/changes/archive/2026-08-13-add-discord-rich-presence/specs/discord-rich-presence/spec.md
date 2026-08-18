## Purpose

Renders the flight a pilot is on as the Discord activity they want published on their
profile, for the companion application running on the machine they fly on. Discord accepts
an activity only from a process on the user's own computer, so the system decides what to
publish and the companion publishes it.

## ADDED Requirements

### Requirement: A pilot decides whether their flight is published as their Discord activity

The system SHALL hold a per-user rich presence setting alongside the Discord message settings, readable and writable through the same settings pair, and SHALL default it to disabled. Publishing a pilot's activity is visible to everyone who can see their Discord profile, so it SHALL NOT be enabled without the pilot asking for it.

#### Scenario: The setting starts off

- **WHEN** a user who has never changed it reads their Discord settings
- **THEN** rich presence is reported as disabled

#### Scenario: Turning it on

- **WHEN** a signed-in user enables rich presence
- **THEN** the response reports it as enabled and later reads report the same

#### Scenario: Turning it back off

- **WHEN** a signed-in user who had enabled rich presence disables it again
- **THEN** the response reports it as disabled

#### Scenario: Changing it leaves the message settings alone

- **WHEN** a signed-in user changes only the rich presence setting
- **THEN** every Discord message setting keeps the value it had

### Requirement: A pilot reads the activity to publish for themselves

The system SHALL expose an authenticated read that answers the signed-in user's current Discord activity. It SHALL answer only for the requesting user, identified from the access token, and SHALL reject an unauthenticated request. A linked Discord account SHALL NOT be required, because the activity is published by the pilot's own Discord client rather than by the system.

#### Scenario: Reading the activity of the flight in progress

- **WHEN** a signed-in user with rich presence enabled and a flight in progress reads their Discord presence
- **THEN** the response carries the activity for that flight

#### Scenario: Unauthenticated read is rejected

- **WHEN** the Discord presence is read without a valid token
- **THEN** the request is rejected as unauthorized

### Requirement: Nothing is published when there is nothing to say

The system SHALL answer no content, rather than an error or an empty activity, whenever there is no activity to publish: the pilot has rich presence disabled, the pilot is not on a flight, or the flight lacks a departure or a destination airport. The single answer SHALL cover all three, so that the companion has one unambiguous instruction to clear whatever it published before.

#### Scenario: Rich presence is off

- **WHEN** a signed-in user with rich presence disabled reads their Discord presence
- **THEN** the response carries no content

#### Scenario: The pilot is not on a flight

- **WHEN** a signed-in user with rich presence enabled and no flight in progress reads their Discord presence
- **THEN** the response carries no content

#### Scenario: Turning the setting off clears the activity

- **WHEN** a user who was publishing an activity disables rich presence and reads their Discord presence again
- **THEN** the response carries no content

#### Scenario: The flight has no route

- **WHEN** the flight a pilot is on has no departure or no destination airport
- **THEN** the response carries no content

### Requirement: The activity states the route and the flight's state

The published activity SHALL carry two display lines rendered by the system, so that the companion applies no formatting of its own. The route line SHALL name the departure and destination cities with their IATA codes. The state line SHALL name the flight's phase, followed by the next time the flight is due: the take-off time while the flight is awaiting take-off — from planned through taxiing out — and the landing time while it is in cruise. From taxi-in onwards, and whenever the relevant time is not known, the state line SHALL carry the phase alone.

#### Scenario: Route line

- **WHEN** an activity is published for a flight from Barcelona to New York
- **THEN** its route line reads `Barcelona (BCN) -> New York (JFK)`

#### Scenario: Awaiting take-off

- **WHEN** an activity is published for a checked-in flight whose take-off is due at 13:15 UTC
- **THEN** its state line reads `Checked in, takeoff at 13:15 UTC`

#### Scenario: In cruise

- **WHEN** an activity is published for a flight in cruise whose landing is due at 13:30 UTC
- **THEN** its state line reads `Cruise, landing at 13:30 UTC`

#### Scenario: After landing

- **WHEN** an activity is published for a flight that has finished offboarding
- **THEN** its state line names that phase alone, with no time

#### Scenario: The due time is not known yet

- **WHEN** an activity is published for a flight awaiting take-off for which no take-off time is held
- **THEN** its state line names the phase alone

#### Scenario: Airports other than the route ends are ignored

- **WHEN** the flight carries alternate or ETOPS airports alongside its departure and destination
- **THEN** the route line names only the departure and the destination

### Requirement: The activity carries the window Discord counts against

The published activity SHALL carry the flight's off-block time as the moment to count up from and its landing time as the moment to count down to, taken from the crew's estimated timesheet when one exists and from the published schedule otherwise. Either SHALL be reported as absent when no such time is held, so that a flight with no times still publishes its route and state.

#### Scenario: Crew estimates are published

- **WHEN** an activity is published for a flight whose crew entered estimated times at check-in
- **THEN** the counting window is the estimated off-block and landing times

#### Scenario: The published schedule is used until the crew estimates

- **WHEN** an activity is published for a flight whose crew has entered no estimate
- **THEN** the counting window is the scheduled off-block and landing times

### Requirement: The activity names the images to show

The published activity SHALL carry the asset keys of the images Discord shows with it, so that the companion does not hold its own copy of them.

#### Scenario: Asset keys are published

- **WHEN** an activity is published
- **THEN** it names both the small and the large image asset key
