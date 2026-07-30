Feature: As a user I can change my own password

  Scenario: As operations I can change my own password
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
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
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
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
    And I set database to initial state

  Scenario: As an admin with a linked Google account I can still change my password
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "admin@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As a cabin crew I can change my own password
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario: I cannot change my password with a wrong current password
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "WrongP@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
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
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: I cannot reuse my current password as the new one
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "NeWsTr0nGP@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "New password must be different from the current one.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: I cannot set a new password that is too short
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "Sh0rt!P@1"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "newPassword": [
            "Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number and a symbol."
          ]
        }
      }
      """

  Scenario: I cannot set a long new password that has no uppercase, number or symbol
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "correcthorsebatterystaple"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "newPassword": [
            "Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number and a symbol."
          ]
        }
      }
      """

  Scenario: I cannot set a new password that is missing only a symbol
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGPassw0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "newPassword": [
            "Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number and a symbol."
          ]
        }
      }
      """

  Scenario: I cannot change my password without providing both passwords
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "currentPassword": [
            "currentPassword must be a string",
            "currentPassword should not be empty"
          ],
          "newPassword": [
            "Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number and a symbol.",
            "newPassword must be a string",
            "newPassword should not be empty"
          ]
        }
      }
      """

  Scenario: Changing my password revokes my other sessions
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MjFhYjcwNS04NjA4LTQzODYtODZiNC0yZjM5MWEzNjU1YTciLCJzZXNzaW9uIjoiNjRhNWVmOTAtMzk5YS00Y2U1LThlZTMtNDFjNjcwN2QwZTY4IiwibmFtZSI6IkFsaWNlIERvZSIsImVtYWlsIjoib3BlcmF0aW9uc0BleGFtcGxlLmNvbSIsInJvbGUiOiJvcGVyYXRpb25zIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODU0MTEyODcsImV4cCI6MjEwMDc3MTI4N30.6FVaO4yEd7qytJ4mcj1ioAaNZ2eef9kX8H57JAm54oz8Wk5uDpJE6xydNny4nQSJSws8drKPbUJJ6fHrkkjXLA"
    Then the response status should be 200
    And I set database to initial state
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MjFhYjcwNS04NjA4LTQzODYtODZiNC0yZjM5MWEzNjU1YTciLCJzZXNzaW9uIjoiNjRhNWVmOTAtMzk5YS00Y2U1LThlZTMtNDFjNjcwN2QwZTY4IiwibmFtZSI6IkFsaWNlIERvZSIsImVtYWlsIjoib3BlcmF0aW9uc0BleGFtcGxlLmNvbSIsInJvbGUiOiJvcGVyYXRpb25zIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODU0MTEyODcsImV4cCI6MjEwMDc3MTI4N30.6FVaO4yEd7qytJ4mcj1ioAaNZ2eef9kX8H57JAm54oz8Wk5uDpJE6xydNny4nQSJSws8drKPbUJJ6fHrkkjXLA"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Session is no longer valid.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot change a password
    When I send a "PATCH" request to "/api/v1/auth/password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
