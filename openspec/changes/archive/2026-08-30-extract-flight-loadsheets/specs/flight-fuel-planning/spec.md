## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Editing the preliminary loadsheet preserves the final loadsheet

**Reason**: The requirement existed because both loadsheets shared one JSON value, so a
preliminary write that forgot to copy the final one back would erase it. With each loadsheet
stored as its own record there is no write that can reach another one, and the rule is no longer
something the write flow can get wrong.

**Migration**: The guarantee is restated, and widened to cover the preliminary revisions as
well, by `flight-loadsheets` → "A loadsheet is never overwritten". No behaviour is lost.
