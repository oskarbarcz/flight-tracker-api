Feature: As a user I can send credentials and get JWT access token and JWT refresh token

  Scenario: As an admin I can sign out
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "admin@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/auth/sign-out"
    Then the response status should be 204

  Scenario: As operations I can sign out
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/auth/sign-out"
    Then the response status should be 204

  Scenario: As a cabin crew I can sign out
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "cabin-crew@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/sign-out"
    Then the response status should be 204

  Scenario: As unauthenticated user I cannot sign out
    Given I use seed data
    When I send a "POST" request to "/api/v1/auth/sign-out"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
