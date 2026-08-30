## MODIFIED Requirements

### Requirement: Finishing boarding reconciles the manifest against the final loadsheet

The system SHALL reconcile a flight's manifest when boarding is finished, comparing the final
loadsheet's passenger count against the manifest generated from the preliminary loadsheet. Where
the final count is lower, the surplus SHALL be recorded as no-shows; where it is higher, the
shortfall SHALL be filled with newly generated passengers seated in free seats.

#### Scenario: A lower final count records no-shows

- **GIVEN** a flight whose manifest holds more passengers than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** the surplus passengers are recorded as no-shows keeping their seats

#### Scenario: An unchanged count changes nothing

- **GIVEN** a released flight whose final loadsheet reports the same count as its manifest
- **WHEN** boarding is finished
- **THEN** no passenger is added and none becomes a no-show

#### Scenario: A higher final count seats the shortfall

- **GIVEN** a flight whose manifest holds fewer passengers than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** the shortfall is filled with newly generated passengers in free seats
