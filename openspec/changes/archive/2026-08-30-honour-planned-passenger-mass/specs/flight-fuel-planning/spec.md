## ADDED Requirements

### Requirement: A loadsheet carries the passenger mass it was planned with

The system SHALL record on a loadsheet the mass per passenger the loadsheet was planned with, in
kilograms. Where the flight was created from an imported flight plan that mass SHALL be taken from
the plan itself — the payload less its cargo, spread over the passengers it carries — because the
plan's own figures are what its payload was sized against. Where no plan stated a mass the
standard adult mass SHALL apply.

The mass SHALL be derived by the system and SHALL NOT be accepted from a request: a loadsheet that
could name the mass it is measured against could name any payload floor it liked. A loadsheet
write SHALL preserve the mass already recorded for the flight, whatever the request body claims,
and the final loadsheet SHALL inherit the mass the preliminary loadsheet carries. The mass SHALL
be reported on reads so a rejected payload can be explained.

Where a plan carries no passengers no mass SHALL be recorded, and the payload floor SHALL rest on
the cargo alone.

#### Scenario: The mass is taken from an imported flight plan

- **GIVEN** an imported flight plan whose payload, less its cargo, spreads to 80 kg for each passenger it carries
- **WHEN** the flight is created from it
- **THEN** the preliminary loadsheet records a planned passenger mass of 80 kg
- **AND** the mass is reported when the flight is read

#### Scenario: A hand-created flight is planned at the standard adult mass

- **GIVEN** a flight created without an imported flight plan
- **WHEN** its preliminary loadsheet is read
- **THEN** no planned passenger mass is recorded
- **AND** its payload is measured against the standard adult mass

#### Scenario: A request cannot name the mass it is measured against

- **GIVEN** a flight whose preliminary loadsheet records a planned passenger mass of 80 kg
- **WHEN** operations updates that loadsheet with a request body naming a passenger mass of 10 kg
- **THEN** the recorded mass remains 80 kg
- **AND** the payload is measured against 80 kg

#### Scenario: The final loadsheet inherits the mass the plan was built with

- **GIVEN** a flight whose preliminary loadsheet records a planned passenger mass of 80 kg
- **WHEN** boarding is finished with a final loadsheet
- **THEN** the final loadsheet is measured against 80 kg
- **AND** it records the same mass

#### Scenario: A plan carrying no passengers records no mass

- **GIVEN** an imported flight plan carrying no passengers
- **WHEN** the flight is created from it
- **THEN** no planned passenger mass is recorded
- **AND** its payload is measured against its cargo alone

### Requirement: Weights imported from a flight plan keep kilogram precision

The system SHALL store every weight imported from a flight plan — the payload, the cargo, the zero
fuel weight and every fuel figure — to the nearest kilogram rather than to the nearest tenth of a
ton, because rounding a payload down while rounding its cargo up manufactures a shortfall out of
figures that reconciled exactly. A loadsheet imported from a flight plan SHALL therefore satisfy
the payload floor without any weight being altered.

#### Scenario: An imported weight is stored to the kilogram

- **GIVEN** an imported flight plan reporting a payload of 22,649 kg and a cargo of 1,151 kg
- **WHEN** the flight is created from it
- **THEN** the preliminary loadsheet reports a payload of 22.649 tons and a cargo of 1.151 tons

#### Scenario: An imported loadsheet is accepted unchanged

- **GIVEN** a flight created from an imported flight plan
- **WHEN** its preliminary loadsheet is submitted again with no weight changed
- **THEN** the loadsheet is accepted

#### Scenario: An imported flight plan can be flown without editing its weights

- **GIVEN** a flight created from an imported flight plan whose passengers were planned lighter than the standard adult mass
- **WHEN** boarding is finished with the weights the plan supplied
- **THEN** the request is accepted
- **AND** the flight is closed for boarding

## MODIFIED Requirements

### Requirement: A loadsheet payload accounts for its cargo and its passengers

The system SHALL reject as unprocessable a loadsheet whose payload is smaller than its cargo
tonnage plus its passengers at the mass the loadsheet was planned with, because a payload that
cannot contain the load it declares is not a loadsheet a flight can be planned from. Where the
loadsheet records no planned passenger mass the standard adult mass SHALL apply. The check SHALL
apply to the preliminary and the final loadsheet alike, and a payload that accounts for the load
exactly SHALL be accepted.

The mass the check rests on SHALL be the one the loadsheet records, never one the request
supplies, so that a flight planned elsewhere is measured against the figures it was planned with
and not against an assumption imposed on it.

#### Scenario: A payload smaller than the cargo it carries is rejected

- **GIVEN** a loadsheet reporting a payload of 4 tons and a cargo tonnage of 7 tons
- **WHEN** it is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A payload that cannot carry its passengers is rejected

- **GIVEN** a loadsheet whose payload, less its cargo, is smaller than its passengers at the mass it was planned with
- **WHEN** it is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A payload accounting for the load exactly is accepted

- **GIVEN** a loadsheet whose payload equals its cargo plus its passengers at the mass it was planned with
- **WHEN** it is submitted
- **THEN** the loadsheet is accepted

#### Scenario: A payload planned at a lighter passenger is accepted

- **GIVEN** a loadsheet recording a planned passenger mass of 80 kg, 267 passengers, 1.2 tons of cargo and a payload of 22.6 tons
- **WHEN** it is submitted
- **THEN** the loadsheet is accepted, because its payload accounts for the load at the mass it was planned with

#### Scenario: The final loadsheet is checked on the same terms

- **GIVEN** a final loadsheet whose payload is smaller than its cargo tonnage
- **WHEN** boarding is finished with it
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not closed for boarding
