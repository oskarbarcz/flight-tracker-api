## MODIFIED Requirements

### Requirement: A flight may be created with its first loadsheet

The system SHALL accept an optional loadsheet when a flight is created, and SHALL record it as
the flight's preliminary loadsheet of revision 1, issued by the user creating the flight.
Where no loadsheet is supplied the flight SHALL be created with none, and cannot be marked ready
until one is issued. A flight imported from a flight plan SHALL be created with the loadsheet
the plan states, except that when the plan reports more passengers than the aircraft's assigned
cabin layout has seats, the loadsheet SHALL report the seat count as its passengers, and its payload
and zero fuel weight SHALL each be reduced by the mass of the passengers left behind at the
loadsheet's planned passenger mass. Cargo, fuel and the planned passenger mass SHALL be kept as the
plan states them.

#### Scenario: A flight is created with a loadsheet

- **WHEN** a flight is created with a loadsheet
- **THEN** the flight has one preliminary loadsheet, of revision 1

#### Scenario: A flight is created without a loadsheet

- **WHEN** a flight is created with no loadsheet
- **THEN** the flight has no loadsheets
- **AND** its loadsheet read returns an empty array

#### Scenario: An imported flight carries the plan's loadsheet

- **WHEN** a flight is imported from a flight plan
- **THEN** it has one preliminary loadsheet, of revision 1, reporting the figures the plan states

#### Scenario: An imported plan larger than the cabin is capped at its seats

- **GIVEN** a plan reporting 348 passengers at a planned 86 kg, a payload of 37.932 t and a zero fuel weight of 206.523 t
- **AND** an aircraft whose layout has 220 seats
- **WHEN** the flight is imported from that plan
- **THEN** its preliminary loadsheet reports 220 passengers, a payload of 26.924 t and a zero fuel weight of 195.515 t
