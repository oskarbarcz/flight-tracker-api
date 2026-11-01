Feature: As a user I can let a device sign in as me

  Scenario: As a cabin crew I let the Transponder sign in as me
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/approve"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "5Ltk0oBiQBtbdikMEOU0wj6cLnVpI3fP4KjzVXPPvr0"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_transponder_access_token",
        "refreshToken": "@jwt_transponder_refresh_token"
      }
      """
    And I set database to initial state

  Scenario: As an admin I let the Transponder sign in as me
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/auth/device/sfcd-nlvq/approve"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/auth/device/SFCD-NLVQ"
    Then the response status should be 404
    And I set database to initial state

  Scenario: As a cabin crew I cannot approve the same sign-in twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/approve"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/approve"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Device sign-in does not exist or has expired.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    And I set database to initial state

  Scenario Outline: As a cabin crew I cannot approve a sign-in that <case>
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/<userCode>/approve"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Device sign-in does not exist or has expired.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

    Examples:
      | case                 | userCode  |
      | does not exist       | BBBB-BBBB |
      | has expired          | XZFM-RQMB |
      | was already declined | NVMD-PBFN |

  Scenario: The Transponder cannot approve a device sign-in
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/approve"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "This action is not available to the Transponder.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot approve a device sign-in
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/approve"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
