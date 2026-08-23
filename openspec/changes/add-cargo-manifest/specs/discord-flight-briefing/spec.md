## ADDED Requirements

### Requirement: Briefing carries a special load summary

The system SHALL include in the briefing delivered on check-in a summary of the flight's
notifiable load: how many dangerous goods shipments it carries, how many of those are restricted
to cargo aircraft, how many other notifiable special loads there are, and the highest cold chain
risk aboard. Where the flight carries none of these, the briefing SHALL state that no dangerous
goods are loaded rather than omitting the section.

#### Scenario: A briefing for a flight carrying dangerous goods

- **GIVEN** a flight whose cargo manifest carries dangerous goods and other special loads
- **WHEN** the pilot checks in and the briefing is delivered
- **THEN** the briefing reports the dangerous goods count, the cargo-aircraft-only count, the special load count and the highest cold chain risk

#### Scenario: A briefing for a flight carrying none

- **GIVEN** a flight whose cargo manifest carries no dangerous goods and no other special loads
- **WHEN** the briefing is delivered
- **THEN** the briefing states that no dangerous goods are loaded

#### Scenario: A briefing for a flight with no cargo manifest

- **GIVEN** a flight for which no cargo manifest was generated
- **WHEN** the briefing is delivered
- **THEN** the briefing omits the special load summary

### Requirement: Briefing points to the notification to captain rather than reproducing it

The system SHALL keep the detail of the notification to captain behind its own read, and SHALL
carry in the briefing only the summary and a pointer to the flight, so that the briefing does not
become the operative document.

#### Scenario: The briefing does not carry the full notification

- **GIVEN** a flight carrying several dangerous goods shipments
- **WHEN** the briefing is delivered
- **THEN** it carries the summary and a link back to the flight, not the per-shipment detail
