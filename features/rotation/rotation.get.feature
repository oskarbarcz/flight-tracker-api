Feature: Get rotation

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
        "flights": [
          {
            "id": "48760636-9520-4863-b32f-f3618556feb7",
            "flightNumber": "LH 40"
          },
          {
            "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
            "flightNumber": "LH 41"
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

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
        "flights": [
          {
            "id": "48760636-9520-4863-b32f-f3618556feb7",
            "flightNumber": "LH 40"
          },
          {
            "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
            "flightNumber": "LH 41"
          }
        ],
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
        "flights": [
          {
            "id": "48760636-9520-4863-b32f-f3618556feb7",
            "flightNumber": "LH 40"
          },
          {
            "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
            "flightNumber": "LH 41"
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

  Scenario: As an unauthorized user I cannot get one rotation
    When I send a "GET" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
