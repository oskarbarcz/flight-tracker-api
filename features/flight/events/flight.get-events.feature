Feature: Get flight events

  Scenario: As an admin I cannot get flight events
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can get flight events
    Given I use seed data
    And I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight_created",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "preliminary_loadsheet_updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight_released",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:10:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I can get flight events
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight_created",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "preliminary_loadsheet_updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight_released",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:10:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I cannot get flight events for invalid flight if
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/invalid-flight-id/events"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As a cabin crew I cannot get flight events for non-existing flight
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/11b8dbbf-9e9e-4ea4-a36a-975ab117fc87/events"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given ID does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot get flight events
    Given I use seed data
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
