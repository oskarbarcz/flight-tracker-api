Feature: Delete rotation

  Scenario: As admin I cannot delete a rotation
    Given I use seed data
    And I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can delete a rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 204

  Scenario: As cabin crew I cannot delete a rotation
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot delete non-existing rotation
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/4dbf997d-8d51-421e-b7df-fc69dd31f7c6"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID does not exist",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete rotation with incorrect id
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/incorrect-id"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I remove a rotation
    When I send a "DELETE" request to "/api/v1/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
