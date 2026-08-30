# dangerous-goods-notification

## Purpose

Issue a notification to captain at each loadsheet stage — one when the preliminary loadsheet is
written and one when
boarding finishes — reporting every dangerous goods shipment in full, the other notifiable
special loads, the emergency drill for what is aboard, the cold chain assessment and the load
summary. Covers acknowledgement through the requests the pilot already makes, the changes the
final notification reports against the preliminary one, the per-stage read endpoint, and filling
an emergency declaration's dangerous goods classes from the manifest.

## Requirements

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

### Requirement: The notification reports every dangerous goods shipment in full

The system SHALL report for each dangerous goods shipment its air waybill number, proper shipping
name, UN number, hazard class or division, subsidiary risk, packing group, number of packages, net
quantity per package, loading position, airport of unloading, whether it is restricted to cargo
aircraft, and its emergency response code.

#### Scenario: A dangerous goods entry is complete

- **WHEN** a notification carrying dangerous goods is read
- **THEN** each entry reports its air waybill number, proper shipping name, UN number, hazard class, package count, net quantity per package, loading position, airport of unloading, cargo aircraft restriction and emergency response code

#### Scenario: Dry ice quantity is totalled per compartment

- **GIVEN** a flight carrying dry ice
- **WHEN** its notification is read
- **THEN** the total dry ice quantity in each compartment is reported

### Requirement: The notification reports other notifiable loads

The system SHALL report, separately from dangerous goods, the other loads a captain must be told
about — at least live animals, human remains, temperature-controlled pharmaceuticals, valuables,
and heavy or outsized pieces — each with its special handling code, weight, loading position and
airport of unloading.

#### Scenario: Other special loads are reported

- **GIVEN** a flight carrying live animals and human remains
- **WHEN** its notification is read
- **THEN** both are reported with their special handling code, weight, loading position and airport of unloading

#### Scenario: A heavy piece reports its dimensions

- **GIVEN** a flight carrying an outsized shipment
- **WHEN** its notification is read
- **THEN** that entry reports the weight and dimensions of its largest piece

### Requirement: The notification carries the cold chain assessment and the load summary

The system SHALL include in the notification the cold chain assessment of every
temperature-controlled shipment, marked as advisory, and a summary of the load: the weight in
each compartment, the counts of containers, pallets and loose pieces, the total deadload, and the
shipments continuing beyond the arrival with the tightest connection among them.

#### Scenario: The cold chain assessment is carried and marked advisory

- **GIVEN** a flight carrying a temperature-controlled shipment
- **WHEN** its notification is read
- **THEN** the assessment is reported with its risk level and explanation, marked as advisory

#### Scenario: The load summary is carried

- **WHEN** a notification is read
- **THEN** it reports the weight per compartment, the unit counts, the total deadload and the tightest onward connection

### Requirement: The notification carries the emergency drill for what is aboard

The system SHALL report alongside each dangerous goods entry the drill its emergency response
code identifies — the inherent risk, the risk to the aircraft and its occupants, and the spill
and fire-fighting procedure — so that a crew dealing with an incident need not look the code up.

#### Scenario: A drill is reported with its entry

- **WHEN** a notification carrying dangerous goods is read
- **THEN** each entry reports the inherent risk, the risk to the aircraft and its occupants, and the spill and fire-fighting procedure its code identifies

### Requirement: The pilot acknowledges a notification through the action they already take

The system SHALL record the preliminary notification as acknowledged by the pilot who checks the
flight in, and the final notification as acknowledged by the pilot who finishes boarding, using
those existing requests. The system SHALL NOT expose any separate action for acknowledging a
notification, and SHALL NOT require any additional field on either request.

#### Scenario: Checking in acknowledges the preliminary notification

- **GIVEN** a released flight whose preliminary notification has been issued
- **WHEN** the pilot checks in
- **THEN** the preliminary notification records that pilot and the time as its acknowledgement

#### Scenario: Finishing boarding acknowledges the final notification

- **WHEN** boarding is finished
- **THEN** the final notification records the initiating pilot and the time as its acknowledgement

#### Scenario: An unacknowledged notification says so

- **GIVEN** a released flight whose pilot has not checked in
- **WHEN** its preliminary notification is read
- **THEN** it is reported as issued and not yet acknowledged

### Requirement: The final notification reports what changed

The system SHALL report on the final notification the differences between it and the preliminary
one — dangerous goods and other notifiable loads added or removed, shipments repositioned, and
the change in cargo tonnage and total deadload — so that a pilot who accepted the preliminary
document is shown only what is new.

#### Scenario: An added dangerous goods shipment is reported as a change

- **GIVEN** a flight whose reconciliation added a dangerous goods shipment
- **WHEN** its final notification is read
- **THEN** that shipment is reported as added since the preliminary notification

#### Scenario: An offloaded special load is reported as a change

- **GIVEN** a flight whose reconciliation offloaded live animals
- **WHEN** its final notification is read
- **THEN** that load is reported as removed since the preliminary notification

#### Scenario: An unchanged load reports no changes

- **GIVEN** a flight whose reconciliation changed nothing
- **WHEN** its final notification is read
- **THEN** it reports no changes since the preliminary notification

### Requirement: The notification is read through its own endpoint, per stage

The system SHALL expose a flight's notifications to captain through a dedicated endpoint,
selectable by stage and defaulting to the latest issued, permitting reading to operations and to
the flight's captain.

#### Scenario: The captain reads the notification

- **GIVEN** a released flight with a captain assigned
- **WHEN** that captain reads the notification to captain
- **THEN** the latest issued notification is returned

#### Scenario: A specific stage can be read

- **GIVEN** a flight whose boarding has finished
- **WHEN** the preliminary notification is requested explicitly
- **THEN** the preliminary notification is returned

#### Scenario: A pilot who does not command the flight is refused

- **GIVEN** a released flight captained by another pilot
- **WHEN** a pilot who is not its captain reads the notification
- **THEN** the request is rejected as forbidden

#### Scenario: Reading a notification requires authentication

- **WHEN** an unauthenticated request reads a notification to captain
- **THEN** the request is rejected as unauthorised

### Requirement: An emergency declaration reports the dangerous goods actually aboard

The system SHALL fill the dangerous goods classes of an emergency declaration from the flight's
cargo manifest where the declaring pilot supplies none, and SHALL keep an explicitly supplied
value unchanged, so that the declaration reflects the real load without preventing the pilot from
stating it themselves.

#### Scenario: An omitted value is filled from the manifest

- **GIVEN** a flight whose cargo manifest carries dangerous goods
- **WHEN** its captain declares an emergency without stating the dangerous goods classes
- **THEN** the declaration reports the classes the manifest carries

#### Scenario: An explicit value is preserved

- **WHEN** a captain declares an emergency stating the dangerous goods classes
- **THEN** the declaration reports exactly the stated classes

#### Scenario: A flight without dangerous goods reports none

- **GIVEN** a flight whose cargo manifest carries no dangerous goods
- **WHEN** its captain declares an emergency without stating the classes
- **THEN** the declaration reports no dangerous goods classes
