## ADDED Requirements

### Requirement: Retrieve airport weather

The system SHALL expose `GET /api/v1/airport/:airportId/weather` returning the stored weather for the airport identified by its UUID. The endpoint SHALL be available without authentication. The response body SHALL contain `metar`, `metarLastUpdate`, `taf`, `tafLastUpdate`, and `watch`.

#### Scenario: Weather exists for the airport

- **WHEN** an unauthenticated client requests `GET /api/v1/airport/:airportId/weather` for an airport that has a weather record
- **THEN** the system responds `200 OK` with `{ metar, metarLastUpdate, taf, tafLastUpdate, watch }` from the stored record

#### Scenario: No weather record for the airport

- **WHEN** a client requests weather for an airport that has no weather record
- **THEN** the system responds `404 Not Found`

#### Scenario: Airport id is not a valid UUID

- **WHEN** a client requests weather with an `airportId` that is not a valid UUID v4
- **THEN** the system responds `400 Bad Request`

### Requirement: Watch a flight's airports on check-in

When a pilot checks in for a flight, the system SHALL mark every airport referenced by that flight (departure, destination, destination alternate, and enroute alternate) as watched, creating a weather record for any airport that does not yet have one. The system SHALL fetch METAR and TAF for those airports immediately so weather is available without waiting for the next scheduled refresh.

#### Scenario: Airports become watched at check-in

- **WHEN** a `PilotCheckedInEvent` is emitted for a flight
- **THEN** each of the flight's airports has a weather record with `watch` set to `true`

#### Scenario: Weather is fetched immediately at check-in

- **WHEN** a flight's airports become watched at check-in
- **THEN** the system fetches and stores current METAR and TAF for those airports without waiting for the scheduled refresh

### Requirement: Stop watching a flight's airports on on-block

When a flight reports on-block, the system SHALL clear the `watch` flag for that flight's airports, EXCEPT any airport still referenced by another flight in an active status (checked-in through taxiing-in, i.e. checked in but not yet on-block or closed), which SHALL remain watched. Weather records SHALL NOT be deleted; only the `watch` flag changes.

#### Scenario: Airports stop being watched at on-block

- **WHEN** an `OnBlockWasReportedEvent` is emitted for a flight and no other active flight references its airports
- **THEN** each of that flight's airports has `watch` set to `false` and its weather record is retained

#### Scenario: Airport shared with another active flight stays watched

- **WHEN** a flight reports on-block but one of its airports is still referenced by another flight in an active status
- **THEN** that shared airport keeps `watch` set to `true` while the other airports of the on-block flight are set to `false`

### Requirement: Scheduled refresh of watched airports

The system SHALL refresh METAR and TAF for all watched airports on a schedule of every 5 minutes. The refresh SHALL request weather for the watched airports in a single batched upstream call using a comma-joined list of ICAO codes, and SHALL update the stored text and fetch timestamps. Airports that are not watched SHALL NOT be refreshed.

#### Scenario: Watched airports are refreshed on schedule

- **WHEN** the scheduled refresh runs and one or more airports are watched
- **THEN** the system requests weather for all watched airports in a single batched call and updates their `metar`, `metarLastUpdate`, `taf`, and `tafLastUpdate`

#### Scenario: No watched airports

- **WHEN** the scheduled refresh runs and no airports are watched
- **THEN** the system makes no upstream weather request

### Requirement: Weather storage semantics

The system SHALL store at most one weather record per airport, holding the raw METAR and TAF text as returned by the provider. The `metarLastUpdate` and `tafLastUpdate` timestamps SHALL record when the system fetched the data, not any observation time parsed from the text.

#### Scenario: Timestamps reflect fetch time

- **WHEN** the system stores newly fetched METAR or TAF for an airport
- **THEN** the corresponding `metarLastUpdate` / `tafLastUpdate` is set to the time of the fetch

#### Scenario: One record per airport

- **WHEN** weather is stored for an airport that already has a record
- **THEN** the existing record is updated in place rather than a second record being created
