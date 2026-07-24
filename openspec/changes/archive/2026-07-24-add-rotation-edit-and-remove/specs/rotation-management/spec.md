## ADDED Requirements

### Requirement: Edit a draft rotation

The system SHALL allow an Operations user to edit a rotation's name and assigned
pilot while the rotation is a draft, returning the updated rotation and recording
the actor and time in its audit metadata. Editing SHALL be rejected once the
rotation has been marked ready (or is in-progress or finished).

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

The system SHALL allow an Operations user to remove a rotation while it is a draft,
deleting the rotation together with its legs. Removal SHALL be rejected once the
rotation has been marked ready (or is in-progress or finished).

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
