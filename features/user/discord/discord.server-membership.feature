Feature: As a signed-in user I can check whether my Discord account is in the server

  Scenario: As a cabin crew with a linked Discord account membership is unresolved without a gateway
    Given I am signed in as "Michael Doe"
    When I send a "GET" request to "/api/v1/user/me/discord/server-membership"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "status": "unknown"
      }
      """

  Scenario: As operations with no linked Discord account membership cannot be determined
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me/discord/server-membership"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "status": "unknown"
      }
      """

  Scenario: As an admin I can check my own Discord server membership
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/discord/server-membership"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "status": "unknown"
      }
      """

  Scenario: As an unauthorized user I cannot check Discord server membership
    When I send a "GET" request to "/api/v1/user/me/discord/server-membership"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
