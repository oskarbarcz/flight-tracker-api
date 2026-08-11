## MODIFIED Requirements

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
