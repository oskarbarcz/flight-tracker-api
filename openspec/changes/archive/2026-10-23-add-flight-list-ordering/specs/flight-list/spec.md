## ADDED Requirements

### Requirement: The flight list can be ordered by creation, scheduled off-block or actual on-block

The system SHALL accept an optional `sort` query parameter on `GET /api/v1/flight` taking
`createdAt`, `scheduledOffBlockTime` or `actualOnBlockTime`, and an optional `order` taking `asc` or
`desc`. Without them the list SHALL keep its existing order: most recently created first. The
ordering SHALL apply before pagination, so every page is a slice of one ordered list, and the
`X-Total-Count` header SHALL keep counting every flight the filters match. Flights that have no value
for the chosen time, such as a flight that has not reached on-block, SHALL come last in either
direction. Flights with the same time SHALL be ordered most recently created first. Any other value
for either parameter SHALL be rejected with status `400` and a violation naming the parameter.

#### Scenario: Upcoming flights in the order they leave

- **WHEN** a user lists `phase=upcoming&sort=scheduledOffBlockTime&order=asc`
- **THEN** the first flight is the one with the earliest scheduled off-block

#### Scenario: The flight that arrived last

- **WHEN** a user lists `phase=finished&sort=actualOnBlockTime&order=desc&limit=1`
- **THEN** the only flight returned is the one with the latest actual on-block

#### Scenario: Pages follow the requested order

- **WHEN** a user lists the second page of upcoming flights ordered by scheduled off-block
- **THEN** it continues the order where the first page ended

#### Scenario: An unknown ordering is rejected

- **WHEN** a user lists flights with `sort=bogus` or `order=up`
- **THEN** the response status is `400` with a violation for each unknown value
