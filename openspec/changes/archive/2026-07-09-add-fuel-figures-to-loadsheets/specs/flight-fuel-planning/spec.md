## ADDED Requirements

### Requirement: Fuel breakdown is enterable in the preliminary loadsheet

The system SHALL allow a user with the `operations` role to include the structured `fuel` breakdown when updating a flight's preliminary loadsheet via `PATCH /api/v1/flight/{flightId}/loadsheet/preliminary`, while the flight is in `created` status. The breakdown MUST be persisted on `loadsheets.preliminary.fuel` and returned verbatim on the flight read, including the optional extended figures (`etops`, `minTakeoff`, `planTakeoff`, `planLanding`, `averageFuelFlow`, `maxTanks`) when supplied. The `fuel` breakdown remains optional; omitting it stores a preliminary loadsheet with no breakdown.

#### Scenario: Operations enters a fuel breakdown in the preliminary loadsheet

- **WHEN** operations updates the preliminary loadsheet of a `created` flight with a `fuel` breakdown whose `block` equals the loadsheet `blockFuel`
- **THEN** the request succeeds
- **AND** the flight read returns the same breakdown on `loadsheets.preliminary.fuel`

#### Scenario: Extended fuel figures round-trip

- **WHEN** operations includes the optional extended figures (`minTakeoff`, `planTakeoff`, `planLanding`, `averageFuelFlow`, `maxTanks`, `etops`) in the preliminary breakdown
- **THEN** those figures are persisted and returned on the flight read

#### Scenario: Preliminary loadsheet without a breakdown

- **WHEN** operations updates the preliminary loadsheet without a `fuel` object
- **THEN** the request succeeds and no breakdown is stored on `loadsheets.preliminary`

### Requirement: Fuel breakdown is enterable in the final loadsheet

The system SHALL allow a user with the `cabin crew` role to include the structured `fuel` breakdown when filling the final loadsheet at `POST /api/v1/flight/{flightId}/finish-boarding`, while the flight is in `boarding_started` status. The breakdown MUST be persisted on `loadsheets.final.fuel` and returned verbatim on the flight read. The `fuel` breakdown remains optional; omitting it stores a final loadsheet with no breakdown.

#### Scenario: Cabin crew fills the final loadsheet with a fuel breakdown

- **WHEN** cabin crew finishes boarding a `boarding_started` flight with a final loadsheet whose `fuel.block` equals its `blockFuel`
- **THEN** the flight transitions to `boarding_finished`
- **AND** the flight read returns the same breakdown on `loadsheets.final.fuel`

#### Scenario: Final loadsheet without a breakdown

- **WHEN** cabin crew finishes boarding with a final loadsheet that omits `fuel`
- **THEN** the request succeeds and no breakdown is stored on `loadsheets.final`

### Requirement: Block fuel summary reconciles with the fuel breakdown

When a `fuel` breakdown is supplied on either the preliminary or the final loadsheet, the system SHALL require the breakdown's `block` figure to equal the loadsheet's `blockFuel` summary. A request whose `fuel.block` differs from `blockFuel` MUST be rejected as unprocessable (`422`) and no loadsheet change is persisted. When no `fuel` breakdown is supplied, no reconciliation is performed.

#### Scenario: Preliminary breakdown block mismatch is rejected

- **WHEN** operations updates the preliminary loadsheet with a `fuel.block` that differs from the loadsheet `blockFuel`
- **THEN** the request is rejected as unprocessable
- **AND** the flight's loadsheets are unchanged

#### Scenario: Final breakdown block mismatch is rejected

- **WHEN** cabin crew finishes boarding with a final loadsheet whose `fuel.block` differs from its `blockFuel`
- **THEN** the request is rejected as unprocessable
- **AND** the flight remains in `boarding_started` with its loadsheets unchanged

### Requirement: Editing the preliminary loadsheet preserves the final loadsheet

When the preliminary loadsheet is updated, the system SHALL preserve any existing final loadsheet on the flight rather than discarding it. Updating the preliminary loadsheet MUST NOT clear `loadsheets.final`.

#### Scenario: Existing final loadsheet survives a preliminary update

- **WHEN** the preliminary loadsheet of a flight that already has a final loadsheet is updated
- **THEN** the flight's `loadsheets.final` is unchanged after the update
