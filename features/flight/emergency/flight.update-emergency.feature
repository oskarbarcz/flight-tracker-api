Feature: Update an active flight emergency

  Scenario: As an admin I cannot update an emergency
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a" with body:
      """json
      { "threatLevel": "critical" }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      }
      """

  Scenario: As an operations I cannot update an emergency
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a" with body:
      """json
      { "threatLevel": "critical" }
      """
    Then the response status should be 403

  Scenario: As a cabin crew I can update an active emergency
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "critical",
        "squawk": "7700",
        "intention": "immediate-landing",
        "lastKnownPosition": { "longitude": 5.123, "latitude": 49.001 },
        "fuelEnduranceMinutes": 25,
        "freeText": "Second generator failed, switching to battery — request immediate landing."
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a",
          "urgency": "mayday",
          "threatLevel": "critical",
          "category": "ata-24-electrical-power",
          "squawk": "7700",
          "intention": "immediate-landing",
          "lastKnownPosition": { "longitude": 5.123, "latitude": 49.001 },
          "soulsOnBoard": 182,
          "fuelEnduranceMinutes": 25,
          "dangerousGoodsOnBoard": ["class-9-miscellaneous"],
          "freeText": "Second generator failed, switching to battery — request immediate landing.",
          "declarationTime": "2025-01-01T10:15:00.000Z",
          "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "resolvedAt": null,
          "resolvedBy": null
        }
      ]
      """
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "2f1d6c47-4e0b-4a51-86c1-9be07f4a2c10",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T06:00:00.000Z"
        },
        {
          "id": "5a3e7811-2c4f-4a82-9c11-7b9e2d8c4f50",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T06:10:00.000Z"
        },
        {
          "id": "7e1f9b22-3d5a-4b81-9e2d-1c4f8a3e6b71",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T06:20:00.000Z"
        },
        {
          "id": "9c2a4d33-5e6b-4f72-9a3c-2d5e7b8c1f43",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T08:30:00.000Z"
        },
        {
          "id": "0d3b5e44-6f7c-4083-9b4d-3e6f8c9d2a54",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:00:00.000Z"
        },
        {
          "id": "1e4c6f55-708d-4194-9c5e-4f709d0e3b65",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:25:00.000Z"
        },
        {
          "id": "2f5d7066-819e-42a5-8d6f-50819e1f4c76",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:35:00.000Z"
        },
        {
          "id": "3a6e8177-92af-43b6-8e70-619a2f0d5d87",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:55:00.000Z"
        },
        {
          "id": "4b7f9288-a3b0-44c7-8f81-72ab3a1e6e98",
          "scope": "user",
          "type": "flight.emergency-declared",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T10:15:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.emergency-updated",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update an emergency that does not exist
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/11111111-1111-4111-8111-111111111111" with body:
      """json
      { "threatLevel": "high" }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Emergency with given id was not declared for this flight."
      }
      """

  Scenario: As a cabin crew I cannot update an emergency that has been resolved
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 204
    When I send a "PATCH" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a" with body:
      """json
      { "threatLevel": "critical" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Entity",
        "message": "This emergency has already been resolved."
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot update an emergency
    When I send a "PATCH" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a" with body:
      """json
      { "threatLevel": "critical" }
      """
    Then the response status should be 401
