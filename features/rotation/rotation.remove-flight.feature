Feature: Remove flights from rotation

  Scenario: As admin I cannot remove a flight from a rotation
    Given I use seed data
    And I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can remove a flight from a rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 204
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
        "updatedAt": "@date('within 1 minute from now')"
      }
      """

  Scenario: As cabin crew I cannot remove a flight from a rotation
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot remove a flight in non-created status from a rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/48760636-9520-4863-b32f-f3618556feb7"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Only flights in \"created\" status can be removed from a rotation",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot remove a non-existent flight from a rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/9303a459-72f0-453a-ac3e-54e6eff5a29a"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot remove a flight from a non-existent rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/49c8e76d-eccc-44b0-accb-4f0822c4c311/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot remove a flight from a rotation
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
