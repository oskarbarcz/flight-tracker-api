## MODIFIED Requirements

### Requirement: Finishing boarding reconciles the cargo manifest against the final loadsheet

The system SHALL reconcile a flight's cargo manifest when boarding is finished, comparing the
final loadsheet's cargo tonnage against the manifest generated from the preliminary loadsheet.
Where the final tonnage is lower, shipments SHALL be offloaded; where it is higher, shipments
SHALL be added. The reconciled manifest SHALL again sum exactly to the final loadsheet's cargo
tonnage.

#### Scenario: A lower final tonnage offloads shipments

- **GIVEN** a flight whose cargo manifest carries more cargo than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** shipments are offloaded until the loaded weight equals the final tonnage

#### Scenario: A higher final tonnage adds shipments

- **GIVEN** a flight whose cargo manifest carries less cargo than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** shipments are added until the loaded weight equals the final tonnage
