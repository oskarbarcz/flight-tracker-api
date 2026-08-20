# manifest-special-services

## Purpose

Flag the minority of manifest passengers who need special assistance, using IATA special
service request codes rather than invented labels. Covers how often a code is assigned, the
curated code set, the seat a coded passenger still occupies, and the code surviving boarding
reconciliation.

## Requirements

### Requirement: A minority of passengers carry a special service request

The system SHALL assign a special service request code to a minority of the passengers on a
generated manifest, leaving roughly 85% of them with none, so that a cabin view has something
to distinguish without every passenger becoming a special case. A passenger SHALL carry at
most one such code.

#### Scenario: Most passengers carry no code

- **WHEN** a manifest is generated for a full cabin
- **THEN** the large majority of passengers carry no special service code

#### Scenario: Some passengers carry a code

- **WHEN** a manifest is generated for a full cabin
- **THEN** a minority of passengers carry a special service code

#### Scenario: A passenger carries at most one code

- **WHEN** a manifest is read
- **THEN** no passenger reports more than one special service code

### Requirement: Special service codes are the industry's own

The system SHALL use IATA special service request codes rather than invented labels, drawn
from a curated set covering at least: an infant, the three wheelchair categories for ramp,
steps and cabin assistance, an unaccompanied minor, a blind passenger, a deaf passenger, a
passenger requiring meet-and-assist, and a passenger travelling with a pet in the cabin.

#### Scenario: A code is a recognised IATA code

- **WHEN** a manifest passenger carries a special service code
- **THEN** that code is one of the curated IATA special service request codes

#### Scenario: Codes are reported on the manifest

- **WHEN** the manifest is read
- **THEN** each passenger carrying a code reports it alongside their seat and name

### Requirement: A passenger requiring special service still occupies one seat

The system SHALL seat a passenger carrying a special service code exactly as any other
passenger, occupying one seat. In particular an infant SHALL occupy a seat rather than
travelling on another passenger's lap, so that the passenger count and the number of occupied
seats remain equal and seat capacity remains the only limit on a loadsheet.

#### Scenario: An infant occupies a seat

- **GIVEN** a generated manifest containing a passenger coded as an infant
- **WHEN** the manifest is read
- **THEN** that passenger occupies a seat of their own

#### Scenario: Occupied seats equal the passenger count

- **WHEN** a manifest is generated
- **THEN** the number of occupied seats equals the number of boarded passengers, whatever codes they carry

### Requirement: Special service codes survive reconciliation

The system SHALL leave the special service code of a passenger who remains on the manifest
unchanged when boarding is finished, and SHALL assign codes to newly generated passengers on
the same basis as at generation.

#### Scenario: A remaining passenger keeps their code

- **GIVEN** a released flight whose manifest contains passengers carrying special service codes
- **WHEN** boarding is finished with a different passenger count
- **THEN** every passenger who remains keeps the code they had

#### Scenario: Added passengers may carry codes

- **WHEN** reconciliation generates additional passengers
- **THEN** those passengers carry codes on the same basis as passengers generated at release
