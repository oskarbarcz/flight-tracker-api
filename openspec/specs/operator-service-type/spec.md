# operator-service-type Specification

## Purpose

Records what an operator carries — passengers, freight, or both — so that clients can distinguish freight carriers from passenger airlines. The classification is descriptive metadata only; no backend behaviour is derived from it.

## Requirements

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

The system SHALL define `both` as carrying passenger traffic and freight traffic simultaneously, and SHALL itself apply that membership wherever it selects operators by the traffic they carry: selecting freight carriers SHALL return operators classified as `cargo` or `both`, and selecting passenger carriers SHALL return operators classified as `passenger` or `both`. Selecting carriers of both SHALL return only operators classified as `both`. The system SHALL NOT expose separate flags for the two traffic kinds, and SHALL NOT require a consumer to expand `both` itself.

#### Scenario: A carrier of both is reported as a single value

- **WHEN** an operator carrying passengers and freight is read
- **THEN** its service type is the single value `both`, not a pair of values or two independent flags

#### Scenario: Selecting freight carriers includes carriers of both

- **WHEN** operators carrying freight are selected
- **THEN** the result contains every operator classified as `cargo` and every operator classified as `both`
- **AND** contains no operator classified as `passenger`

#### Scenario: Selecting passenger carriers includes carriers of both

- **WHEN** operators carrying passengers are selected
- **THEN** the result contains every operator classified as `passenger` and every operator classified as `both`
- **AND** contains no operator classified as `cargo`

#### Scenario: Selecting carriers of both excludes single-traffic carriers

- **WHEN** operators carrying both are selected
- **THEN** the result contains only operators classified as `both`

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

### Requirement: Operators can be listed by the traffic they carry

The system SHALL accept an optional `serviceType` parameter on the operator list, spelled as a single camelCase identifier so that the wire name and the property that receives it are the same name, and whose value is one of `passenger`, `cargo`, or `both`. The system SHALL return only the operators carrying that traffic, applying the traffic-category membership rule. A value that is none of the three SHALL be rejected with status `400` and a violation naming the parameter and listing the accepted values. Omitting the parameter SHALL return the unfiltered list, unchanged in content and ordering.

A filtered list SHALL carry the same operator body as the unfiltered list, and SHALL preserve the unfiltered list's relative ordering.

The hyphenated spelling `service-type` SHALL NOT be accepted. It is an unknown query parameter and SHALL be rejected with status `400` and a violation stating that the property should not exist, rather than being ignored in favour of an unfiltered response.

#### Scenario: Listing the operators carrying freight

- **WHEN** an authenticated user requests the operator list filtered to `cargo`
- **THEN** the response status is `200` and the body contains every operator classified as `cargo` or `both`, in the order they appear in the unfiltered list

#### Scenario: Listing the operators carrying passengers

- **WHEN** an authenticated user requests the operator list filtered to `passenger`
- **THEN** the response status is `200` and the body contains every operator classified as `passenger` or `both`

#### Scenario: Listing only the operators carrying both

- **WHEN** an authenticated user requests the operator list filtered to `both`
- **THEN** the response status is `200` and the body contains only the operators classified as `both`

#### Scenario: Unsupported traffic kind

- **WHEN** an authenticated user requests the operator list with a traffic kind that is none of `passenger`, `cargo`, or `both`
- **THEN** the response status is `400` with a violation naming the `serviceType` parameter and listing the accepted values

#### Scenario: Filter omitted

- **WHEN** an authenticated user requests the operator list without the traffic filter
- **THEN** every operator is returned, as it was before the filter existed

#### Scenario: Filtered bodies match unfiltered bodies

- **WHEN** an operator appears in both a filtered and an unfiltered operator list
- **THEN** it carries exactly the same fields with the same values in each

#### Scenario: The hyphenated spelling is rejected

- **WHEN** an authenticated user sends `GET /api/v1/operator?service-type=cargo`
- **THEN** the response status is `400` with a violation naming `service-type` and stating the property should not exist
- **AND** no operator list is returned

### Requirement: Filtering the operator list requires only authentication

The system SHALL allow every authenticated role to filter the operator list by traffic, matching the access already granted to reading the operator list, and SHALL reject unauthenticated callers with `401`.

#### Scenario: Any authenticated role can filter

- **WHEN** a user with the `admin`, `operations`, or `cabin crew` role requests the operator list filtered by traffic
- **THEN** the response status is `200`

#### Scenario: Unauthenticated caller is rejected

- **WHEN** an unauthenticated caller requests the operator list filtered by traffic
- **THEN** the response status is `401`

### Requirement: The traffic filter narrows the recent carriers before they are capped

The system SHALL apply the traffic filter alongside the recent-carriers filter when both are supplied, and SHALL NOT let either filter override or silently ignore the other. The traffic filter SHALL be applied before the recent-carriers cap, so the cap counts only carriers matching the requested traffic: a carrier that the unfiltered recent list pushed past its limit SHALL appear when a traffic filter removes a higher-ranked carrier. The recency ordering SHALL be unaffected.

#### Scenario: A non-matching recent carrier is replaced, not merely dropped

- **GIVEN** a caller whose recent carriers, unfiltered, fill the cap and include a carrier that does not carry freight, and who has flown at least one further freight-carrying operator ranked below the cap
- **WHEN** that caller requests their recent carriers filtered to `cargo`
- **THEN** the non-matching carrier is absent
- **AND** the next matching carrier takes its place, so the cap is still filled

#### Scenario: Recency ordering survives the filter

- **WHEN** a caller requests their recent carriers filtered by traffic
- **THEN** the returned carriers are ordered newest first, as they are without the filter

#### Scenario: A caller with no matching recent carriers

- **WHEN** a caller whose recent carriers all fail the traffic filter requests them filtered
- **THEN** the response status is `200` and the body is an empty list

### Requirement: Traffic-filtered operator lists are not served from cache

The system SHALL evaluate every traffic-filtered operator list against current data rather than serving it from the operator list cache, and SHALL NOT share a cache entry between a filtered and an unfiltered list or between two different filter values. Requesting a filtered list SHALL NOT populate or evict the unfiltered list's cache entry, and the unfiltered list SHALL keep its existing caching behaviour unchanged.

Because a filtered request is never answered from cache, an unsupported filter value SHALL always reach request validation and be rejected, regardless of what has been requested before it.

#### Scenario: A filtered list reflects a change immediately

- **WHEN** an operator's service type is changed and the operator list is then requested with a traffic filter
- **THEN** the operator appears or disappears according to its new service type

#### Scenario: A filtered request does not answer an unfiltered one

- **WHEN** a traffic-filtered operator list is requested and the unfiltered list is requested afterwards
- **THEN** the unfiltered list contains every operator

#### Scenario: An unsupported value is rejected even after a successful request

- **WHEN** a valid traffic-filtered list is requested and an unsupported traffic kind is then requested
- **THEN** the second response status is `400`
