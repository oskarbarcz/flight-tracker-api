Feature: Add flight to rotation

  Scenario: As admin I cannot add a flight to a rotation
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can add a valid flight to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 204
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
            "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
            "flightNumber": "AA4907"
          },
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
        "updatedAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As cabin crew I cannot add a flight to a rotation
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 403

  Scenario: As operations I cannot add a flight that is already assigned to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "Flight is already assigned to rotation.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As operations I cannot add a flight in non-created status to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Flight is in incorrect state to be modify its rotation.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot add a non-existent flight to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/963ab4bd-1d3b-44e2-9c87-628a9c7197b8/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot add a flight with incorrect ID to a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/incorrect-uuid/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot add a flight to a non-existent rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/rotation/963ab4bd-1d3b-44e2-9c87-628a9c7197b8"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot add a flight to a rotation with incorrect rotation ID
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/rotation/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot add a flight to a rotation
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
