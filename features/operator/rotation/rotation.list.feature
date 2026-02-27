Feature: List rotations for operator

  Scenario: As admin I can list rotations
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation"
    Then the response status should be 200

  Scenario: As operations I can list rotations
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation"
    Then the response status should be 200

  Scenario: As cabin crew I can list rotations
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation"
    Then the response status should be 200

  Scenario: As operations I cannot get rotation list for non-existing operator
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/rotation"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I cannot create rotation with incorrect operator ID
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/incorrect-uuid/rotation"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot list rotations
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/rotation"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
