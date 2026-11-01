Feature: As a user I can decline a device sign-in

  Scenario: As a cabin crew I decline a sign-in I did not start
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/deny"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "5Ltk0oBiQBtbdikMEOU0wj6cLnVpI3fP4KjzVXPPvr0"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Device sign-in was declined.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    And I set database to initial state

  Scenario: As an admin I decline a sign-in I did not start
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/deny"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/auth/device/SFCD-NLVQ"
    Then the response status should be 404
    And I set database to initial state

  Scenario Outline: As a cabin crew I cannot decline a sign-in that <case>
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/<userCode>/deny"
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
      | was already approved | ZBHG-BXCL |

  Scenario: The Transponder cannot decline a device sign-in
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/deny"
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

  Scenario: As an unauthorized user I cannot decline a device sign-in
    When I send a "POST" request to "/api/v1/auth/device/SFCD-NLVQ/deny"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
