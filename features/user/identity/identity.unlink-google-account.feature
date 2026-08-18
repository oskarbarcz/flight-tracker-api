Feature: As a signed-in user I can unlink my Google account to disable Google sign-in

  Scenario: As an admin I can unlink my Google account and can no longer sign in with Google
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMDQ3NzgzOTIwMTU2NjQyMDE4ODMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.IFSIjb177eJjkefhzQ-8IzBYREXSRQLioFOK1Hhf2XjIhGjn9yvdbv3BurIYoqCwIRdzNYfH5OVbk1IiILgxJ8AEvfVDUvTIgNHAMjA6pwnRkymOp4Q6Bh2yQrPvph65XbaqZldPUmjdL5F_3N1ZikZ_f6fbvF5lo5uYjKoc4pSwTBSIpO4rmRGDS85UrG3SpfTcF6nZcVvZr5eVdV24YZBWhtgSXbUs0J28xOy5G6zy9oWHvcTpUJECJscT2T4HTq5yD5mP3_JJQvLgUKzS_kNejyUwsFeJJ2UqYA5D2I3fKf6Dd9d1fiPF72plHZ246op2iaNO8mpNiUO5P4u8GA"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "No user account is linked to this Google account.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "admin@example.com",
        "password": "P@$$w0rd"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As an admin I can link a Google account again after unlinking it
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user/me/link-google-account" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMDQ3NzgzOTIwMTU2NjQyMDE4ODMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.IFSIjb177eJjkefhzQ-8IzBYREXSRQLioFOK1Hhf2XjIhGjn9yvdbv3BurIYoqCwIRdzNYfH5OVbk1IiILgxJ8AEvfVDUvTIgNHAMjA6pwnRkymOp4Q6Bh2yQrPvph65XbaqZldPUmjdL5F_3N1ZikZ_f6fbvF5lo5uYjKoc4pSwTBSIpO4rmRGDS85UrG3SpfTcF6nZcVvZr5eVdV24YZBWhtgSXbUs0J28xOy5G6zy9oWHvcTpUJECJscT2T4HTq5yD5mP3_JJQvLgUKzS_kNejyUwsFeJJ2UqYA5D2I3fKf6Dd9d1fiPF72plHZ246op2iaNO8mpNiUO5P4u8GA"
      }
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario: Unlinking my Google account keeps my other sessions valid
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTgxZDk4My0zYjY5LTRiZTItODY0ZS0yYTc1OTYyMTdkZGYiLCJzZXNzaW9uIjoiZGUxZjcyNDAtNWEzNy00ZTY0LWE3N2UtNDAxMTc3YmJlNWFlIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg1NDExMjg3LCJleHAiOjIxMDA3NzEyODd9.hv5BPUE5nCcer4DXUPbeUqPIvxDUhx_3N8icqP3LwzeRrW4Rm3HkKnKjQ3vyMcTFkfl4n4bAshnkURagdodl8Q"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """
    And I set database to initial state

  Scenario: As an admin I cannot unlink my Google account with a wrong password
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
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
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMDQ3NzgzOTIwMTU2NjQyMDE4ODMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.IFSIjb177eJjkefhzQ-8IzBYREXSRQLioFOK1Hhf2XjIhGjn9yvdbv3BurIYoqCwIRdzNYfH5OVbk1IiILgxJ8AEvfVDUvTIgNHAMjA6pwnRkymOp4Q6Bh2yQrPvph65XbaqZldPUmjdL5F_3N1ZikZ_f6fbvF5lo5uYjKoc4pSwTBSIpO4rmRGDS85UrG3SpfTcF6nZcVvZr5eVdV24YZBWhtgSXbUs0J28xOy5G6zy9oWHvcTpUJECJscT2T4HTq5yD5mP3_JJQvLgUKzS_kNejyUwsFeJJ2UqYA5D2I3fKf6Dd9d1fiPF72plHZ246op2iaNO8mpNiUO5P4u8GA"
      }
      """
    Then the response status should be 200
    And I set database to initial state

  Scenario: As a Google-only user I cannot unlink my Google account before setting a password
    Given I am signed in with Google using ID token "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleS0yIn0.eyJlbWFpbCI6ImdyYWNlLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR3JhY2UgRG9lIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzY0NTMyMDE5ODczNDUxMjA5NiIsImlhdCI6MTc1MDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.Y7kpnUXeyPTELUu4U5TneX_auKMS467-I1VxgPLk3oUMI_A3T7K7BCEEY-TgSnLRDaGN6Ah2yyAVzfiN5R4Le8N8JceXPnJ_tayNgD6MyU7rBamlTgKPtOtGXUuQG0I4afKhI40ylz6ykM7HlwjCFdBjFTwkXZMmmeBBQIfcr15WXpBaVyav9Qwr7gYt3VzBDHrxIAh59MLOD7vK55q9CJ2nFxIw_VW53jk1U2XsC9s8btvvb9yaO1-sTwUIOhJIEQogWGIB8fmnQ7xD4ha4XwcHHfBXn0AnxpvkeHjUHT8NIzqwQTSRfibI1-sUixOLPRKA9L0_ZI0ie8AUUnZW8A"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "Set a password before unlinking your Google account, otherwise you would not be able to sign in.",
        "error": "Conflict",
        "statusCode": 409
      }
      """
    And I set database to initial state

  Scenario: As operations with no linked Google account I cannot unlink one
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "User has no linked Google account.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As a cabin crew with no linked Google account I cannot unlink one
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "User has no linked Google account.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: I cannot unlink my Google account without providing my password
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
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
          "currentPassword": ["currentPassword must be a string", "currentPassword should not be empty"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot unlink a Google account
    When I send a "POST" request to "/api/v1/user/me/unlink-google-account" with body:
      """json
      {
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
