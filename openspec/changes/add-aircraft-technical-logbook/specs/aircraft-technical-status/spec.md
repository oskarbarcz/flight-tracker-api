## ADDED Requirements

### Requirement: Derive aircraft serviceability and effective ETOPS

The system SHALL derive an aircraft's technical status from its confirmed, open defects
and its ETOPS threshold. Only defects with status `confirmed` SHALL affect the derivation;
`reported` defects SHALL be surfaced as pending review with no computed effect, and
`rejected`/`resolved` defects SHALL have no effect. The aircraft SHALL be considered not
serviceable when any open confirmed defect is classified `grounded`. The effective ETOPS
threshold SHALL be `NULL` when the aircraft is not certified, is not serviceable, or has
any open confirmed `etops_prohibited` defect; otherwise it SHALL be the minimum of the
certified threshold and every open confirmed `etops_limit` value (most-restrictive wins).
The aircraft SHALL be ETOPS-ready when its effective threshold is non-null.

#### Scenario: No open confirmed defects

- **WHEN** an aircraft certified to 180 minutes has no open confirmed defects
- **THEN** it is serviceable
- **AND** its effective ETOPS threshold is 180
- **AND** it is ETOPS-ready

#### Scenario: Most-restrictive limit wins

- **WHEN** an aircraft has two open confirmed `etops_limit` defects, one limiting to 75 and one to 60
- **THEN** its effective ETOPS threshold is 60

#### Scenario: ETOPS prohibited

- **WHEN** an aircraft has an open confirmed `etops_prohibited` defect
- **THEN** its effective ETOPS threshold is `NULL`
- **AND** it is not ETOPS-ready

#### Scenario: Grounded aircraft

- **WHEN** an aircraft has an open confirmed `grounded` defect
- **THEN** it is not serviceable
- **AND** it is not ETOPS-ready

#### Scenario: Reported-but-untriaged defect has no effect

- **WHEN** an aircraft has only a `reported` (unconfirmed) defect
- **THEN** the defect is shown as pending review
- **AND** the aircraft remains serviceable with its certified effective ETOPS threshold

### Requirement: Expose the technical status view

The system SHALL expose an aircraft's technical status combining serviceability,
ETOPS-readiness and effective threshold, the TTSN utilization (flight minutes, block
minutes, cycles), and a summary of open defects. All of this is informational.

#### Scenario: Technical status is retrievable

- **WHEN** an authenticated user requests an aircraft's technical status
- **THEN** the response includes serviceability, effective ETOPS, TTSN utilization, and open-defect summary

### Requirement: Chronological logbook feed

The system SHALL expose a chronological logbook feed for an aircraft that unites its
defect events, repositions, and completed sectors, ordered most-recent first. The feed
SHALL be a read-time union and SHALL NOT require a dedicated log storage table.

#### Scenario: Feed unites sources in order

- **WHEN** a user requests an aircraft's logbook feed
- **THEN** the feed contains its defects, repositions, and completed sectors
- **AND** entries are ordered from most recent to oldest
