## ADDED Requirements

### Requirement: List the caller's assigned rotations

The system SHALL expose an authenticated endpoint that returns the rotations
assigned to the calling user — those whose assigned pilot is the caller — and
SHALL restrict that list to rotations whose state is at least `ready`
(`ready`, `in_progress`, or `finished`), never returning `draft` rotations. The
caller is resolved from the authenticated identity, so the endpoint requires
authentication and returns only the caller's own rotations; an unauthenticated
request is rejected with `401`. The list SHALL accept an optional `status`
parameter that narrows the result to a single state; when the requested state is
one the endpoint does not expose (`draft`), the result is empty; an unrecognised
state is rejected as a bad request.

#### Scenario: A pilot lists their actionable rotations

- **WHEN** an authenticated user lists their assigned rotations
- **THEN** every rotation whose assigned pilot is that user and whose state is `ready`, `in_progress`, or `finished` is returned

#### Scenario: Draft rotations are excluded

- **WHEN** an authenticated user has a rotation assigned to them that is still in the `draft` state
- **THEN** that rotation is not returned in their assigned-rotations list

#### Scenario: Other pilots' rotations are excluded

- **WHEN** an authenticated user lists their assigned rotations while ready rotations assigned to a different pilot exist
- **THEN** only rotations assigned to the calling user are returned

#### Scenario: The unauthenticated caller is rejected

- **WHEN** an unauthenticated client requests the assigned-rotations endpoint
- **THEN** the request is rejected with `401`

#### Scenario: Filtering by a state returns only rotations in that state

- **WHEN** an authenticated user lists their assigned rotations with a status of `in_progress`
- **THEN** only their `in_progress` rotations are returned

#### Scenario: Filtering by a non-exposed state returns an empty list

- **WHEN** an authenticated user lists their assigned rotations with a status of `draft`
- **THEN** an empty list is returned

#### Scenario: Filtering by an unrecognised state is rejected

- **WHEN** an authenticated user lists their assigned rotations with a status that is not a valid rotation state
- **THEN** the request is rejected as a bad request
