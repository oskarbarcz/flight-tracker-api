Feature: Create rotation

  Scenario: As admin I cannot create a rotation
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/rotation" with body:
      """json
      {
        "name": "Afternoon Shift",
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
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation" with body:
      """json
      {
        "name": "2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "name": "2025-01",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "createdAt": "@date('within 1 minute from now')",
        "updatedAt": null
      }
      """

  Scenario: As cabin crew I cannot create a rotation
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/rotation" with body:
      """json
      {
        "name": "Night Shift",
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
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/" with body:
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
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation" with body:
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
        "message": "Pilot with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot create a rotation
    When I send a "POST" request to "/api/v1/rotation/" with body:
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
