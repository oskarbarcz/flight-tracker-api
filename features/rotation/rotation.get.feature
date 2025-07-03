Feature: Get rotation

  Scenario: As operations I can get one rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "GET" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
        "name": "2025-01",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

  Scenario: As admin I can get one rotation
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
        "name": "2025-01",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

  Scenario: As cabin crew I can get one rotation
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
        "name": "2025-01",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """
