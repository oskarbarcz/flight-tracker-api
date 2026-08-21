## Purpose

Gives the companion desktop application one narrow read that returns exactly what it
displays and publishes, so that its session needs no access to the user's full profile
or to flights other than the one they are operating.

## ADDED Requirements

### Requirement: One read returns the companion application's whole working set

The system SHALL return, to an authenticated user, a single response carrying the
pilot's display name, the flight they are currently operating, and the Discord rich
presence payload they currently want published. The companion application SHALL need no
other authenticated read to fill its dashboard and drive its outputs.

#### Scenario: A pilot on a flight reads their context

- **WHEN** an authenticated user with a current flight requests their transponder context
- **THEN** the response carries the pilot's name, the current flight's callsign, departure, arrival, aircraft registration and aircraft type, and the Discord presence payload

#### Scenario: Reading the context requires a session

- **WHEN** the transponder context is requested with no access token
- **THEN** the request is rejected as unauthorized

### Requirement: The read accepts no flight identifier

The system SHALL determine the flight from the authenticated user alone and SHALL NOT
accept a flight identifier of any kind. A caller holding this read SHALL therefore be
unable to reach any flight other than the one the user is currently operating, without
the system performing an ownership check that could be got wrong.

#### Scenario: The current flight is resolved from the caller

- **WHEN** an authenticated user requests their transponder context
- **THEN** the flight returned is the one recorded as their current flight, and no request parameter can alter which flight that is

### Requirement: Absent flight and disabled presence are reported as absent

The system SHALL omit the flight when the user is not operating one, and SHALL omit the
presence payload when rich presence is switched off or there is nothing to publish,
rather than failing the request. The companion application is expected to run
continuously, including when its owner is not flying.

#### Scenario: A pilot with no current flight still gets a response

- **WHEN** an authenticated user with no current flight requests their transponder context
- **THEN** the response succeeds carrying the pilot's name, with the flight absent

#### Scenario: Rich presence switched off omits the presence payload

- **WHEN** an authenticated user who has disabled Discord rich presence requests their transponder context
- **THEN** the response succeeds with the presence payload absent

### Requirement: The response carries no account or identity detail beyond the pilot's name

The system SHALL exclude from this response every attribute the companion application
does not display or publish — in particular the user's email addresses, linked Google
and Discord identifiers, SimBrief identifier, licence number, home airport and
notification preferences — so that the narrow scope granted to a device corresponds to
narrow data and not merely to a narrow route.

#### Scenario: The context response omits profile detail

- **WHEN** an authenticated user requests their transponder context
- **THEN** the response contains no email address, no linked account identifier, no SimBrief identifier, no licence number, no home airport and no notification preference

### Requirement: The read is reachable by a companion application session

The system SHALL declare this read as reachable by a session scoped to the companion
application, and SHALL keep it reachable by an ordinary unscoped session so it can be
exercised and debugged from the web application.

#### Scenario: A device session reads its context

- **WHEN** a session obtained through a device authorization requests the transponder context
- **THEN** the request succeeds

#### Scenario: An ordinary session reads the same context

- **WHEN** a session opened by an ordinary sign-in requests the transponder context
- **THEN** the request succeeds and returns that user's context
