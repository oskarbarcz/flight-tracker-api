# rotation-management

## Purpose

Plan a pilot's connected chain of sectors up front, before the individual
flights exist. A rotation owns an ordered set of legs, is scoped to one operator
and assigned to a single pilot, and progresses through a
`draft → ready → in_progress → finished` lifecycle. A leg is the plan (route and
intended times, with block time computed on read) that a real `created` flight is
later attached to; the flight remains ignorant of rotations, and the rotation
advances by reacting to existing flight lifecycle events. Rotation reads are
public; every write is gated to the Operations role.

## Requirements

### Requirement: Create a rotation

The system SHALL allow an Operations user to create a rotation with a user-readable name, scoped to one operator and assigned to a single pilot, and the rotation SHALL start in the `draft` state with no legs.

#### Scenario: Operations creates a rotation

- **WHEN** an Operations user creates a rotation for an operator with a pilot
- **THEN** the rotation is persisted in the `draft` state with the given operator and pilot and an empty set of legs

#### Scenario: Non-operations actor is rejected

- **WHEN** a non-Operations authenticated user attempts to create a rotation
- **THEN** the request is rejected with a forbidden error

### Requirement: Build legs while draft

The system SHALL allow Operations to add, update, and remove legs while the rotation is in the `draft` state, where each leg defines a mandatory planned flight number, a departure airport, an arrival airport, a planned off-block time, and a planned on-block time.

#### Scenario: Add a leg to a draft rotation

- **WHEN** Operations adds a leg with departure, arrival, off-block time, and on-block time to a `draft` rotation
- **THEN** the leg is persisted against the rotation

#### Scenario: Remove a leg from a draft rotation

- **WHEN** Operations removes an existing leg from a `draft` rotation
- **THEN** the leg no longer belongs to the rotation

### Requirement: Order legs by off-block time

The system SHALL order a rotation's legs by their planned off-block time and SHALL NOT expose or require any separate ordering field.

#### Scenario: Legs are returned in off-block order

- **WHEN** a rotation with multiple legs is read
- **THEN** its legs are returned ordered ascending by planned off-block time

### Requirement: Enforce per-leg validity

The system SHALL reject any leg whose departure airport equals its arrival airport, or whose planned off-block time is not strictly before its planned on-block time.

#### Scenario: Reject a zero-distance leg

- **WHEN** Operations submits a leg whose departure airport equals its arrival airport
- **THEN** the request is rejected with a validation error

#### Scenario: Reject a leg with non-positive block time

- **WHEN** Operations submits a leg whose off-block time is equal to or later than its on-block time
- **THEN** the request is rejected with a validation error

### Requirement: Enforce rotation continuity at ready

The system SHALL, when a rotation is marked `ready` and on every subsequent leg edit, ensure that — with legs ordered by off-block time — each leg's departure airport equals the previous leg's arrival airport and each leg's off-block time is not earlier than the previous leg's on-block time.

#### Scenario: Reject a broken airport chain

- **WHEN** Operations marks a rotation `ready` whose ordered legs have a leg whose departure airport differs from the previous leg's arrival airport
- **THEN** the request is rejected with a validation error and the rotation remains `draft`

#### Scenario: Reject overlapping legs

- **WHEN** Operations marks a rotation `ready` whose ordered legs have a leg whose off-block time is earlier than the previous leg's on-block time
- **THEN** the request is rejected with a validation error and the rotation remains `draft`

### Requirement: Mark a rotation ready

The system SHALL allow Operations to transition a rotation from `draft` to `ready` only when it has at least two legs and all continuity invariants hold, and once `ready` the set of legs SHALL be frozen (no legs may be added or removed).

#### Scenario: Mark a valid rotation ready

- **WHEN** Operations marks a `draft` rotation with at least two valid, continuous legs as `ready`
- **THEN** the rotation transitions to `ready`

#### Scenario: Reject ready with fewer than two legs

- **WHEN** Operations attempts to mark a `draft` rotation with fewer than two legs as `ready`
- **THEN** the request is rejected with a validation error and the rotation remains `draft`

#### Scenario: Reject adding a leg after ready

- **WHEN** Operations attempts to add or remove a leg on a `ready` or `in_progress` rotation
- **THEN** the request is rejected with a conflict error

### Requirement: Edit leg times after ready

The system SHALL allow Operations to edit the planned off-block and on-block times of a leg that has no checked-in flight while the rotation is `ready` or `in_progress`, SHALL keep each leg's departure and arrival airports frozen once the rotation is `ready`, and SHALL reject edits to a leg whose flight has already checked in.

#### Scenario: Retime a not-yet-flown leg

- **WHEN** Operations edits the planned times of a leg that has no checked-in flight on a `ready` rotation, preserving continuity
- **THEN** the leg's planned times are updated

#### Scenario: Reject retiming an in-progress leg

- **WHEN** Operations attempts to edit a leg whose attached flight has already checked in
- **THEN** the request is rejected with a conflict error

#### Scenario: Reject changing airports after ready

- **WHEN** Operations attempts to change a leg's departure or arrival airport on a `ready` or `in_progress` rotation
- **THEN** the request is rejected with a conflict error

### Requirement: Attach a flight to a leg

The system SHALL allow Operations to attach a flight to a leg only when the flight is in the `created` state, the flight's departure and arrival airports match the leg's planned departure and arrival, the flight's number matches the leg's planned flight number, the flight's operator matches the rotation's operator, and the flight is not already attached to any other leg.

#### Scenario: Reject a flight whose number does not match

- **WHEN** Operations attempts to attach a flight whose flight number differs from the leg's planned flight number
- **THEN** the request is rejected with a validation error

#### Scenario: Attach a matching created flight

- **WHEN** Operations attaches a `created` flight whose airports and operator match the leg to a leg with no flight
- **THEN** the leg references the flight

#### Scenario: Reject a flight that is not created

- **WHEN** Operations attempts to attach a flight that is not in the `created` state
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

The system SHALL allow Operations to detach a flight from a leg while that flight is still in the `created` state, reverting the leg to plan-only, and SHALL reject detaching once the flight has checked in.

#### Scenario: Detach a created flight

- **WHEN** Operations detaches a flight that is still in the `created` state from its leg
- **THEN** the leg no longer references a flight

#### Scenario: Reject detaching a checked-in flight

- **WHEN** Operations attempts to detach a flight that has already checked in
- **THEN** the request is rejected with a conflict error

### Requirement: Advance to in-progress on first check-in

The system SHALL transition a `ready` rotation to `in_progress` when the first pilot check-in occurs on any flight attached to one of its legs, driven by the flight lifecycle event and without the flight referencing the rotation.

#### Scenario: First check-in advances the rotation

- **WHEN** the pilot checks in on a flight attached to a leg of a `ready` rotation
- **THEN** the rotation transitions to `in_progress`

### Requirement: Complete on last flight close

The system SHALL transition an `in_progress` rotation to `finished` when the flight attached to its last leg — the leg with the latest planned off-block time — reaches the `closed` state.

#### Scenario: Closing the last leg's flight finishes the rotation

- **WHEN** the flight attached to the leg with the latest planned off-block time reaches `closed`
- **THEN** the rotation transitions to `finished`

#### Scenario: Closing an earlier leg's flight does not finish the rotation

- **WHEN** the flight attached to a leg that is not the latest-off-block leg reaches `closed`
- **THEN** the rotation remains `in_progress`

### Requirement: Expose computed block time

The system SHALL expose each leg's block time as the difference between its planned on-block and off-block times, computed on read and never persisted.

#### Scenario: Block time is derived on read

- **WHEN** a rotation leg is read
- **THEN** the leg's block time equals its planned on-block time minus its planned off-block time

### Requirement: Track rotation audit metadata

The system SHALL record the user who created a rotation and the user who last modified it, persisting them as user references, and SHALL expose each in the API as a `{ id, name }` object — `createdBy` always present, `updatedBy` null until the rotation is first modified.

#### Scenario: Creation records the creator

- **WHEN** an Operations user creates a rotation
- **THEN** the rotation's `createdBy` is that user's `{ id, name }` and its `updatedBy` is null

#### Scenario: Modification records the editor

- **WHEN** an Operations user modifies a rotation (leg change, transition, or flight attachment)
- **THEN** the rotation's `updatedBy` becomes that user's `{ id, name }`

### Requirement: Public read, gated write

The system SHALL allow rotation data to be read without authentication and SHALL require the Operations role for every rotation write operation.

#### Scenario: Unauthenticated read succeeds

- **WHEN** an unauthenticated client requests a rotation
- **THEN** the rotation data is returned

#### Scenario: Unauthenticated write is rejected

- **WHEN** an unauthenticated client attempts any rotation write operation
- **THEN** the request is rejected with an unauthorized error

### Requirement: Edit a draft rotation

The system SHALL allow an Operations user to edit a rotation's name and assigned pilot while the rotation is a draft, returning the updated rotation and recording the actor and time in its audit metadata. Editing SHALL be rejected once the rotation has been marked ready (or is in-progress or finished).

#### Scenario: Operations edits a draft rotation

- **WHEN** an Operations user submits a new name and pilot for a draft rotation
- **THEN** the rotation's name and pilot are updated
- **AND** its `updatedBy` and `updatedAt` reflect the change
- **AND** the updated rotation is returned

#### Scenario: Editing a non-draft rotation is rejected

- **WHEN** an Operations user tries to edit a rotation that is ready, in-progress, or finished
- **THEN** the request is rejected with a conflict and the rotation is unchanged

#### Scenario: Editing a missing rotation is not found

- **WHEN** an Operations user tries to edit a rotation that does not exist
- **THEN** the request is rejected as not found

#### Scenario: Non-operations actors cannot edit

- **WHEN** an admin, a cabin-crew member, or an unauthenticated caller tries to edit a rotation
- **THEN** the request is rejected (forbidden for authenticated non-operations roles, unauthorized when no token is provided)

### Requirement: Remove a draft rotation

The system SHALL allow an Operations user to remove a rotation while it is a draft, deleting the rotation together with its legs. Removal SHALL be rejected once the rotation has been marked ready (or is in-progress or finished).

#### Scenario: Operations removes a draft rotation

- **WHEN** an Operations user removes a draft rotation
- **THEN** the rotation and its legs are deleted
- **AND** a subsequent read of the rotation is not found

#### Scenario: Removing a non-draft rotation is rejected

- **WHEN** an Operations user tries to remove a rotation that is ready, in-progress, or finished
- **THEN** the request is rejected with a conflict and the rotation is retained

#### Scenario: Removing a missing rotation is not found

- **WHEN** an Operations user tries to remove a rotation that does not exist
- **THEN** the request is rejected as not found

#### Scenario: Non-operations actors cannot remove

- **WHEN** an admin, a cabin-crew member, or an unauthenticated caller tries to remove a rotation
- **THEN** the request is rejected (forbidden for authenticated non-operations roles, unauthorized when no token is provided)
