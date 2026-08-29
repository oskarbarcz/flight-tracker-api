## ADDED Requirements

### Requirement: Finishing boarding reconciles the cargo manifest against the final loadsheet

The system SHALL reconcile a flight's cargo manifest when boarding is finished, comparing the
final loadsheet's cargo tonnage against the manifest generated at release. Where the final
tonnage is lower, shipments SHALL be offloaded; where it is higher, shipments SHALL be added. The
reconciled manifest SHALL again sum exactly to the final loadsheet's cargo tonnage.

#### Scenario: A lower final tonnage offloads shipments

- **GIVEN** a released flight whose cargo manifest carries more cargo than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** shipments are offloaded until the loaded cargo equals the final tonnage

#### Scenario: A higher final tonnage adds shipments

- **GIVEN** a released flight whose cargo manifest carries less cargo than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** shipments are added until the loaded cargo equals the final tonnage

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

### Requirement: Reconciliation preserves the shipments that remain

The system SHALL leave the air waybill number, description, weight, piece count, journey and
position of every shipment that is neither added nor offloaded exactly as they were, so that
reconciliation changes the edges of a manifest and never regenerates it.

#### Scenario: Remaining shipments are untouched

- **GIVEN** a released flight with a generated cargo manifest
- **WHEN** boarding is finished with a different cargo tonnage
- **THEN** every shipment that is neither added nor offloaded keeps its air waybill number, weight, journey and position

### Requirement: Shipments are offloaded in ascending priority order

The system SHALL offload shipments in ascending order of the offload priority their commodity
declares, so that ordinary freight is shed before sensitive freight, and SHALL never offload a
shipment whose commodity declares that it may not be offloaded.

#### Scenario: Ordinary freight is shed first

- **GIVEN** a flight carrying both general cargo and pharmaceuticals
- **WHEN** boarding is finished with a lower cargo tonnage
- **THEN** the general cargo is offloaded before the pharmaceuticals

#### Scenario: The highest priority load is never offloaded

- **GIVEN** a flight carrying a shipment whose commodity may not be offloaded
- **WHEN** boarding is finished with a lower cargo tonnage
- **THEN** that shipment remains loaded

#### Scenario: A tonnage requiring the whole load to be shed is rejected

- **GIVEN** a flight whose final loadsheet reports a cargo tonnage below the weight of the shipments that may not be offloaded
- **WHEN** boarding is finished
- **THEN** the request is rejected as unprocessable

### Requirement: An offloaded shipment is retained with a reason

The system SHALL keep an offloaded shipment on the manifest, recording the reason it was
offloaded and the position it had been assigned, and SHALL NOT delete it. A shipment's status
SHALL be one of loaded or offloaded, and the manifest SHALL be filterable by status.

#### Scenario: Offloaded shipments are listed separately

- **GIVEN** a flight whose reconciliation offloaded shipments
- **WHEN** the cargo manifest is read filtered to offloaded shipments
- **THEN** only offloaded shipments are returned, each with its reason and the position it had been assigned

#### Scenario: Loaded shipments are listed separately

- **WHEN** the cargo manifest is read filtered to loaded shipments
- **THEN** no offloaded shipment is returned

#### Scenario: The unfiltered manifest holds both

- **WHEN** the cargo manifest is read without a status filter
- **THEN** both loaded and offloaded shipments are returned, each reporting its status

#### Scenario: An offloaded shipment's position is freed

- **GIVEN** a flight whose reconciliation offloaded the only shipment in a load unit
- **WHEN** the cargo manifest is read
- **THEN** that unit no longer occupies a hold position

### Requirement: Reconciliation observes every rule generation observed

The system SHALL apply to added shipments every rule applied at generation, including the
cargo-aircraft-only restriction, the segregation rules, the heated and ventilated compartment
requirements, the position compatibility rules and the compartment weight limits.

#### Scenario: An added shipment respects segregation

- **GIVEN** a released flight carrying live animals
- **WHEN** boarding is finished with a higher cargo tonnage
- **THEN** no dry ice shipment is added to the compartment holding the animals

#### Scenario: An added shipment respects compartment limits

- **WHEN** boarding is finished with a higher cargo tonnage
- **THEN** no compartment exceeds its maximum weight

### Requirement: A final cargo tonnage the hold cannot take is rejected

The system SHALL reject as unprocessable an attempt to finish boarding when the final loadsheet
reports more cargo than the aircraft's resolved hold variant can carry by weight or by volume.
The check SHALL apply only where the airframe type has curated hold data.

#### Scenario: An over-capacity final tonnage blocks boarding completion

- **GIVEN** a released flight whose aircraft's hold cannot take the final loadsheet's cargo
- **WHEN** boarding is finished
- **THEN** the request is rejected as unprocessable
- **AND** boarding is not finished

#### Scenario: A flight whose type has no hold data skips the check

- **GIVEN** a released flight whose aircraft's type has no curated hold data
- **WHEN** boarding is finished with any cargo tonnage
- **THEN** the request succeeds and the cargo manifest is reconciled without positions
