## MODIFIED Requirements

### Requirement: The operator list endpoint accepts a recentOnly filter

The system SHALL accept an optional `recentOnly` query parameter on `GET /api/v1/operator`, spelled as a single camelCase identifier so that the wire name and the property that receives it are the same name. When it is set to `true`, the endpoint SHALL respond with the caller's recent carrier list and nothing else — the response SHALL NOT include operators the caller has no involvement with, and SHALL NOT append the remaining operators after them. When the parameter is absent or set to `false`, the endpoint SHALL respond with the full operator list in its existing order.

The parameter SHALL accept only the literal values `true` and `false`. Any other value, including an empty one, SHALL be rejected with status `400` and a validation violation naming the parameter. A cached response SHALL NOT be served in place of that rejection.

The hyphenated spelling `recent-only` SHALL NOT be accepted. It is an unknown query parameter and SHALL be rejected with status `400` and a violation stating that the property should not exist, rather than being ignored in favour of an unfiltered response.

#### Scenario: Filter requests the recent carriers

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=true`
- **THEN** the response status is `200`
- **AND** the body contains at most four operators, being the caller's recent carriers, newest first

#### Scenario: Filter explicitly disabled

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=false`
- **THEN** the response status is `200`
- **AND** the body is the full operator list, identical to the response with no query parameter

#### Scenario: Filter omitted

- **WHEN** an authenticated user sends `GET /api/v1/operator`
- **THEN** the response status is `200`
- **AND** the body is the full operator list, unchanged from before this capability existed

#### Scenario: Filter carries an unsupported value

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly=maybe`
- **THEN** the response status is `400` with a violation naming `recentOnly`

#### Scenario: Filter carries no value

- **WHEN** an authenticated user sends `GET /api/v1/operator?recentOnly`
- **THEN** the response status is `400` with a violation naming `recentOnly`

#### Scenario: Unsupported value after the list has been cached

- **WHEN** an authenticated user reads the full operator list, and then sends `GET /api/v1/operator?recentOnly=maybe`
- **THEN** the response status is `400`, and the cached list is not returned

#### Scenario: The hyphenated spelling is rejected

- **WHEN** an authenticated user sends `GET /api/v1/operator?recent-only=true`
- **THEN** the response status is `400` with a violation naming `recent-only` and stating the property should not exist
- **AND** no operator list is returned
