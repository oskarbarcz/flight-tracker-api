## ADDED Requirements

### Requirement: Cancel a ready rotation

The system SHALL allow an Operations user to cancel a rotation that is in the
`ready` state, transitioning it to the terminal `canceled` state and returning
the updated rotation. The system SHALL reject cancellation of a rotation in any
other state (`draft`, `in_progress`, `finished`, or already `canceled`) with a
conflict error, and SHALL require the Operations role for the action. A
`canceled` rotation SHALL NOT advance through the automatic lifecycle: a later
pilot check-in or flight close on one of its legs leaves it `canceled`.

#### Scenario: Operations cancels a ready rotation

- **WHEN** Operations cancels a rotation that is in the `ready` state
- **THEN** the rotation transitions to `canceled` and the updated rotation is returned

#### Scenario: Cancelling a draft rotation is rejected

- **WHEN** Operations attempts to cancel a rotation that is still a `draft`
- **THEN** the request is rejected with a conflict error and the rotation remains `draft`

#### Scenario: Cancelling an in-progress rotation is rejected

- **WHEN** Operations attempts to cancel a rotation that is `in_progress`
- **THEN** the request is rejected with a conflict error and the rotation remains `in_progress`

#### Scenario: Cancelling a finished rotation is rejected

- **WHEN** Operations attempts to cancel a rotation that is `finished`
- **THEN** the request is rejected with a conflict error and the rotation remains `finished`

#### Scenario: Cancelling an already-cancelled rotation is rejected

- **WHEN** Operations attempts to cancel a rotation that is already `canceled`
- **THEN** the request is rejected with a conflict error and the rotation remains `canceled`

#### Scenario: A canceled rotation does not advance on check-in

- **WHEN** a pilot checks in on a flight attached to a leg of a `canceled` rotation
- **THEN** the rotation remains `canceled`

#### Scenario: A non-operations actor is rejected

- **WHEN** a non-Operations actor attempts to cancel a rotation
- **THEN** the request is rejected with a forbidden error and the rotation is unchanged
