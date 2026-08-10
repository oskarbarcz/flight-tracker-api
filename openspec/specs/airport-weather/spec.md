# airport-weather

## Purpose

Store and serve the latest raw ATIS, METAR and TAF per airport and per weather source,
keep an airport monitored and its weather refreshed from every source while any flight
that references it is active (checked-in through taxiing-in), and expose the stored
reports via a public read endpoint that filters by source, defaulting to the reader's own
preference.

## Requirements

### Requirement: Retrieve airport weather

The system SHALL expose `GET /api/v1/airport/:airportId/weather` returning the weather
reports stored for the airport identified by its UUID as a collection, and SHALL serve it
without authentication. Each entry SHALL carry the report's identifier, the source that
published it, the information type it is (`atis`, `metar` or `taf`), its content, and when
the system last fetched it. The collection SHALL be ordered deterministically by source and
then by information type, so that repeated reads of unchanged data return entries in the
same order. An airport that holds no report matching the request SHALL yield an empty
collection rather than an error; only an airport that does not exist SHALL be reported as
missing.

#### Scenario: Weather exists for the airport

- **WHEN** an unauthenticated client requests `GET /api/v1/airport/:airportId/weather` for an airport that has stored reports
- **THEN** the system responds `200 OK` with one entry per stored report, each carrying its identifier, source, information type, content, and last-fetched time

#### Scenario: No weather record for the airport

- **WHEN** a client requests weather for an existing airport that has never had weather fetched
- **THEN** the system responds `200 OK` with an empty collection

#### Scenario: The airport does not exist

- **WHEN** a client requests weather for an airport id that no airport has
- **THEN** the system responds `404 Not Found`

#### Scenario: Airport id is not a valid UUID

- **WHEN** a client requests weather with an `airportId` that is not a valid UUID v4
- **THEN** the system responds `400 Bad Request`

#### Scenario: Order does not vary between reads

- **WHEN** a client reads the same airport's weather twice without any refresh in between
- **THEN** both responses list the entries in the same order

### Requirement: Weather storage semantics

The system SHALL store at most one report per combination of airport, source and
information type, holding the report content exactly as that source returned it. A refresh
SHALL update the existing report in place rather than adding a second one, and SHALL record
the time the system fetched the data as the report's last-fetched time, not any observation
time parsed from the content. The system SHALL NOT normalise or reconcile content between
sources: where two sources describe the same airport and information type, both are stored
as received and both are readable. Reports SHALL be retained when an airport stops being
monitored.

#### Scenario: Timestamps reflect fetch time

- **WHEN** the system stores a newly fetched report for an airport
- **THEN** that report's last-fetched time is the time of the fetch

#### Scenario: One record per airport

- **WHEN** weather is fetched for an airport that already holds a report from the same source and of the same information type
- **THEN** the existing report is updated in place rather than a second one being created

#### Scenario: Content from different sources is kept as received

- **WHEN** both sources publish a METAR for the same airport and the two texts differ
- **THEN** the system stores and returns each source's text unchanged, without reformatting either to match the other

#### Scenario: Reports survive the end of monitoring

- **WHEN** an airport stops being monitored
- **THEN** its stored reports are retained and remain readable

### Requirement: Filter retrieved weather by source

The system SHALL accept an optional `source` filter on the weather read endpoint, taking
one of `user_default`, `all`, `aviation_weather_gov` or `say_intentions`, and SHALL default
to `user_default` when the filter is absent. `user_default` SHALL resolve to the requesting
user's default weather source; because the endpoint is public, a request that carries no
identified user SHALL resolve `user_default` to `aviation_weather_gov`. `all` SHALL return
the airport's reports from every source. A named source SHALL return only that source's
reports. A filter that matches no stored report SHALL yield an empty collection. A value
outside the accepted set SHALL be rejected as a validation error.

#### Scenario: An authenticated read with no filter uses the user's default

- **WHEN** a user whose default weather source is `say_intentions` reads an airport's weather without a `source` filter
- **THEN** the response contains only that airport's `say_intentions` reports

#### Scenario: Users with different defaults get different collections

- **WHEN** two users with different default weather sources read the same airport's weather without a `source` filter
- **THEN** each response contains only the reports of that user's own default source

#### Scenario: An anonymous read falls back to the default source

- **WHEN** an unauthenticated client reads an airport's weather without a `source` filter
- **THEN** the response contains only that airport's `aviation_weather_gov` reports

#### Scenario: Every source is requested

- **WHEN** a client reads an airport's weather with `source=all`
- **THEN** the response contains the airport's reports from both sources

#### Scenario: One named source is requested

- **WHEN** a client reads an airport's weather with `source=say_intentions`
- **THEN** the response contains only that airport's `say_intentions` reports, whatever the requesting user's default is

#### Scenario: The filter matches nothing

- **WHEN** a client requests `source=say_intentions` for an airport that holds only `aviation_weather_gov` reports
- **THEN** the system responds `200 OK` with an empty collection

#### Scenario: The filter value is not recognised

- **WHEN** a client requests weather with a `source` value outside the accepted set
- **THEN** the system responds `400 Bad Request`

### Requirement: Collect ATIS and reports from SayIntentions

The system SHALL collect METAR, TAF and ATIS from SayIntentions for every monitored
airport, storing each as its own report attributed to that source. ATIS SHALL be stored as
the spoken text the source publishes, without extracting the information letter or any
other field out of it. Because aviationweather.gov publishes no ATIS, an ATIS report SHALL
only ever be attributed to SayIntentions. The frequency list SayIntentions returns
alongside the weather SHALL NOT be stored.

#### Scenario: All three information types are stored for a monitored airport

- **WHEN** SayIntentions returns a METAR, a TAF and an ATIS for a monitored airport
- **THEN** the airport holds three `say_intentions` reports, one of each information type, each carrying the text as published

#### Scenario: ATIS is attributed only to SayIntentions

- **WHEN** an airport's weather is read with `source=aviation_weather_gov`
- **THEN** no ATIS report appears in the response

#### Scenario: A source returns only some information types

- **WHEN** SayIntentions returns a METAR and an ATIS but no TAF for a monitored airport
- **THEN** the airport holds the METAR and ATIS reports and no `say_intentions` TAF report, and any previously stored TAF from that source is left as it was

### Requirement: Monitor a flight's airports on check-in

The system SHALL mark every airport referenced by a flight — departure, destination,
destination alternate, and enroute alternate — as monitored for weather when a pilot checks
in for that flight, recording the flag on the airport itself. The system SHALL fetch weather
from every source for those airports immediately, so that weather is available without
waiting for the next scheduled refresh. The monitoring flag SHALL be system-managed: no
endpoint SHALL allow it to be set or cleared directly.

#### Scenario: Airports become monitored at check-in

- **WHEN** a pilot checks in for a flight
- **THEN** each of the flight's airports is marked as monitored for weather

#### Scenario: Weather is fetched immediately at check-in

- **WHEN** a flight's airports become monitored at check-in
- **THEN** the system fetches and stores current reports from every source for those airports without waiting for the scheduled refresh

#### Scenario: Monitoring cannot be set through an endpoint

- **WHEN** a client submits the weather monitoring flag in an update of an airport
- **THEN** the request is rejected with a validation error naming that field, and which airports are monitored is unchanged

### Requirement: Stop monitoring a flight's airports on on-block

The system SHALL clear the weather monitoring flag for a flight's airports when that flight
reports on-block, EXCEPT any airport still referenced by another flight in an active status
— checked in but not yet on-block or closed — which SHALL remain monitored. Stored reports
SHALL NOT be deleted; only the monitoring flag changes.

#### Scenario: Airports stop being monitored at on-block

- **WHEN** a flight reports on-block and no other active flight references its airports
- **THEN** each of that flight's airports is no longer monitored and its stored reports are retained

#### Scenario: An airport shared with another active flight stays monitored

- **WHEN** a flight reports on-block but one of its airports is still referenced by another flight in an active status
- **THEN** that shared airport remains monitored while the other airports of the on-block flight do not

### Requirement: Scheduled refresh of monitored airports

The system SHALL refresh weather from every source for all monitored airports on a schedule
of every 5 minutes, updating the stored content and last-fetched time of each report.
Airports that are not monitored SHALL NOT be refreshed. When no airport is monitored, the
system SHALL make no upstream request. The system SHALL request aviationweather.gov reports
for the monitored airports in a single batched call per information type, and SHALL request
SayIntentions reports per airport, because that source answers for one airport at a time.

#### Scenario: Monitored airports are refreshed on schedule

- **WHEN** the scheduled refresh runs and one or more airports are monitored
- **THEN** the system fetches from both sources and updates the content and last-fetched time of those airports' reports

#### Scenario: Unmonitored airports are left alone

- **WHEN** the scheduled refresh runs while an airport with stored reports is not monitored
- **THEN** that airport's reports are left unchanged

#### Scenario: No monitored airports

- **WHEN** the scheduled refresh runs and no airports are monitored
- **THEN** the system makes no upstream weather request

### Requirement: Upstream weather failures are isolated

The system SHALL treat each source and each airport as an independent unit of work when
refreshing weather, so that one failure cannot suppress unrelated data. A source that is
unreachable or errors SHALL NOT prevent the other source's reports from being stored, and a
failure for one airport SHALL NOT prevent the remaining airports from being refreshed. A
failed fetch SHALL leave the previously stored report and its last-fetched time untouched
rather than emptying it, and SHALL be recorded in the application log. A refresh in which
every fetch fails SHALL NOT fail the request or scheduled run that triggered it.

#### Scenario: One source is down

- **WHEN** a refresh runs and one source is unreachable while the other answers
- **THEN** the answering source's reports are stored and updated, and the unreachable source's previously stored reports are left as they were

#### Scenario: One airport fails

- **WHEN** a refresh runs and the upstream request for one monitored airport fails while the others succeed
- **THEN** the other airports' reports are stored and the failure is logged

#### Scenario: A failed check-in fetch does not fail the check-in

- **WHEN** a pilot checks in and every weather fetch for the flight's airports fails
- **THEN** the check-in still succeeds and the airports are still marked as monitored

