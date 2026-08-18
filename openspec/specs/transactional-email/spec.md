# transactional-email Specification

## Purpose

Defines how the system delivers transactional email to users — addressing, failure
handling, and how sent messages are observable outside production — so that
features needing email do not each invent their own delivery rules.
## Requirements
### Requirement: The system sends transactional email to a user's address

The system SHALL be able to send a transactional email to a single recipient address with a subject and a plain-text body, sent from one configured sender address. Delivery SHALL go through the configured email provider. The sender identity and the message copy SHALL name the product as MyPreflight, so that a recipient recognises which product wrote to them.

#### Scenario: A message is dispatched to the recipient

- **WHEN** the system needs to notify a user by email
- **THEN** a message addressed to that user's email address, with the configured sender address, is dispatched to the email provider

#### Scenario: The message names the product

- **WHEN** a transactional email refers to the account it concerns
- **THEN** it names the product as MyPreflight

### Requirement: Email delivery never blocks or fails the triggering request

The system SHALL dispatch transactional email outside the request that triggered
it, so that the HTTP response does not wait on the email provider. A delivery
failure SHALL be logged and SHALL NOT change the outcome reported to the caller of
the triggering request.

#### Scenario: A slow provider does not delay the response

- **WHEN** a user performs an action that triggers an email
- **THEN** the response is returned without waiting for the email provider to accept the message

#### Scenario: A provider outage does not surface as a request failure

- **WHEN** the email provider rejects or times out on a message
- **THEN** the failure is logged and the action that triggered the email is still reported as having succeeded

#### Scenario: One failed message does not suppress the others of the same action

- **WHEN** an action sends more than one message and the provider fails on one of them
- **THEN** the remaining messages are still dispatched

### Requirement: Email is observable outside production

Outside production, the system SHALL record each outbound message to local storage
instead of contacting the email provider, so that development and automated tests
can read what would have been sent. In production the system SHALL contact the
provider and SHALL NOT write messages to local storage.

#### Scenario: A message is recorded locally in a test environment

- **WHEN** the system sends an email while not running in production
- **THEN** the message's recipient, subject, and body are recorded locally and no request is made to the email provider

#### Scenario: Repeated messages to one recipient are recorded separately

- **WHEN** the system sends two messages of the same kind to the same recipient while not running in production
- **THEN** both are recorded, so that a suppressed send is distinguishable from a repeated one

#### Scenario: Production delivers through the provider

- **WHEN** the system sends an email while running in production
- **THEN** the message is submitted to the email provider

### Requirement: Email content is not logged in full

The system SHALL NOT write the body of a transactional email to the application
log at normal log levels, so that secrets carried in email — such as one-time links
— do not leak into log aggregation.

#### Scenario: A dispatched message is logged without its body

- **WHEN** the system dispatches a transactional email
- **THEN** the log records that a message of that kind was sent to that recipient, without the body content

