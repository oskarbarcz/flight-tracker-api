## ADDED Requirements

### Requirement: Expose calendar-period totals

The system SHALL expose the pilot's distance, airborne time, block time, flight count, and
fuel for calendar periods — the current and previous week, month, and year — scoping each
flight to the period of its `completedAt`, so period-over-period comparison is possible.
Calendar boundaries SHALL be evaluated in UTC (Zulu), and a week SHALL run Monday 00:00 UTC
through Sunday.

#### Scenario: This-month total counts only flights completed this month

- **WHEN** a pilot requests their current-month statistics
- **THEN** only flights whose `completedAt` falls in the current calendar month are summed

#### Scenario: Last-year total counts only flights completed last year

- **WHEN** a pilot requests their previous-year statistics
- **THEN** only flights whose `completedAt` falls in the previous calendar year are summed

#### Scenario: A flight is attributed by when it flew

- **WHEN** a flight was created in one month but completed in the next
- **THEN** it is counted in the month of its `completedAt`, not its creation month

#### Scenario: Weeks run Monday to Sunday in UTC

- **WHEN** a flight completes on a Sunday and another on the following Monday (UTC)
- **THEN** they fall into different week periods, split at Monday 00:00 UTC

### Requirement: Report airports and types unlocked in a period

The system SHALL report, for a calendar period, the airports and aircraft types the pilot
flew for the first time ever within that period.

#### Scenario: A first-ever visit is reported as unlocked

- **WHEN** a pilot visits an airport for the first time during the period
- **THEN** that airport is listed among the period's newly unlocked airports

#### Scenario: A re-visited airport is not reported as unlocked

- **WHEN** a pilot re-visits during the period an airport they had visited before
- **THEN** that airport is not listed among the period's newly unlocked airports

### Requirement: Provide an activity heatmap series

The system SHALL provide a per-day activity series (flights and minutes per day) over a
requested date range, suitable for rendering a contribution-style heatmap.

#### Scenario: Active days report their counts

- **WHEN** a pilot requests their activity series over a range containing flown days
- **THEN** each day with completed flights reports its flight count and minutes

#### Scenario: Inactive days carry no activity

- **WHEN** the requested range contains days with no completed flights
- **THEN** those days report zero activity

### Requirement: Serve period reads from cache with boundary-aware freshness

The system SHALL serve period statistics from a per-user cache that is invalidated when the
pilot's statistics change and additionally expires at the next calendar-period boundary, so
a period rolls over without requiring a write.

#### Scenario: A completed flight invalidates the cached period

- **WHEN** a pilot completes a new flight
- **THEN** their cached period statistics are invalidated and recomputed on next read

#### Scenario: A current period expires at its boundary

- **WHEN** the calendar crosses into a new period with no new flight
- **THEN** the cached current-period result has expired and the new period reads fresh
