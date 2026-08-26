## ADDED Requirements

### Requirement: An airport's country is always a country code

The system SHALL record an airport's country as its ISO 3166-1 alpha-2 code, identically for an
airport curated by hand and for one obtained from the external airport data provider. Where the
provider reports the country as a code, the system SHALL store that code as given rather than
resolving it to a name, so that no airport record ever carries a country name in place of a code.

#### Scenario: An imported airport records a country code

- **WHEN** an airport is imported from the external provider and the provider reports its country as the two-letter code `GB`
- **THEN** the stored airport's country is `GB`

#### Scenario: A provider lookup reports a country code

- **WHEN** an operations user looks an airport up through the external provider and the provider reports its country as the two-letter code `GB`
- **THEN** the response reports the country code as `GB`

#### Scenario: Imported and curated airports agree

- **WHEN** a response contains both a hand-curated airport and one imported from the provider
- **THEN** the country of each is an alpha-2 code, in the same form

### Requirement: An airport reports its country as a code and a name

The system SHALL report an airport's country as both its alpha-2 code and the catalogue name for
that code, wherever an airport is exposed — the airport list, a single airport, and the airports
embedded in other resources such as flights, aircraft, diversions and statistics — so that a caller
can group on the code and display the name without a second lookup. The name SHALL be resolved from
the country catalogue at read time and SHALL NOT be stored on the airport.

#### Scenario: A listed airport reports both

- **WHEN** a caller lists airports
- **THEN** each airport reports its country as the code and the catalogue name together, such as `DE` and `Germany`

#### Scenario: An embedded airport reports both

- **WHEN** a caller reads a resource that embeds an airport, such as a flight or an aircraft
- **THEN** the embedded airport reports its country as the code and the catalogue name together

#### Scenario: A renamed country needs no airport change

- **GIVEN** airports recording the country code `US`
- **WHEN** the catalogue name for `US` changes
- **THEN** every airport reports the new name without any airport record being written

### Requirement: An airport's country must be a known country

The system SHALL accept as an airport's country only a code the country catalogue recognises, and
SHALL reject anything else — a full country name, a value of any other length, an unassigned code,
and a code in the ISO 3166-1 user-assigned ranges — with a validation error, leaving the airport
unchanged. The system SHALL accept the code in any letter case and record it in upper case.

#### Scenario: A country name is no longer accepted

- **WHEN** an operations user supplies `Germany` as an airport's country
- **THEN** the request is rejected with a validation error and the airport is unchanged

#### Scenario: An unassigned code is rejected

- **WHEN** an operations user supplies the country `QQ`, which is not an assigned country code
- **THEN** the request is rejected with a validation error and no airport records `QQ`

#### Scenario: A user-assigned placeholder code is rejected

- **WHEN** a country value of `ZZ`, `XA`, `AA` or `QZ` is supplied for an airport
- **THEN** the request is rejected rather than recorded

#### Scenario: Letter case does not matter

- **WHEN** an operations user supplies `de` as an airport's country
- **THEN** the airport records `DE`

#### Scenario: An import carrying an unusable country fails loudly

- **WHEN** an airport is imported from the external provider and the provider reports a country the catalogue does not recognise
- **THEN** the import fails with an error naming the unrecognised value rather than storing it

## REMOVED Requirements

### Requirement: An airport's country is always a country name

**Reason**: Reversed. Storing the country as prose made it unusable as an identifier — it could not
be grouped, joined or matched reliably, a client could not derive a flag from it, and the alpha-2
code the external provider already supplies was discarded on the way in. The country is now stored
as that code and the name is resolved from the country catalogue at read time.

**Migration**: Existing airports have their country name mapped to its alpha-2 code by a data
migration, which fails rather than write a row it cannot map. API consumers reading a bare country
name now receive both a code and a name; the country catalogue endpoint publishes the full mapping.

### Requirement: Country resolution never invents a country

**Reason**: There is no longer a resolution step to constrain — the provider's code is stored
directly. The rule it protected, that ISO 3166-1 user-assigned codes are placeholders rather than
countries, now lives in the country catalogue and in the validation of an airport's country, where
such a value is rejected outright instead of being passed through untouched.

**Migration**: None. A value that would previously have been kept as-is is now refused at the point
an airport is created, updated or imported.
