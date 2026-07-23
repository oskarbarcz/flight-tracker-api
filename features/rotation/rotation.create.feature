Feature: Create rotation

  Scenario: As operations I create a rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "name": "FRA-JFK-FRA 2025-01-05",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "name": "FRA-JFK-FRA 2025-01-05",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "draft",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": null,
        "createdAt": "@date('within 1 minute from now')",
        "updatedAt": null,
        "legs": []
      }
      """
    And I set database to initial state

  Scenario: As an admin I cannot create a rotation
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f"
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

  Scenario: As a cabin crew I cannot create a rotation
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f"
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

  Scenario: Unauthenticated I cannot create a rotation
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation" with body:
      """json
      {
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f"
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
