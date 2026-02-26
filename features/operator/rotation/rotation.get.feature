Feature: Get rotation for operator

  Scenario: As admin I can get one rotation
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
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
            "flightNumber": "LH40"
          },
          {
            "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
            "flightNumber": "LH41"
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

  Scenario: As operations I can get one rotation
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
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
            "flightNumber": "LH40"
          },
          {
            "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
            "flightNumber": "LH41"
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

  Scenario: As cabin crew I can get one rotation
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
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
            "flightNumber": "LH40"
          },
          {
            "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
            "flightNumber": "LH41"
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null
      }
      """

  Scenario: Get rotation that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/892299aa-debe-4f2f-87d3-4cdd513da26c"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Get rotation from operator that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/0e37fd75-141d-4f01-b040-bcde2f7be839/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Operator with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Get rotation with incorrect rotation ID
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As a cabin crew I cannot get rotation with incorrect operator ID
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/incorrect-uuid/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot get one rotation
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
