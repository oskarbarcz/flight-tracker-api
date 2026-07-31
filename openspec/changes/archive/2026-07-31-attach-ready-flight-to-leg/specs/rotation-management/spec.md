## MODIFIED Requirements

### Requirement: Attach a flight to a leg

The system SHALL allow Operations to attach a flight to a leg only when the flight has not yet checked in — that is, while the flight is in the `created` or `ready` state — the flight's departure and arrival airports match the leg's planned departure and arrival, the flight's number matches the leg's planned flight number, the flight's operator matches the rotation's operator, and the flight is not already attached to any other leg. Attaching a flight SHALL NOT change the flight's own state and SHALL NOT advance the rotation: a rotation with an attached `ready` flight stays `ready` until the pilot checks in.

#### Scenario: Reject a flight whose number does not match

- **WHEN** Operations attempts to attach a flight whose flight number differs from the leg's planned flight number
- **THEN** the request is rejected with a validation error

#### Scenario: Attach a matching created flight

- **WHEN** Operations attaches a `created` flight whose airports and operator match the leg to a leg with no flight
- **THEN** the leg references the flight

#### Scenario: Attach a matching ready flight

- **WHEN** Operations attaches a `ready` flight whose airports, flight number, and operator match the leg to a leg with no flight
- **THEN** the leg references the flight
- **AND** the flight remains `ready` and the rotation remains in its current state

#### Scenario: Reject a flight that has already checked in

- **WHEN** Operations attempts to attach a flight that has progressed beyond `ready` — checked in or later, up to and including `closed`
- **THEN** the request is rejected with a validation error

#### Scenario: Reject a flight whose airports do not match

- **WHEN** Operations attempts to attach a flight whose departure or arrival airport differs from the leg's plan
- **THEN** the request is rejected with a validation error

#### Scenario: Reject a flight from another operator

- **WHEN** Operations attempts to attach a flight whose operator differs from the rotation's operator
- **THEN** the request is rejected with a validation error

#### Scenario: Reject a flight already used by another leg

- **WHEN** Operations attempts to attach a flight that is already attached to another leg
- **THEN** the request is rejected with a conflict error

### Requirement: Detach a flight from a leg

The system SHALL allow Operations to detach a flight from a leg while that flight has not yet checked in — that is, while the flight is in the `created` or `ready` state — reverting the leg to plan-only, and SHALL reject detaching once the flight has checked in. Detaching SHALL leave the flight itself untouched, so a detached flight remains eligible for attachment to another matching leg.

#### Scenario: Detach a created flight

- **WHEN** Operations detaches a flight that is still in the `created` state from its leg
- **THEN** the leg no longer references a flight

#### Scenario: Detach a ready flight

- **WHEN** Operations detaches a flight that is in the `ready` state from its leg
- **THEN** the leg no longer references a flight
- **AND** the flight remains `ready`

#### Scenario: Reject detaching a checked-in flight

- **WHEN** Operations attempts to detach a flight that has already checked in
- **THEN** the request is rejected with a conflict error
