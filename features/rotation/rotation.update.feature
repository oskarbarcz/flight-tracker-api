Feature: Update rotation

  Scenario: As admin I cannot update a rotation
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9" with body:
      """json
      {
        "name": "New 2025-01"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can update a rotation
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9" with body:
      """json
      {
        "name": "New 2025-01"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
        "name": "New 2025-01",
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
        "updatedAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As cabin crew I cannot update a rotation
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9" with body:
      """json
      {
        "name": "New 2025-01"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot update a rotation with pilot that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9" with body:
      """json
      {
        "pilotId": "c4087663-f2c2-4acf-aa86-73417b15d54a"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Pilot with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update non-existing rotation
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/00fb8d16-9f33-4c60-9c86-9722390b16a1" with body:
      """json
      {
        "name": "New 2025-01"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update rotation with incorrect id
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/incorrect-id" with body:
      """json
      {
        "name": "New 2025-01"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot remove a rotation
    When I send a "PATCH" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9" with body:
      """json
      {
        "name": "New 2025-01"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
