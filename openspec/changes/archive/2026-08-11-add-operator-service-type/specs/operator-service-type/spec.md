## Purpose

Records what an operator carries — passengers, freight, or both — so that clients can distinguish freight carriers from passenger airlines. The classification is descriptive metadata only; no backend behaviour is derived from it.

## ADDED Requirements

### Requirement: Operator service type classification

The system SHALL classify every operator as carrying `passenger` traffic, `cargo` traffic, or `both`, and SHALL treat `passenger` as the value for any operator whose service type was never specified. No other values are accepted.

The classification MUST NOT influence any other backend behaviour: fleet aggregation, crew composition rules, flight creation, rotation planning, and statistics accrual behave identically for every value.

#### Scenario: Operator created without a service type

- **WHEN** an operator is created and no service type is supplied
- **THEN** the operator is classified as `passenger`

#### Scenario: Operator created as a freight carrier

- **WHEN** an operator is created with service type `cargo`
- **THEN** the operator is classified as `cargo`

#### Scenario: Operator created as carrying both

- **WHEN** an operator is created with service type `both`
- **THEN** the operator is classified as `both`

#### Scenario: Operator created with an unsupported service type

- **WHEN** an operator is created with a service type other than `passenger`, `cargo`, or `both`
- **THEN** the request is rejected with status `400` and a validation violation naming the service type field and the accepted values
- **AND** no operator is created

#### Scenario: Existing operators predate the classification

- **WHEN** operators that were created before this capability existed are read
- **THEN** each is reported as carrying `passenger` traffic

#### Scenario: Service type carries no behavioural consequence

- **WHEN** an operator classified as `cargo` has aircraft assigned, flights created against it, and rotations planned for it
- **THEN** every validation and side effect is identical to those of an otherwise-equal `passenger` operator

### Requirement: Service type is independent of the commercial operator type

The system SHALL treat the service type as orthogonal to the operator's commercial type, and SHALL accept every combination of the two. The commercial type records the airline's business model; the service type records the traffic it carries. Neither value constrains, defaults from, or validates against the other.

#### Scenario: A low-cost carrier flying freight

- **WHEN** an operator is created with commercial type `low_cost` and service type `cargo`
- **THEN** the operator is accepted and reports both values as supplied

#### Scenario: Changing one value leaves the other alone

- **WHEN** an operator's service type is changed
- **THEN** its commercial type is unchanged

### Requirement: A carrier of both is a member of each traffic category

The system SHALL define `both` as carrying passenger traffic and freight traffic simultaneously, so a consumer selecting freight carriers MUST match operators classified as `cargo` or `both`, and a consumer selecting passenger carriers MUST match operators classified as `passenger` or `both`. The system SHALL NOT expose separate flags for the two traffic kinds.

#### Scenario: A carrier of both is reported as a single value

- **WHEN** an operator carrying passengers and freight is read
- **THEN** its service type is the single value `both`, not a pair of values or two independent flags

### Requirement: Service type is exposed in operator read models

The system SHALL include the service type in every response that carries a full operator body, using the field name `serviceType` with the literal value `passenger`, `cargo`, or `both`.

The abbreviated operator carried inside other resources' bodies — the identity projection embedded in flight and aircraft payloads — SHALL NOT gain the field, and SHALL keep exactly the fields it carries today.

#### Scenario: Reading a single operator

- **WHEN** an authenticated user requests `GET /api/v1/operator/{id}`
- **THEN** the response body includes `serviceType` with the operator's current classification

#### Scenario: Listing operators

- **WHEN** an authenticated user requests `GET /api/v1/operator`
- **THEN** every operator in the returned list includes `serviceType`

#### Scenario: Listing recent carriers

- **WHEN** an authenticated user requests the recent-carriers variant of the operator list
- **THEN** every operator in the returned list includes `serviceType`, matching the field set of the unfiltered list

#### Scenario: Responses returned by operator-mutating endpoints

- **WHEN** an endpoint that returns an operator body responds — operator creation or an operator update
- **THEN** the returned operator body includes `serviceType`

#### Scenario: Operator embedded in a flight or aircraft body

- **WHEN** an authenticated user reads a flight or an aircraft whose body embeds its operator
- **THEN** the embedded operator carries only its identifying fields and does not include `serviceType`

### Requirement: Operations set and change an operator's service type

The system SHALL accept `serviceType` when an operator is created and when an operator is updated through the existing operator update endpoint, and SHALL report the stored value in the body it returns. The service type SHALL remain changeable for the operator's whole lifetime — there is no point at which the value becomes frozen.

An update body that omits the service type SHALL leave the stored value unchanged.

#### Scenario: Operations change an operator's service type

- **WHEN** a user with the `operations` role updates an operator with `serviceType` set to `cargo`
- **THEN** the response status is `200` and the returned body reports `serviceType` as `cargo`
- **AND** subsequently reading the operator reports `serviceType` as `cargo`

#### Scenario: Operations set the service type on creation

- **WHEN** a user with the `operations` role creates an operator with `serviceType` set to `cargo`
- **THEN** the response status is `201` and the returned body reports `serviceType` as `cargo`

#### Scenario: Update omitting the service type

- **WHEN** a user with the `operations` role updates an operator without supplying `serviceType`
- **THEN** the operator's service type is unchanged

#### Scenario: Unsupported service type value on update

- **WHEN** a user with the `operations` role updates an operator with a `serviceType` that is none of `passenger`, `cargo`, or `both`
- **THEN** the response status is `400` with a violation naming `serviceType` and listing the accepted values
- **AND** the operator's service type is unchanged

### Requirement: Writing a service type is restricted to the operations role

The system SHALL restrict setting and changing an operator's service type to users holding the `operations` role, matching the role gating already applied to operator creation and updates. Every other authenticated role — including `admin` — SHALL be rejected with `403`, and unauthenticated callers SHALL be rejected with `401`. Reading an operator's service type SHALL require only authentication, matching the existing operator read endpoints.

#### Scenario: Admin is rejected

- **WHEN** a user with the `admin` role attempts to change an operator's service type
- **THEN** the response status is `403`
- **AND** the operator's service type is unchanged

#### Scenario: Cabin crew is rejected

- **WHEN** a user with the `cabin crew` role attempts to change an operator's service type
- **THEN** the response status is `403`
- **AND** the operator's service type is unchanged

#### Scenario: Unauthenticated caller is rejected

- **WHEN** an unauthenticated caller attempts to change an operator's service type
- **THEN** the response status is `401`
- **AND** the operator's service type is unchanged

#### Scenario: Any authenticated role can read the service type

- **WHEN** a user with the `admin`, `operations`, or `cabin crew` role requests `GET /api/v1/operator/{id}`
- **THEN** the response status is `200` and the body includes `serviceType`
