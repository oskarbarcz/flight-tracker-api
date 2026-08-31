# flight-fuel-planning

## Purpose

Capture the structured planned fuel breakdown carried inside a flight's loadsheet (in
tons) and the rules for entering it through the loadsheet write flows. Fuel figures reach
a flight two ways — populated from the SimBrief OFP when a flight is created, and entered
manually by operations on the preliminary loadsheet and by cabin crew on the final
loadsheet. The `blockFuel` summary must reconcile with the breakdown, and editing the
preliminary loadsheet must not destroy an existing final loadsheet.
## Requirements
### Requirement: Fuel breakdown is enterable in the preliminary loadsheet

The system SHALL allow a user with the `operations` role to include the structured `fuel` breakdown when updating a flight's preliminary loadsheet via `PATCH /api/v1/flight/{flightId}/loadsheet/preliminary`, while the flight is in `created` status. The breakdown MUST be persisted on the preliminary revision the update creates and returned verbatim on the flight's loadsheet read, including the optional extended figures (`etops`, `minTakeoff`, `planTakeoff`, `planLanding`, `averageFuelFlow`, `maxTanks`) when supplied. The `fuel` breakdown remains optional; omitting it stores a preliminary loadsheet with no breakdown.

#### Scenario: Operations enters a fuel breakdown in the preliminary loadsheet

- **WHEN** operations updates the preliminary loadsheet of a `created` flight with a `fuel` breakdown whose `block` equals the loadsheet `blockFuel`
- **THEN** the request succeeds
- **AND** the flight's loadsheet read returns the same breakdown on its current preliminary loadsheet

#### Scenario: Extended fuel figures round-trip

- **WHEN** operations includes the optional extended figures (`minTakeoff`, `planTakeoff`, `planLanding`, `averageFuelFlow`, `maxTanks`, `etops`) in the preliminary breakdown
- **THEN** those figures are persisted and returned on the flight's loadsheet read

#### Scenario: Preliminary loadsheet without a breakdown

- **WHEN** operations updates the preliminary loadsheet without a `fuel` object
- **THEN** the request succeeds and the preliminary revision it creates carries no breakdown

#### Scenario: A revision without a breakdown does not erase an earlier one

- **GIVEN** a flight whose preliminary revision 1 carries a fuel breakdown
- **WHEN** operations issues a revision 2 with no `fuel` object
- **THEN** revision 2 carries no breakdown and revision 1 still carries the one it was issued with

### Requirement: Fuel breakdown is enterable in the final loadsheet

The system SHALL allow a user with the `cabin crew` role to include the structured `fuel` breakdown when filling the final loadsheet at `POST /api/v1/flight/{flightId}/finish-boarding`, while the flight is in `boarding_started` status. The breakdown MUST be persisted on the final loadsheet and returned verbatim on the flight's loadsheet read. The `fuel` breakdown remains optional; omitting it stores a final loadsheet with no breakdown.

#### Scenario: Cabin crew fills the final loadsheet with a fuel breakdown

- **WHEN** cabin crew finishes boarding a `boarding_started` flight with a final loadsheet whose `fuel.block` equals its `blockFuel`
- **THEN** the flight transitions to `boarding_finished`
- **AND** the flight's loadsheet read returns the same breakdown on its final loadsheet

#### Scenario: Final loadsheet without a breakdown

- **WHEN** cabin crew finishes boarding with a final loadsheet that omits `fuel`
- **THEN** the request succeeds and no breakdown is stored on the final loadsheet

### Requirement: Block fuel summary reconciles with the fuel breakdown

When a `fuel` breakdown is supplied on either the preliminary or the final loadsheet, the system SHALL require the breakdown's `block` figure to equal the loadsheet's `blockFuel` summary. A request whose `fuel.block` differs from `blockFuel` MUST be rejected as unprocessable (`422`) and no loadsheet is written. When no `fuel` breakdown is supplied, no reconciliation is performed.

#### Scenario: Preliminary breakdown block mismatch is rejected

- **WHEN** operations updates the preliminary loadsheet with a `fuel.block` that differs from the loadsheet `blockFuel`
- **THEN** the request is rejected as unprocessable
- **AND** no preliminary revision is recorded, and the flight's current preliminary loadsheet is unchanged

#### Scenario: Final breakdown block mismatch is rejected

- **WHEN** cabin crew finishes boarding with a final loadsheet whose `fuel.block` differs from its `blockFuel`
- **THEN** the request is rejected as unprocessable
- **AND** the flight remains in `boarding_started` with no final loadsheet recorded

### Requirement: The loadsheet may carry a passenger breakdown per cabin class

The system SHALL accept on a loadsheet an optional breakdown of the passenger count per cabin
class, keyed as the aircraft's cabin layout names them. Every count SHALL be a whole number of
zero or more, and a breakdown carrying anything else SHALL be rejected as a malformed request
naming the offending field, because a fractional or negative passenger is a mistake in the
request rather than a judgement about the flight. Where the breakdown is given its values SHALL
sum to the loadsheet's passenger count, and a breakdown that does not SHALL be rejected as
unprocessable. Where it is omitted the loadsheet SHALL remain valid, and the passenger count
alone SHALL be authoritative.

#### Scenario: A loadsheet without a breakdown remains valid

- **WHEN** a loadsheet is submitted carrying only a passenger count
- **THEN** the loadsheet is accepted

#### Scenario: A consistent breakdown is accepted

- **WHEN** a loadsheet is submitted whose per-class passenger counts sum to its passenger count
- **THEN** the loadsheet is accepted and the breakdown is stored

#### Scenario: An inconsistent breakdown is rejected

- **WHEN** a loadsheet is submitted whose per-class passenger counts do not sum to its passenger count
- **THEN** the request is rejected as unprocessable

#### Scenario: A count that is not a whole number of zero or more is refused

- **WHEN** a loadsheet is submitted whose breakdown carries a negative or fractional count
- **THEN** the request is rejected as malformed, naming the breakdown as the offending field

#### Scenario: A breakdown is reported on reads

- **GIVEN** a flight whose loadsheet carries a per-class breakdown
- **WHEN** the loadsheet is read
- **THEN** the breakdown is reported alongside the passenger count

### Requirement: A loadsheet passenger count is limited by the aircraft's seat capacity

The system SHALL reject as unprocessable a loadsheet whose passenger count exceeds the number
of seats in the cabin layout assigned to the flight's aircraft. Where the aircraft has no
assigned cabin layout the passenger count SHALL NOT be limited, because no seat capacity is
known.

#### Scenario: An over-capacity count is rejected

- **GIVEN** a flight whose aircraft has an assigned cabin layout
- **WHEN** a loadsheet is submitted reporting more passengers than that layout has seats
- **THEN** the request is rejected as unprocessable

#### Scenario: A count within capacity is accepted

- **GIVEN** a flight whose aircraft has an assigned cabin layout
- **WHEN** a loadsheet is submitted reporting no more passengers than that layout has seats
- **THEN** the loadsheet is accepted

#### Scenario: No layout means no limit

- **GIVEN** a flight whose aircraft has no assigned cabin layout
- **WHEN** a loadsheet is submitted reporting any passenger count
- **THEN** the loadsheet is accepted

### Requirement: A loadsheet cargo tonnage is limited by the aircraft's hold capacity

The system SHALL reject as unprocessable a loadsheet whose cargo tonnage exceeds what the hold
variant resolved for the flight's aircraft can carry, whether by weight or by volume. Where the
aircraft's airframe type has no curated hold data the cargo tonnage SHALL NOT be limited, because
no hold capacity is known.

#### Scenario: An over-capacity cargo tonnage is rejected

- **GIVEN** a flight whose aircraft's hold can carry less than the cargo the loadsheet reports
- **WHEN** that loadsheet is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A tonnage exceeding the hold's volume is rejected

- **GIVEN** a loadsheet whose cargo cannot fit the hold's volume at any plausible density
- **WHEN** it is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A tonnage at capacity is accepted

- **WHEN** a loadsheet reports exactly the cargo tonnage the hold can carry
- **THEN** the loadsheet is accepted

#### Scenario: An aircraft without hold data is not limited

- **GIVEN** a flight whose aircraft's airframe type has no curated hold data
- **WHEN** a loadsheet reporting any cargo tonnage is submitted
- **THEN** the loadsheet is accepted

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

