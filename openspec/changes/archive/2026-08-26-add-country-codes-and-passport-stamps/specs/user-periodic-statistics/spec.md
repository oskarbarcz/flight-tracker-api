## ADDED Requirements

### Requirement: Report countries unlocked in a period

The system SHALL report, for a calendar period, the countries the pilot entered for the first time
ever within that period, alongside the airports and aircraft types the period already reports. A
country SHALL count as unlocked in the period holding its first entry — the moment it was first
stamped — and SHALL NOT be reported again in any later period. Each unlocked country SHALL be
reported by its alpha-2 code with its catalogue name, and a period in which no new country was
entered SHALL report an empty list rather than being omitted.

#### Scenario: A first-ever entry is reported as unlocked

- **WHEN** a pilot lands in a country for the first time during the period
- **THEN** that country is listed among the period's newly unlocked countries, with its code and name

#### Scenario: A re-entered country is not reported as unlocked

- **WHEN** a pilot lands during the period in a country they had entered before
- **THEN** that country is not listed among the period's newly unlocked countries

#### Scenario: A domestic pilot unlocks nothing new

- **GIVEN** a pilot who has flown only within their own country before the period
- **WHEN** they fly only domestically during the period
- **THEN** the period's newly unlocked countries are an empty list
