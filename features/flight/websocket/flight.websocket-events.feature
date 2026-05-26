Feature: Subscribe to flight events over WebSocket

  Scenario: As a cabin crew I receive the history of a flight upon subscribing
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then I should receive flight event history within 2000ms
    And the received flight event history should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I stop receiving events after unsubscribing
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then I should receive flight event history within 2000ms
    When I unsubscribe from flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 200
    And I should not receive any live flight event within 500ms
    And I set database to initial state

  Scenario: As an unauthenticated client I cannot open a WebSocket connection
    Given I open a WebSocket connection as "no-token"
    Then the WebSocket connection should be rejected within 2000ms

  Scenario: As a client with an invalid token I cannot open a WebSocket connection
    Given I open a WebSocket connection as "invalid-token"
    Then the WebSocket connection should be rejected within 2000ms

  Scenario: As an admin I cannot open a WebSocket connection
    Given I open a WebSocket connection as "admin"
    Then the WebSocket connection should be rejected within 2000ms
