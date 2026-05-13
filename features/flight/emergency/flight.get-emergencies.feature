Feature: List flight emergency declarations

  Scenario: As an admin I cannot list flight emergency declarations
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      }
      """

  Scenario: As an operations I can list emergency declarations for a flight that has one
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a",
          "urgency": "panpan",
          "threatLevel": "medium",
          "category": "ata-24-electrical-power",
          "squawk": "7700",
          "intention": "divert",
          "lastKnownPosition": { "longitude": 6.789, "latitude": 49.512 },
          "soulsOnBoard": 182,
          "fuelEnduranceMinutes": 45,
          "dangerousGoodsOnBoard": ["class-9-miscellaneous"],
          "freeText": "Generator #1 offline, running on APU and remaining bus. Requesting priority handling, divert intended.",
          "declarationTime": "2025-01-01T10:15:00.000Z",
          "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "resolvedAt": null,
          "resolvedBy": null
        }
      ]
      """

  Scenario: As a cabin crew I can list emergency declarations for a flight that has one
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a",
          "urgency": "panpan",
          "threatLevel": "medium",
          "category": "ata-24-electrical-power",
          "squawk": "7700",
          "intention": "divert",
          "lastKnownPosition": { "longitude": 6.789, "latitude": 49.512 },
          "soulsOnBoard": 182,
          "fuelEnduranceMinutes": 45,
          "dangerousGoodsOnBoard": ["class-9-miscellaneous"],
          "freeText": "Generator #1 offline, running on APU and remaining bus. Requesting priority handling, divert intended.",
          "declarationTime": "2025-01-01T10:15:00.000Z",
          "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "resolvedAt": null,
          "resolvedBy": null
        }
      ]
      """

  Scenario: As a cabin crew I get an empty list for a flight with no emergencies
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/emergency"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As an unauthorized user I cannot list emergency declarations
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency"
    Then the response status should be 401
