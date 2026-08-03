Feature: As a user who forgot my password I can reset it by email

  Scenario: I can reset my password with the link sent to my address
    Given I clear sent emails directory
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    And I see an email to "operations@example.com" with subject "Reset your password"
    And I see an email to "operations@example.com" containing "/reset-password?token="
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with the token from the email to "operations@example.com" and body:
      """json
      {
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

  Scenario: An unknown address gets the same answer and no email
    Given I clear sent emails directory
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "nobody@example.com"
      }
      """
    Then the response status should be 202
    And the response body should be empty
    And I see 0 emails sent to "nobody@example.com"

  Scenario: A Google-only account gets the same answer and no email
    Given I clear sent emails directory
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "grace.doe@example.com"
      }
      """
    Then the response status should be 202
    And the response body should be empty
    And I see 0 emails sent to "grace.doe@example.com"

  Scenario: A repeated request within five minutes sends no second link
    Given I clear sent emails directory
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "operations@example.com"
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "operations@example.com"
    And I set database to initial state

  Scenario: I cannot request a reset for a malformed address
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "not-an-address"
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
          "email": ["email must be an email"]
        }
      }
      """

  Scenario: An expired reset token is rejected
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "G0qdrsEIlUfcCu-WPs9JDn7ZH0BgW0UbxBodS7HoOqs",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Password reset link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "alan.doe@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200

  Scenario: An already used reset token is rejected
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "B9MIQwGFaPIYg06E0y0acO3-7lJDSdXtizaC-DV-Tag",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Password reset link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "michael.doe@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200

  Scenario: An unknown reset token is rejected
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "Zm9yZ2VkLXRva2VuLXRoYXQtd2FzLW5ldmVyLWlzc3VlZA",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Password reset link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: A reset token cannot be used twice
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
        "newPassword": "AnOtHeRsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Password reset link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "abby.doe@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: A weak new password is rejected and leaves the token usable
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
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
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario: Confirming a reset revokes my sessions
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MjFhYjcwNS04NjA4LTQzODYtODZiNC0yZjM5MWEzNjU1YTciLCJzZXNzaW9uIjoiNjRhNWVmOTAtMzk5YS00Y2U1LThlZTMtNDFjNjcwN2QwZTY4IiwibmFtZSI6IkFsaWNlIERvZSIsImVtYWlsIjoib3BlcmF0aW9uc0BleGFtcGxlLmNvbSIsInJvbGUiOiJvcGVyYXRpb25zIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODU0MTEyODcsImV4cCI6MjEwMDc3MTI4N30.6FVaO4yEd7qytJ4mcj1ioAaNZ2eef9kX8H57JAm54oz8Wk5uDpJE6xydNny4nQSJSws8drKPbUJJ6fHrkkjXLA"
    Then the response status should be 200
    And I set database to initial state
    Given I clear sent emails directory
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with the token from the email to "operations@example.com" and body:
      """json
      {
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

  Scenario: A new request supersedes the token already sent
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "abby.doe@example.com"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Password reset link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "abby.doe@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As an unauthorized user I can request and confirm a reset
    Given I clear sent emails directory
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "abby.doe@example.com"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with the token from the email to "abby.doe@example.com" and body:
      """json
      {
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "abby.doe@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As an admin I get the same answer from both reset endpoints
    Given I clear sent emails directory
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    And I see an email to "operations@example.com" with subject "Reset your password"
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "abby.doe@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As a cabin crew I get the same answer from both reset endpoints
    Given I clear sent emails directory
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    And I see an email to "operations@example.com" with subject "Reset your password"
    When I send a "POST" request to "/api/v1/auth/reset-password/confirm" with body:
      """json
      {
        "token": "h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    And I set database to initial state
