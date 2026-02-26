Feature: Create rotation for operator

  Scenario: As admin I cannot create a rotation
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "name": "LH-2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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

  Scenario: As operations I can create a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "name": "LH-2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "name": "LH-2025-01",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270"
        },
        "flights": [],
        "createdAt": "@date('within 1 minute from now')",
        "updatedAt": null
      }
      """
    And I set database to initial state

  Scenario: As cabin crew I cannot create a rotation
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "name": "LH-2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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

  Scenario: As an operations I cannot create a rotation without required fields
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "error": "Bad Request",
        "message": "Request validation failed.",
        "statusCode": 400,
        "violations": {
          "name": ["name should not be empty", "name must be a string"],
          "pilotId": ["pilotId should not be empty", "pilotId must be a UUID"]
        }
      }
      """

  Scenario: As operations I cannot create a rotation when pilot is not found
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "name": "2025-01",
        "pilotId": "cb715c36-ecfb-4dfc-8700-3c262b52abac"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "User with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot create rotation with non-existing operator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/rotation" with body:
      """json
      {
        "name": "LH-2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I cannot create rotation with incorrect uuid
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/incorrect-uuid/rotation" with body:
      """json
      {
        "name": "LH-2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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

  Scenario: As an unauthorized user I cannot create a rotation
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "name": "2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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
