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

#### Scenario: An unchanged tonnage changes nothing

- **GIVEN** a released flight whose final loadsheet reports the same cargo tonnage as its manifest
- **WHEN** boarding is finished
- **THEN** no shipment is added and none is offloaded

#### Scenario: An offload larger than the reduction is trimmed back to the tonnage

- **GIVEN** a released flight whose lower final tonnage is met by offloading freight weighing more than the reduction
- **WHEN** boarding is finished
- **THEN** the difference is made up with freight, so that no shipment which stays aboard has to be altered for the manifest to sum to the final tonnage

#### Scenario: The invariant holds after reconciliation

- **WHEN** a cargo manifest has been reconciled
- **THEN** the loaded shipment gross weights and unit tare weights equal the final loadsheet's cargo tonnage

#### Scenario: A higher final tonnage adds shipments

- **GIVEN** a flight whose cargo manifest carries less cargo than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** shipments are added until the loaded weight equals the final tonnage
