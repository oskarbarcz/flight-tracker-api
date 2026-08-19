# operator-recent-carriers Specification

## Purpose

Ranks the carriers a user has recently worked with — whether they flew the flight or scheduled it — and exposes the leading few through the operator list endpoint, so clients can offer a shortcut to the airlines a person actually deals with.

## Requirements

### Requirement: A flight records who created it

The system SHALL record the user who created a flight, on the flight itself, for every flight created through the API — both flights entered by hand and flights imported from a SimBrief operational flight plan. The recorded creator SHALL be the authenticated user who made the request.

Flights that existed before this capability SHALL take their creator from the flight creation entry already present in their event history. A flight whose event history names no creator SHALL be left without one rather than guessing.

#### Scenario: Flight created by hand

- **WHEN** a user creates a flight
- **THEN** that user is recorded as the flight's creator

#### Scenario: Flight imported from a flight plan

- **WHEN** a user creates a flight by importing a SimBrief operational flight plan
- **THEN** that user is recorded as the flight's creator

#### Scenario: Pre-existing flight with a recorded creation

- **WHEN** a flight that predates this capability has a creation entry in its event history naming an actor
- **THEN** that actor becomes the flight's creator

#### Scenario: Pre-existing flight with no recorded creation

- **WHEN** a flight that predates this capability has no creation entry naming an actor
- **THEN** the flight is left with no creator, and it contributes nothing to anyone's recent carriers by creation

### Requirement: Carrier recency spans both flying and scheduling

The system SHALL treat a user as involved with a flight when they are recorded as its captain or as its creator, and SHALL rank an operator's recency for that user by the latest creation time among the flights they are involved with for that operator. An operator reached through several flights SHALL be ranked once, by the most recent of them.

Because operations staff schedule flights rather than fly them, and crew fly flights they did not schedule, both routes SHALL count towards one list, and the system SHALL NOT vary the rule by the caller's role.

The ranking SHALL NOT require a flight to have completed, taken off, or departed. A flight counts from the moment it is created.

#### Scenario: Carrier reached by flying

- **WHEN** recency is derived for a user who is captain of a flight for operator `DLH`
- **THEN** `DLH` is ranked for that user

#### Scenario: Carrier reached by scheduling

- **WHEN** recency is derived for a user who created a flight for operator `KLM` but is not its captain
- **THEN** `KLM` is ranked for that user

#### Scenario: Carrier reached both ways

- **WHEN** recency is derived for a user who created one flight for operator `AFR` and captained another
- **THEN** `AFR` is ranked once, by whichever of those flights was created most recently

#### Scenario: Flight that has not yet flown

- **WHEN** a user schedules a flight for operator `ICE` that has not departed
- **THEN** `ICE` is ranked for that user immediately, without waiting for the flight to complete

#### Scenario: Someone else's flight

- **WHEN** recency is derived for a user, and operator `BAW` is reached only by flights another person both created and captained
- **THEN** `BAW` is not ranked for the requesting user

#### Scenario: Role does not change the rule

- **WHEN** two users with different roles are each involved with the same set of flights
- **THEN** each receives the same recent carriers, in the same order

### Requirement: The recent carrier list is ordered newest first and capped at four

The system SHALL order ranked operators by their recency descending, so the most recently involved carrier appears first, and SHALL return at most four operators. When two operators share an identical recency, the system SHALL break the tie by ICAO code ascending, so the order is deterministic across identical requests.

When the user is involved with fewer than four distinct operators, the system SHALL return only those, without padding the result from any other source. When the user is involved with no flight at all, the system SHALL return an empty list.

#### Scenario: More than four carriers

- **WHEN** a user involved with five distinct operators requests their recent carriers
- **THEN** exactly four operators are returned
- **AND** they are the four most recent, ordered newest first
- **AND** the fifth is absent

#### Scenario: Fewer than four carriers

- **WHEN** a user involved with two distinct operators requests their recent carriers
- **THEN** exactly those two operators are returned, ordered newest first

#### Scenario: No involvement at all

- **WHEN** a user who has neither flown nor scheduled a flight requests their recent carriers
- **THEN** the response status is `200` and the body is an empty list

#### Scenario: Two carriers with the same recency

- **WHEN** a user's most recent flights for operator `AFR` and for operator `ICE` were created at the identical moment
- **THEN** `AFR` precedes `ICE`, ordered by ICAO code ascending

### Requirement: The operator list endpoint accepts a recentOnly filter

The system SHALL accept an optional `recentOnly` query parameter on `GET /api/v1/operator`, spelled as a single camelCase identifier so that the wire name and the property that receives it are the same name. When it is set to `true`, the endpoint SHALL respond with the caller's recent carrier list and nothing else — the response SHALL NOT include operators the caller has no involvement with, and SHALL NOT append the remaining operators after them. When the parameter is absent or set to `false`, the endpoint SHALL respond with the full operator list in its existing order.

The parameter SHALL accept only the literal values `true` and `false`. Any other value, including an empty one, SHALL be rejected with status `400` and a validation violation naming the parameter. A cached response SHALL NOT be served in place of that rejection.

The hyphenated spelling `recent-only` SHALL NOT be accepted. It is an unknown query parameter and SHALL be rejected with status `400` and a violation stating that the property should not exist, rather than being ignored in favour of an unfiltered response.

#### Scenario: Filter requests the recent carriers

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=true`
- **THEN** the response status is `200`
- **AND** the body contains at most four operators, being the caller's recent carriers, newest first

#### Scenario: Filter explicitly disabled

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=false`
- **THEN** the response status is `200`
- **AND** the body is the full operator list, identical to the response with no query parameter

#### Scenario: Filter omitted

- **WHEN** an authenticated user sends `GET /api/v1/operator`
- **THEN** the response status is `200`
- **AND** the body is the full operator list, unchanged from before this capability existed

#### Scenario: Filter carries an unsupported value

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=maybe`
- **THEN** the response status is `400` with a violation naming `recentOnly`

#### Scenario: Filter carries no value

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly`
- **THEN** the response status is `400` with a violation naming `recentOnly`

#### Scenario: Unsupported value after the list has been cached

- **WHEN** an authenticated user reads the full operator list, and then sends `GET /api/v1/operator?recentOnly=maybe`
- **THEN** the response status is `400`, and the cached list is not returned

#### Scenario: The hyphenated spelling is rejected

- **WHEN** an authenticated user sends `GET /api/v1/operator?recent-only=true`
- **THEN** the response status is `400` with a violation naming `recent-only` and stating the property should not exist
- **AND** no operator list is returned

### Requirement: Recent carriers are returned as complete operator bodies

The system SHALL return each recent carrier as a full operator body, carrying the identical fields and field names as the entries of the unfiltered operator list, so a client can render either list from one representation. The system SHALL NOT add a recency timestamp or any other filter-specific field to the returned operators.

#### Scenario: Body shape matches the unfiltered list

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=true` and receives an operator
- **THEN** that operator carries exactly the fields it carries in the response to `GET /api/v1/operator`, with the same values

### Requirement: The filter is available to every authenticated role

The system SHALL require authentication for `GET /api/v1/operator?recentOnly=true` and SHALL grant it to every authenticated role, matching the access rules of the unfiltered operator list. The result is always the calling user's own recent carriers; no role SHALL be able to read another user's recent carriers through this endpoint.

#### Scenario: Operations reads their recent carriers

- **WHEN** a user with the `operations` role sends `GET /api/v1/operator?recentOnly=true`
- **THEN** the response status is `200` with the carriers they most recently scheduled or flew

#### Scenario: Cabin crew reads their recent carriers

- **WHEN** a user with the `cabin crew` role sends `GET /api/v1/operator?recentOnly=true`
- **THEN** the response status is `200` with the carriers they most recently flew or scheduled

#### Scenario: Admin reads their recent carriers

- **WHEN** a user with the `admin` role sends `GET /api/v1/operator?recentOnly=true`
- **THEN** the response status is `200` with that admin's own recent carriers

#### Scenario: Unauthenticated caller is rejected

- **WHEN** an unauthenticated caller sends `GET /api/v1/operator?recentOnly=true`
- **THEN** the response status is `401`

### Requirement: Recent carrier responses are cached per user

The system SHALL cache the recent carrier response separately for each user, and SHALL NOT serve one user's recent carriers to another. The unfiltered operator list SHALL keep its existing shared cache entry, unaffected by this filter — the two variants SHALL NOT share a cache entry, so requesting one never returns the other's cached body.

#### Scenario: Two users read their recent carriers

- **WHEN** two users with different flight involvement each send `GET /api/v1/operator?recentOnly=true`
- **THEN** each receives their own recent carriers

#### Scenario: Filtered request does not poison the unfiltered cache

- **WHEN** a user sends `GET /api/v1/operator?recentOnly=true` and then `GET /api/v1/operator`
- **THEN** the second response is the full operator list, not the recent carriers

#### Scenario: Unfiltered request does not poison the filtered cache

- **WHEN** a user sends `GET /api/v1/operator` and then `GET /api/v1/operator?recentOnly=true`
- **THEN** the second response is the caller's recent carriers, not the full operator list

### Requirement: Becoming involved with a flight refreshes the user's recent carriers

The system SHALL discard a user's cached recent carriers when they become involved with a flight — when they create one, and when they check in as its captain — so their next request reflects that involvement. A cached entry SHALL also expire on its own within a bounded window, so that edits to operator details reach the recent list without an explicit invalidation for every user.

#### Scenario: Newly scheduled carrier becomes the leading entry

- **WHEN** a user whose recent carriers were previously read creates a flight for an operator that was not previously leading
- **AND** requests their recent carriers again
- **THEN** that operator is returned first

#### Scenario: Checking in as captain adds the carrier

- **WHEN** a user whose recent carriers were previously read checks in as captain of a flight for an operator they had no involvement with
- **AND** requests their recent carriers again
- **THEN** that operator is present

#### Scenario: Another user's involvement is irrelevant

- **WHEN** a user's recent carriers are cached and a different user creates a flight
- **THEN** the first user's recent carriers are unchanged
