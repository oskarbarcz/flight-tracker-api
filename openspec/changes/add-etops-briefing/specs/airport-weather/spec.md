## ADDED Requirements

### Requirement: A flight's ETOPS diversion airports are monitored on check-in

The system SHALL mark the airports an ETOPS flight could divert to as monitored for weather when
a pilot checks in for that flight, on the same terms as the flight's other airports. An airport
a crew may be asked to turn toward over an ocean SHALL NOT be the only airport on the flight
whose weather is not kept current.

#### Scenario: ETOPS airports become monitored at check-in

- **GIVEN** an ETOPS flight with two diversion airports
- **WHEN** the pilot checks in
- **THEN** both diversion airports are marked as monitored for weather, alongside the flight's other airports

#### Scenario: Monitoring an ETOPS airport does not disturb the flight's captured weather

- **GIVEN** an ETOPS flight whose diversion airport weather was captured when the flight was planned
- **WHEN** the pilot checks in and current weather is fetched for that airport
- **THEN** the airport's current weather is updated and the weather captured against the flight is unchanged
