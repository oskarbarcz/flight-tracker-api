Feature: As a user I can send credentials and get JWT access token and JWT refresh token

  Scenario: As an admin I can sign in with valid credentials
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "admin@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """

  Scenario: As operations I can sign in with valid credentials
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """

  Scenario: As a cabin crew I can sign in with valid credentials
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "cabin-crew@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """

  Scenario: As any user I cannot sign in with invalid credentials
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "admin@example.com",
        "password": "not-correct-password"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Credentials are incorrect.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As any user I cannot sign in with invalid credentials
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "non-existing-email@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Credentials are incorrect.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """
