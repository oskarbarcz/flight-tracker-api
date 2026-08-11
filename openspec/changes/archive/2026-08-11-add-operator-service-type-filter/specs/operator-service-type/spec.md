## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Operators can be listed by the traffic they carry

The system SHALL accept an optional `serviceType` parameter on the operator list, whose value is one of `passenger`, `cargo`, or `both`, and SHALL return only the operators carrying that traffic, applying the traffic-category membership rule. A value that is none of the three SHALL be rejected with status `400` and a violation naming the parameter and listing the accepted values. Omitting the parameter SHALL return the unfiltered list, unchanged in content and ordering.

A filtered list SHALL carry the same operator body as the unfiltered list, and SHALL preserve the unfiltered list's relative ordering.

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
