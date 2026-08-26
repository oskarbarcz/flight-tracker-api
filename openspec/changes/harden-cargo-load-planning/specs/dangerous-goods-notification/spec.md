## MODIFIED Requirements

### Requirement: A notification to captain is issued at each loadsheet stage

The system SHALL issue a notification to captain when a flight's preliminary loadsheet is written
and again when its final loadsheet is filled at the close of boarding, so that each stage of the
load has a notification describing it. Writing the preliminary loadsheet again SHALL reissue the
preliminary notification against the load it now describes, and SHALL clear any acknowledgement
the superseded notification carried, because a pilot cannot be held to a document that has since
changed. Creating a flight with a preliminary loadsheet — filled by hand or imported from a
SimBrief plan — SHALL issue the preliminary notification at creation, because creating it writes
that loadsheet. Releasing the flight to the pilot SHALL NOT issue anything.

#### Scenario: Writing the preliminary loadsheet issues the preliminary notification

- **WHEN** operations writes a flight's preliminary loadsheet
- **THEN** a preliminary notification to captain is issued describing the load

#### Scenario: Creating a flight with a loadsheet issues the notification

- **GIVEN** operations creating a flight whose body carries a preliminary loadsheet
- **WHEN** the flight is created
- **THEN** the flight reports that it carries a notification to captain

#### Scenario: Writing it again reissues the notification unacknowledged

- **GIVEN** a flight whose preliminary notification the captain has acknowledged
- **WHEN** operations writes the preliminary loadsheet again
- **THEN** the preliminary notification is reissued and carries no acknowledgement

#### Scenario: Finishing boarding issues the final notification

- **WHEN** the final loadsheet is filled at the close of boarding
- **THEN** a final notification to captain is issued


### Requirement: A notification is issued whether or not dangerous goods are carried

The system SHALL issue a notification to captain for every flight whose preliminary loadsheet has
been written, stating explicitly that no dangerous goods are loaded where none are, rather than
issuing nothing.

#### Scenario: A flight with no dangerous goods still has a notification

- **GIVEN** a flight carrying no dangerous goods
- **WHEN** its notification to captain is read
- **THEN** it is returned, stating that no dangerous goods are loaded

#### Scenario: A flight with no loadsheet has no notification

- **GIVEN** a flight whose preliminary loadsheet has never been written
- **WHEN** its notification to captain is read
- **THEN** the request reports that no notification has been issued yet
