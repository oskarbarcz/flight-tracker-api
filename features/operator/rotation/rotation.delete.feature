Feature: Delete rotation

  Scenario: As admin I cannot delete a rotation
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
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
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    And I set database to initial state

  Scenario: As cabin crew I cannot delete a rotation
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
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
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/4dbf997d-8d51-421e-b7df-fc69dd31f7c6"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete rotation that operator does not exist
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/0e37fd75-141d-4f01-b040-bcde2f7be839/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Operator with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete rotation with incorrect ID
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot delete rotation with incorrect operator ID
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/incorrect-uuid/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As unauthorized user I cannot remove rotation
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation/bd8f2d64-a647-42da-be63-c6589915e6c9"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
