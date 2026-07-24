Feature: Remove rotation

  Scenario: As operations I can remove a draft rotation
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/8459dc04-4cf9-46ba-a16f-226e677940b8"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/rotation/8459dc04-4cf9-46ba-a16f-226e677940b8"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Rotation with given ID not found."
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot remove a rotation once it is ready
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "A rotation can only be removed while it is a draft."
      }
      """

  Scenario: Removing a rotation that does not exist returns not found
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/00000000-0000-4000-8000-000000000000"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Rotation with given ID not found."
      }
      """

  Scenario: As an admin I cannot remove a rotation
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot remove a rotation
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot remove a rotation
    When I send a "DELETE" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
