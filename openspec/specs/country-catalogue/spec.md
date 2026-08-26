# country-catalogue

## Purpose

Holds the single set of countries the system recognises — the ISO 3166-1 alpha-2 code that
identifies each one, the English name and flag used to display it, and the continent it sits on —
so that country is stored and matched as an identifier everywhere and rendered from one place.

## Requirements

### Requirement: A country is identified by its alpha-2 code

The system SHALL identify every country by its ISO 3166-1 alpha-2 code, and SHALL treat that code
as the value stored, compared and matched on wherever a country is recorded. A country's English
name, flag and continent SHALL be presentation attached to the code by the catalogue, never values
recorded alongside it.

#### Scenario: A country is recorded by code

- **WHEN** a record holds the country Germany
- **THEN** the stored value is `DE`

#### Scenario: Two records in the same country compare equal

- **GIVEN** two airports in the United States, one curated by hand and one imported from the external provider
- **WHEN** their countries are compared
- **THEN** they are equal, because both hold `US`

### Requirement: The catalogue is published

The system SHALL expose the full catalogue of recognised countries to any authenticated caller, each
entry reporting its alpha-2 code, English name, flag and continent, so that a client can render a
country from a code without carrying its own list.

#### Scenario: A caller reads the catalogue

- **WHEN** an authenticated caller reads the country catalogue
- **THEN** the response lists every recognised country with its code, name, flag and continent

#### Scenario: Germany is reported in full

- **WHEN** an authenticated caller reads the country catalogue
- **THEN** the entry for `DE` reports the name `Germany`, the flag `🇩🇪` and the continent `europe`

#### Scenario: Any authenticated role may read the catalogue

- **WHEN** a cabin crew user reads the country catalogue
- **THEN** the request succeeds, because the catalogue is reference data and not privileged

#### Scenario: An unauthenticated caller cannot read the catalogue

- **WHEN** a request for the country catalogue carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: The catalogue is fixed reference data

The system SHALL treat the catalogue as fixed reference data that no caller can create, change or
delete through the API, and SHALL report the same catalogue to every caller. The catalogue SHALL
name each country identically wherever that name is shown, so that one country never appears under
two spellings.

#### Scenario: The catalogue cannot be written

- **WHEN** a caller attempts to create, change or delete a catalogue entry
- **THEN** no such operation is offered

#### Scenario: The United States is named consistently

- **WHEN** the name of `US` is shown anywhere in the system
- **THEN** it is `United States of America`, matching the catalogue

### Requirement: A user-assigned code is not a country

The system SHALL NOT recognise the ISO 3166-1 user-assigned ranges — `AA`, `ZZ`, `QM` through `QZ`,
and `XA` through `XZ` — as countries, because they are placeholders reserved for private use whose
underlying reference data maps them to non-country labels. The catalogue SHALL contain no entry for
any of them, and any value in those ranges SHALL be rejected wherever a country is accepted.

#### Scenario: Placeholder codes are absent from the catalogue

- **WHEN** the catalogue is read
- **THEN** it contains no entry for `AA`, `ZZ`, `QZ` or `XA`

#### Scenario: A placeholder code is not a valid country

- **WHEN** a value of `ZZ`, `XA`, `AA` or `QZ` is supplied where a country is expected
- **THEN** it is rejected rather than recorded, and no placeholder label such as `Unknown Region` is stored in its place
