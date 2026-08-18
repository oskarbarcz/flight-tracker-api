## MODIFIED Requirements

### Requirement: The system sends transactional email to a user's address

The system SHALL be able to send a transactional email to a single recipient address with a subject and a plain-text body, sent from one configured sender address. Delivery SHALL go through the configured email provider. The sender identity and the message copy SHALL name the product as MyPreflight, so that a recipient recognises which product wrote to them.

#### Scenario: A message is dispatched to the recipient

- **WHEN** the system needs to notify a user by email
- **THEN** a message addressed to that user's email address, with the configured sender address, is dispatched to the email provider

#### Scenario: The message names the product

- **WHEN** a transactional email refers to the account it concerns
- **THEN** it names the product as MyPreflight
