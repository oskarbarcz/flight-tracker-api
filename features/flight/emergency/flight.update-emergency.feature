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
