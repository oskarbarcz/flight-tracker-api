## ADDED Requirements

### Requirement: Structured planned fuel breakdown in the loadsheet

The system SHALL store a structured planned fuel breakdown, in tons, nested within a
flight's loadsheet as a `fuel` object, covering: block, taxi, trip, alternate, reserve,
contingency (a text type and an amount), MEL, ATC, WXX, extra, and tankering fuel. The
loadsheet's `blockFuel` SHALL be retained as a summary figure consistent with the
breakdown's block fuel. When a flight is created from a SimBrief flight plan, the system
SHALL populate the fuel breakdown from the OFP. The breakdown SHALL also be enterable
manually at flight planning for flights not created from SimBrief.

#### Scenario: SimBrief import populates the fuel breakdown

- **WHEN** a flight is created from a SimBrief flight plan
- **THEN** the flight's loadsheet `fuel` breakdown is populated from the OFP fuel figures
- **AND** the loadsheet `blockFuel` summary equals the breakdown's block fuel

#### Scenario: Manual fuel entry at planning

- **WHEN** a fuel breakdown is entered manually in a flight's loadsheet during planning
- **THEN** the flight stores those planned fuel figures

#### Scenario: Fuel amounts are in tons

- **WHEN** the fuel breakdown is read
- **THEN** every fuel amount is expressed in tons

### Requirement: Capture actual fuel burned at flight close

The system SHALL allow the actual fuel burned, in tons, to be captured when a flight is
closed. Providing it SHALL be optional and its absence SHALL NOT prevent closing the
flight. When provided, the system SHALL make a delta against the planned trip fuel
available, presenting the planned trip fuel as the reference.

#### Scenario: Actual fuel captured on close

- **WHEN** a flight is closed with an actual-fuel-burned value
- **THEN** the flight records the actual fuel burned
- **AND** a delta against the planned trip fuel is available

#### Scenario: Closing without actual fuel is allowed

- **WHEN** a flight is closed without an actual-fuel-burned value
- **THEN** the flight closes normally
- **AND** no actual fuel is recorded

#### Scenario: Planned figures shown as reference

- **WHEN** the close-out is presented for a flight with a fuel breakdown
- **THEN** the planned trip fuel is available as the reference figure
