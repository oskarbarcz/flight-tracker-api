## MODIFIED Requirements

### Requirement: Crew are imported from the SimBrief roster on flight creation

When a flight is created from SimBrief, the system SHALL import the flight's crew roster from the OFP `crew` object. It MUST import the first officer (`fo`), the purser (`pu`), and every flight attendant (`fa`). It MUST NOT import the captain (`cpt`, who is the live player) nor the dispatcher (`dx`, who is not aircraft crew). Because SimBrief serialises each field according to what the user filled in rather than to a schema, the system SHALL resolve a crew field to names whatever shape it arrives in: a text value yields that name trimmed, a list or a keyed object yields each of its entries resolved the same way, and any other value — including the empty object SimBrief sends for an unfilled field — yields no name. A blank or whitespace-only value SHALL yield no name, so that no crew member is imported for it. For the single-valued roles the system SHALL take the first name resolved.

#### Scenario: Roster is imported for the flight's operator

- **WHEN** a flight is created from a SimBrief OFP containing a crew roster
- **THEN** the `fo`, `pu`, and each `fa` entry are stored as crew of the flight's operator with the matching role

#### Scenario: Captain and dispatcher are excluded

- **WHEN** a SimBrief OFP is imported
- **THEN** no crew record is created for the `cpt` value
- **AND** no crew record is created for the `dx` value

#### Scenario: An unfilled crew field is not imported

- **WHEN** an imported plan reports a crew field as an empty object, which is how SimBrief renders a field the user left unfilled
- **THEN** no crew member is created for that field, and the rest of the roster imports normally

#### Scenario: A blank crew name is not imported

- **WHEN** an imported plan reports a crew field as an empty or whitespace-only name
- **THEN** no crew member is created for that field

#### Scenario: A single flight attendant reported outside a list

- **WHEN** an imported plan reports its only flight attendant as a bare text value rather than as a list of one
- **THEN** that flight attendant is imported

#### Scenario: Flight attendants reported as a keyed object

- **WHEN** an imported plan reports its flight attendants as an object keyed by position rather than as a list
- **THEN** every named entry of that object is imported

#### Scenario: Blank entries among the flight attendants

- **WHEN** an imported plan reports flight attendants of which some entries are blank or empty objects
- **THEN** only the named entries are imported

#### Scenario: A plan with no crew block

- **WHEN** an imported plan carries no crew object at all
- **THEN** the flight is created with no crew and the import completes normally

## ADDED Requirements

### Requirement: The flight's cabin crew count follows the imported roster

The system SHALL derive the cabin crew count recorded on a flight's preliminary loadsheet from the same resolved roster names it imports, counting the purser when one is named plus each named flight attendant. A field that yields no name SHALL NOT be counted, so that the count on the loadsheet always matches the crew imported for the flight.

#### Scenario: Count matches the imported crew

- **WHEN** a plan naming a purser and three flight attendants is imported
- **THEN** the flight's preliminary loadsheet records four cabin crew

#### Scenario: Unfilled fields are not counted

- **WHEN** a plan reports an unfilled purser field and two named flight attendants among entries that are blank
- **THEN** the flight's preliminary loadsheet records two cabin crew
