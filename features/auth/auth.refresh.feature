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

  Scenario: I cannot refresh a session that no longer exists
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MjFhYjcwNS04NjA4LTQzODYtODZiNC0yZjM5MWEzNjU1YTciLCJzZXNzaW9uIjoiMTExMTExMTEtMjIyMi00MzMzLTg0NDQtNTU1NTU1NTU1NTU1IiwibmFtZSI6IkFsaWNlIERvZSIsImVtYWlsIjoib3BlcmF0aW9uc0BleGFtcGxlLmNvbSIsInJvbGUiOiJvcGVyYXRpb25zIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODU0MTEzNzMsImV4cCI6MjEwMDc3MTM3M30.FXThmVkWqI6EObMFkG0SjoZq5LbAL4h0pm_mf5zxWVZl0-UxgFE1Y4scx983tFwsmV2AZwmVJkoY8p7AlSuvgg"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Session is no longer valid.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """

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
