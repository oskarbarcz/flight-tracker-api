Feature: As a user with a linked Google account I can exchange a Google ID token for JWT tokens

  Scenario: As a user with a linked Google account I can sign in
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMDQ3NzgzOTIwMTU2NjQyMDE4ODMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.IFSIjb177eJjkefhzQ-8IzBYREXSRQLioFOK1Hhf2XjIhGjn9yvdbv3BurIYoqCwIRdzNYfH5OVbk1IiILgxJ8AEvfVDUvTIgNHAMjA6pwnRkymOp4Q6Bh2yQrPvph65XbaqZldPUmjdL5F_3N1ZikZ_f6fbvF5lo5uYjKoc4pSwTBSIpO4rmRGDS85UrG3SpfTcF6nZcVvZr5eVdV24YZBWhtgSXbUs0J28xOy5G6zy9oWHvcTpUJECJscT2T4HTq5yD5mP3_JJQvLgUKzS_kNejyUwsFeJJ2UqYA5D2I3fKf6Dd9d1fiPF72plHZ246op2iaNO8mpNiUO5P4u8GA"
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
    And I set database to initial state

  Scenario: As a user whose Google account is not linked to any user I cannot sign in
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiI5ODc2NTQzMjEwOTg3NjU0MzIxMDkiLCJlbWFpbCI6InN0cmFuZ2VyQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJTdHJhbmdlciBEb2UiLCJpYXQiOjE3NTAwMDAwMDAsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsImF1ZCI6IjEyMzQ1Njc4OTAxMi1kZXZtb2NrY2xpZW50aWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJleHAiOjQxMDI0NDQ4MDB9.QkNprMTVGozXjVsUm-pmpOXNSfnha2EiHjHF8_Wg9dlI0Jqx7sxZGJJnWiVewkX9ghw9d1k5yuCK4NbyJVxWWhDCZo5md3_hMaWfuM1WGqcVjFcjmHXZO6ORqx3XUHQ96TfiMDXHkI3xXofXyaEIHbnw0vtOTT8EExThXVtuzyVHXjsfne1pzDLGKO6BYTErvFdWkSDnTI1vn91DdO7jdxScbIc4ACAdcw--kax4DqbE3BYuWJqakqzWCM2s3skbL4Obr6kHDw6ALY_a87zjiZKAYFUMIYdKvvi4ZgBSzAb9Lo_bt3jwV3Kk1n8A1NtVIhD8Pn0nMIvvbpC-KcVHlA"
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

  Scenario: As any user I cannot sign in with a token that Google did not sign
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMDQ3NzgzOTIwMTU2NjQyMDE4ODMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.qtB3PtwiREsHy4hDHFlsmpUpsE4ngdhm-WNKWQufNK3ay0rmUGP5ESTh2k-e6IpZNynm0_0AKgS6ce7Vv6eVzhUd9_1JXQfpW_EiX1o-UDLNaOSEZ4tXfGa2Dmmp-b2FI03NeiVIPTbq4623knm7dVv-kJBw2TDAfCEwT38OVxicxQiw4xOZnzoZWTLn64KnvVDIAMpx-PUakuvmTaEY3ppamBK3XKu1j0E40v9xBBoRUTq9dk8ocwWVcFap9V-dPpgXNPJRnYNFrqmI894IDnaT8qBuVJPpYnh8PcPdAxSDt2L8hyx5f-zIzsu8gfiNO-xRkAR3bDx2wPq-1SFb3Q"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Google token is not valid.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As any user I cannot sign in with a malformed token
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "not-a-token"
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
          "idToken": ["idToken must be a jwt string"]
        }
      }
      """
