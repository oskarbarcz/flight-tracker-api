## ADDED Requirements

### Requirement: Curated grouped ATA-chapter taxonomy

The system SHALL provide a curated ATA-chapter taxonomy as reference data, organized in
two levels: a small set of high-level **categories**, each containing a list of
**sub-chapters** (the ATA chapter values). Every category SHALL include an `OTHER`
sub-chapter so a defect can always be filed even when no specific chapter fits. The
taxonomy SHALL be maintained as static reference data (mirroring the airframes reference
pattern), not as user-writable database rows.

#### Scenario: Reference data is grouped with sub-chapters

- **WHEN** the ATA taxonomy is loaded
- **THEN** it contains high-level categories
- **AND** each category contains one or more sub-chapter values
- **AND** each category contains an `OTHER` sub-chapter value

#### Scenario: Taxonomy is exposed for clients

- **WHEN** an authenticated user requests the ATA-chapter reference list
- **THEN** the response contains every category with its sub-chapters

### Requirement: Validate a defect's ATA classification against the taxonomy

The system SHALL validate that a reported defect's `ataCategory` exists in the taxonomy
and its `ataSubchapter` belongs to that category (including `OTHER`). A defect whose
category/sub-chapter pair is not present in the taxonomy SHALL be rejected.

#### Scenario: Valid category and sub-chapter

- **WHEN** a defect is filed with a category and one of that category's sub-chapters
- **THEN** the ATA classification is accepted

#### Scenario: Sub-chapter does not belong to the category

- **WHEN** a defect is filed with a sub-chapter that is not listed under the given category
- **THEN** the system rejects the request with a validation error
