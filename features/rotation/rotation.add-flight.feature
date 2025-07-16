Feature: Add flight to rotation

  Scenario: As admin I cannot add a flight to a rotation
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can add a flight in created status to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
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
        "flights": [
          {
            "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
            "flightNumber": "AA 4907"
          },
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
        "updatedAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As cabin crew I cannot add a flight to a rotation
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 403

  Scenario: As operations I cannot add a flight that is already assigned to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "Flight is already assigned to this rotation",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As operations I cannot add a flight in non-created status to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/05986dd3-ff01-4112-ad35-ecd85db05c77"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Only flights in \"created\" status can be assigned to a rotation",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot add a non-existent flight to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/963ab4bd-1d3b-44e2-9c87-628a9c7197b8"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot add a flight to a non-existent rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/963ab4bd-1d3b-44e2-9c87-628a9c7197b8/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot add a flight to a rotation
    When I send a "POST" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
