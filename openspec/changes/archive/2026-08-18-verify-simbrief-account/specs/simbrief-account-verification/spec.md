## Purpose

Resolves a SimBrief user ID to the account behind it, so that a pilot can confirm the ID is
theirs before saving it and so that an ID SimBrief does not know is refused at the moment it
is stored rather than at the moment a flight import needs it. SimBrief exposes no account
endpoint, so the account is confirmed by asking for the most recent flight plan generated
on it.

## ADDED Requirements

### Requirement: A SimBrief user ID can be resolved to its account

The system SHALL expose an authenticated read that resolves a SimBrief user ID and answers with the ID together with the most recent flight plan generated on that account. The plan SHALL report its callsign, its origin and destination airports, the aircraft it was filed for, its scheduled off-block and on-block times, and when it was generated, so that a pilot can recognise the account as their own. The read SHALL reject an unauthenticated request.

#### Scenario: A known user ID resolves

- **WHEN** an authenticated user resolves a SimBrief user ID that SimBrief knows
- **THEN** the response reports that ID and the callsign, origin, destination, aircraft, scheduled times and generation time of the account's most recent flight plan

#### Scenario: Every role may resolve an ID

- **WHEN** an admin, an operations user, or a cabin crew member resolves a SimBrief user ID
- **THEN** the request succeeds, because the ID is supplied by the caller and no other user's data is read

#### Scenario: Unauthenticated request is rejected

- **WHEN** a SimBrief user ID is resolved without a valid token
- **THEN** the request is rejected as unauthorized

### Requirement: An unknown account and an unavailable provider are distinct outcomes

The system SHALL answer a SimBrief user ID that SimBrief reports as unknown with a not-found error naming the account, and SHALL answer a lookup that SimBrief did not complete with a bad-gateway error. SimBrief reports an unknown user both by rejecting the request and by answering successfully with a payload whose fetch status reads `unknown userid`, and the system SHALL treat both as unknown. A response the system cannot read, or one reporting a fetch status other than success, SHALL count as the provider not answering rather than as an unknown account.

#### Scenario: SimBrief rejects the user ID

- **WHEN** SimBrief rejects the lookup of a user ID
- **THEN** the response reports the account as not found

#### Scenario: SimBrief reports an unknown user in a successful response

- **WHEN** SimBrief answers a lookup successfully but its payload reports the user as unknown
- **THEN** the response reports the account as not found rather than returning that payload as a flight plan

#### Scenario: SimBrief cannot be reached

- **WHEN** the request to SimBrief fails or times out
- **THEN** the response reports a bad gateway

#### Scenario: SimBrief answers something unusable

- **WHEN** SimBrief answers with a body the system cannot read, or reports a fetch status that is neither empty nor success
- **THEN** the response reports a bad gateway rather than an unknown account

### Requirement: Fields the flight plan leaves empty are reported as absent

The system SHALL report a text field the flight plan leaves unfilled as absent, and SHALL report a time it cannot read as absent, rather than passing through the empty element SimBrief renders for an unfilled value.

#### Scenario: An unfilled airport name

- **WHEN** the resolved plan leaves an airport's IATA code or name unfilled
- **THEN** those fields are reported as absent and the rest of the plan is reported normally

### Requirement: A Simbrief user ID is verified before it is stored on a profile

The system SHALL resolve a Simbrief user ID against SimBrief before storing it on a user's profile, and SHALL reject an ID SimBrief reports as unknown with a bad request naming the account. A request that clears the ID SHALL NOT be verified. The ID SHALL be accepted, unverified, when the lookup itself could not be completed, so that a SimBrief outage never blocks a profile edit; the system SHALL log that it accepted the value unverified.

#### Scenario: A known ID is stored

- **WHEN** an authenticated user saves a Simbrief user ID that SimBrief knows
- **THEN** the ID is stored and the updated user is returned

#### Scenario: An unknown ID is rejected

- **WHEN** an authenticated user saves a Simbrief user ID that SimBrief does not know
- **THEN** the request is rejected with a bad request naming the account and the stored ID is unchanged

#### Scenario: Clearing the ID needs no verification

- **WHEN** an authenticated user clears their Simbrief user ID
- **THEN** the ID is removed without any request to SimBrief

#### Scenario: An outage does not block the edit

- **WHEN** an authenticated user saves a well-formed Simbrief user ID while SimBrief cannot be reached
- **THEN** the ID is stored, the profile update succeeds, and the system records that it accepted the value unverified

#### Scenario: Stored IDs are not re-verified

- **WHEN** a user whose stored Simbrief user ID was never verified updates an unrelated profile field
- **THEN** the update succeeds and the stored ID is neither verified nor rejected
