Feature: As a user I can change my own email address

  Scenario: As a user I can move my account to a confirmed new address
    Given I clear sent emails directory
    And I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alan.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    And I see an email to "alan.new@example.com" with subject "Confirm your new email address"
    And I see an email to "alan.new@example.com" containing "/confirm-email?token="
    And I see an email to "alan.doe@example.com" with subject "Your email address change was requested"
    And I see no email to "alan.doe@example.com" containing "/confirm-email"
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with the token from the email to "alan.new@example.com"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "alan.new@example.com",
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
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "alan.doe@example.com",
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

  Scenario: A pending address does not work until it is confirmed
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "operations@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "alice.new@example.com",
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
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "721ab705-8608-4386-86b4-2f391a3655a7",
        "name": "Alice Doe",
        "email": "operations@example.com",
        "role": "Operations",
        "pilotLicenseId": null,
        "currentFlightId": null,
        "homeAirportId": null,
        "lastAirportId": null,
        "lastAirportUpdatedAt": null,
        "simbriefUserId": null,
        "emails": [
          {
            "email": "operations@example.com",
            "isConfirmed": true,
            "active": true
          },
          {
            "email": "alice.new@example.com",
            "isConfirmed": false,
            "active": false
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: A password reset still goes to the old address while a change is pending
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "operations@example.com"
      }
      """
    Then the response status should be 202
    And I see an email to "operations@example.com" with subject "Reset your password"
    When I send a "POST" request to "/api/v1/auth/reset-password" with body:
      """json
      {
        "email": "alice.new@example.com"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "alice.new@example.com"
    And I see no email to "alice.new@example.com" containing "/reset-password"
    And I set database to initial state

  Scenario: Changing my password revokes a pending email change
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    When I send a "PATCH" request to "/api/v1/user/me/change-password" with body:
      """json
      {
        "currentPassword": "P@$$w0rd",
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with the token from the email to "alice.new@example.com"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Email change confirmation link is invalid or has expired.",
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
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "alice.new@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 401
    And I set database to initial state

  Scenario: A confirmed address is usable whatever case it was requested in
    Given I clear sent emails directory
    And I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "Alan.NEW@Example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with the token from the email to "alan.new@example.com"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "alan.new@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "ALAN.NEW@EXAMPLE.COM",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: A repeated request within five minutes sends no second confirmation
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "alice.new@example.com"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "alice.new@example.com"
    And I set database to initial state

  Scenario: I cannot request an email change with a wrong current password
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "WrongP@$$w0rd"
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
    And I see 0 emails sent to "alice.new@example.com"

  Scenario: I cannot request the address my account already uses
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "operations@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "New email address must be different from the current one.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: I cannot request an address that belongs to another account
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "cabin-crew@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "This email address is already in use.",
        "error": "Conflict",
        "statusCode": 409
      }
      """
    And I see 0 emails sent to "cabin-crew@example.com"

  Scenario: I cannot request a malformed address
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "not-an-address",
        "currentPassword": "P@$$w0rd"
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
          "newEmail": ["newEmail must be an email"]
        }
      }
      """

  Scenario: As an admin I can request an email change
    Given I clear sent emails directory
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "john.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "john.new@example.com"
    And I see an email to "admin@example.com" with subject "Your email address change was requested"
    And I set database to initial state

  Scenario: As a cabin crew I can request an email change
    Given I clear sent emails directory
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "rick.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    And I see 1 email sent to "rick.new@example.com"
    And I set database to initial state

  Scenario: As an unauthorized user I cannot request an email change
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
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

  Scenario: An expired confirmation token is rejected
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "o7_vOW-CXcI2YIyYYb3v4TBJPz4RLOK3dfAjCuEIzOE"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Email change confirmation link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "emma.doe@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200

  Scenario: An already used confirmation token is rejected
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "z5gfkDZtIwvOx9s20TdEcLqSJ7szBbLy9FbWUtW_QX4"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Email change confirmation link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "diana.doe@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200

  Scenario: An unknown confirmation token is rejected
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "Zm9yZ2VkLXRva2VuLXRoYXQtd2FzLW5ldmVyLWlzc3VlZA"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Email change confirmation link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: A confirmation for an address taken in the meantime is rejected
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "iYST-I0VbklehvJE9kpRgoEbJqC46CaGo-jrEhEfvwo"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "This email address is already in use.",
        "error": "Conflict",
        "statusCode": 409
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "claudia.doe@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200

  Scenario: A confirmation token cannot be used twice
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "uvlKqgdSTj27i866aP-TPZNFJBO9hwLs6K0f8Zq-Pek"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "uvlKqgdSTj27i866aP-TPZNFJBO9hwLs6K0f8Zq-Pek"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Email change confirmation link is invalid or has expired.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "michael.new@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As an unauthorized user I can confirm a change with the emailed token
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "uvlKqgdSTj27i866aP-TPZNFJBO9hwLs6K0f8Zq-Pek"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "michael.new@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: A confirmation sent with a bearer token behaves the same
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with body:
      """json
      {
        "token": "uvlKqgdSTj27i866aP-TPZNFJBO9hwLs6K0f8Zq-Pek"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "michael.new@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: Confirming an email change revokes my sessions
    Given I clear sent emails directory
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MjFhYjcwNS04NjA4LTQzODYtODZiNC0yZjM5MWEzNjU1YTciLCJzZXNzaW9uIjoiNjRhNWVmOTAtMzk5YS00Y2U1LThlZTMtNDFjNjcwN2QwZTY4IiwibmFtZSI6IkFsaWNlIERvZSIsImVtYWlsIjoib3BlcmF0aW9uc0BleGFtcGxlLmNvbSIsInJvbGUiOiJvcGVyYXRpb25zIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODU0MTEyODcsImV4cCI6MjEwMDc3MTI4N30.6FVaO4yEd7qytJ4mcj1ioAaNZ2eef9kX8H57JAm54oz8Wk5uDpJE6xydNny4nQSJSws8drKPbUJJ6fHrkkjXLA"
    Then the response status should be 200
    And I set database to initial state
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alice.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with the token from the email to "alice.new@example.com"
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
