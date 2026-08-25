## Purpose

Defines what the published OpenAPI document must say about the values the API serves, so that a
client can learn the full set a field may hold and the type a nullable field carries without
reading the source or guessing from observed traffic.

## ADDED Requirements

### Requirement: A value drawn from a closed set is published as that set

The published API document SHALL describe every response field whose values come from a set the
system controls — special handling codes, commodity identifiers, hold variant identifiers and
the like — as an enumeration of that set, rather than as an unconstrained string. Where the
field is an array, the enumeration SHALL describe its items.

#### Scenario: A code field publishes its vocabulary

- **WHEN** the API document is read
- **THEN** a field carrying special handling codes lists every code that may be served

#### Scenario: A catalogue identifier publishes its catalogue

- **WHEN** the API document is read
- **THEN** a field carrying a commodity identifier lists every identifier that may be served

#### Scenario: Free text is not constrained

- **WHEN** the API document is read
- **THEN** a field carrying a shipper name, a description or an air waybill number is described as an unconstrained string, because its values are not drawn from a set

### Requirement: A nullable value is published with its type

The published API document SHALL describe every nullable response field with the type it carries
when it is not null. No field whose value is a string, number, boolean or date SHALL be
published as an untyped object.

#### Scenario: A nullable number publishes as a number

- **GIVEN** a field that carries a number or null
- **WHEN** the API document is read
- **THEN** it is described as a nullable number

#### Scenario: A nullable structured value publishes its shape

- **GIVEN** a field that carries a structured value or null
- **WHEN** the API document is read
- **THEN** it is described by a named schema rather than as an untyped object

#### Scenario: No response field is published as an untyped object

- **WHEN** the API document is read
- **THEN** no response property is described as an object with neither properties nor a schema reference
