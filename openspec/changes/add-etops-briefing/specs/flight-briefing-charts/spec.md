## ADDED Requirements

### Requirement: A flight snapshots the charts its plan publishes

When a flight is created from a SimBrief operational flight plan publishing chart images, the
system SHALL store each chart against that flight with the name the plan gives it and a
resolved address, preserving the order the plan lists them in. Addresses SHALL be resolved at
import from the plan's chart directory and the chart's own link, so that a reader needs no
knowledge of how the provider composes them.

#### Scenario: The plan's charts are stored

- **WHEN** a flight is created from a plan publishing a route chart, four significant weather charts, four upper wind charts and a vertical profile
- **THEN** the flight reports ten charts, each with the name the plan gives it

#### Scenario: Chart order is preserved

- **WHEN** a flight's charts are read
- **THEN** they are reported in the order the plan listed them

#### Scenario: Addresses are resolved at import

- **WHEN** a flight's charts are read
- **THEN** each reports a complete address requiring no further composition

### Requirement: The route chart is identifiable among the charts

The plan's route chart renders the ETOPS points, the range rings, the suitable airports, the
alternates and the oceanic track structure onto a single image. The system SHALL make that
chart identifiable among the flight's charts, so that a reader can show the complete ETOPS
picture without drawing it.

#### Scenario: The route chart is identifiable

- **WHEN** a flight's charts are read
- **THEN** the route chart is distinguishable from the weather and wind charts

#### Scenario: A plan without charts

- **WHEN** a flight is created from a plan publishing no charts
- **THEN** no charts are recorded and the import completes normally
