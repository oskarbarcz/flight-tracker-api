Feature: As a user I can exchange a refresh token for fresh access and refresh tokens

  Scenario: As an admin I can refresh my session
    Given I hold a refresh token as "admin"
    When I send a "POST" request to "/api/v1/auth/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """
    And I set database to initial state

  Scenario: As operations I can refresh my session
    Given I hold a refresh token as "operations"
    When I send a "POST" request to "/api/v1/auth/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can refresh my session
    Given I hold a refresh token as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """
    And I set database to initial state

  Scenario: I cannot refresh using an access token
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/auth/refresh"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "statusCode": 401,
        "error": "Unauthorized",
        "message": "Cannot use access token for this request."
      }
      """
    And I set database to initial state

  Scenario: As an unauthenticated user I cannot refresh
    When I send a "POST" request to "/api/v1/auth/refresh"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
