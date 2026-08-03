Feature: As a signed-in user I can link my Google account to enable Google sign-in

  Scenario: As operations I can link a Google account that no user holds yet
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-google-account" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMTAwMjIwMDMzMDA0NDAwNTUwMDYiLCJlbWFpbCI6Im9wZXJhdGlvbnNAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFsaWNlIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.DjvEoNAZ6twLgi8Im-eAYPWJg-b_AJ4Ukbbj8aYbU-G10bT36kjQ0GUsG_BCEJEhqD7uf2PKN-2dN6G-xzhqT3FgF1u5xLlF0vEUWmva5WaE0edYjYkXwYbYWR10sTePr8j5-rdPGsKKmYDhbeNCiTBKusUDsm0KdDXuChGh_iLuI1y5nXNGbCVzCvbjoRt_Y2udZpImSmqjLmjqkmtkZTvfbSFfBU_SZ1oG4vfQrS6UWJj79YgEPe5pqbb-2ACutzi0KoTldL7fiyLgR_GRLM0aWuwYZ7w1L4mUBjDhoU5WbLz1FjFTdE1CpNfVl-ew4mYSL7tNgD9C_UDo0EViUg"
      }
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario: As an admin who already linked a Google account I cannot link another one
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/link-google-account" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMTAwMjIwMDMzMDA0NDAwNTUwMDYiLCJlbWFpbCI6Im9wZXJhdGlvbnNAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFsaWNlIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.DjvEoNAZ6twLgi8Im-eAYPWJg-b_AJ4Ukbbj8aYbU-G10bT36kjQ0GUsG_BCEJEhqD7uf2PKN-2dN6G-xzhqT3FgF1u5xLlF0vEUWmva5WaE0edYjYkXwYbYWR10sTePr8j5-rdPGsKKmYDhbeNCiTBKusUDsm0KdDXuChGh_iLuI1y5nXNGbCVzCvbjoRt_Y2udZpImSmqjLmjqkmtkZTvfbSFfBU_SZ1oG4vfQrS6UWJj79YgEPe5pqbb-2ACutzi0KoTldL7fiyLgR_GRLM0aWuwYZ7w1L4mUBjDhoU5WbLz1FjFTdE1CpNfVl-ew4mYSL7tNgD9C_UDo0EViUg"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "User already has a linked Google account.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As a cabin crew I cannot link a Google account that another user already holds
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/link-google-account" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMDQ3NzgzOTIwMTU2NjQyMDE4ODMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.IFSIjb177eJjkefhzQ-8IzBYREXSRQLioFOK1Hhf2XjIhGjn9yvdbv3BurIYoqCwIRdzNYfH5OVbk1IiILgxJ8AEvfVDUvTIgNHAMjA6pwnRkymOp4Q6Bh2yQrPvph65XbaqZldPUmjdL5F_3N1ZikZ_f6fbvF5lo5uYjKoc4pSwTBSIpO4rmRGDS85UrG3SpfTcF6nZcVvZr5eVdV24YZBWhtgSXbUs0J28xOy5G6zy9oWHvcTpUJECJscT2T4HTq5yD5mP3_JJQvLgUKzS_kNejyUwsFeJJ2UqYA5D2I3fKf6Dd9d1fiPF72plHZ246op2iaNO8mpNiUO5P4u8GA"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "This Google account is already linked to another user.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As an unauthorized user I cannot link a Google account
    When I send a "POST" request to "/api/v1/user/me/link-google-account" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleSJ9.eyJzdWIiOiIxMTAwMjIwMDMzMDA0NDAwNTUwMDYiLCJlbWFpbCI6Im9wZXJhdGlvbnNAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFsaWNlIERvZSIsImlhdCI6MTc1MDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImV4cCI6NDEwMjQ0NDgwMH0.DjvEoNAZ6twLgi8Im-eAYPWJg-b_AJ4Ukbbj8aYbU-G10bT36kjQ0GUsG_BCEJEhqD7uf2PKN-2dN6G-xzhqT3FgF1u5xLlF0vEUWmva5WaE0edYjYkXwYbYWR10sTePr8j5-rdPGsKKmYDhbeNCiTBKusUDsm0KdDXuChGh_iLuI1y5nXNGbCVzCvbjoRt_Y2udZpImSmqjLmjqkmtkZTvfbSFfBU_SZ1oG4vfQrS6UWJj79YgEPe5pqbb-2ACutzi0KoTldL7fiyLgR_GRLM0aWuwYZ7w1L4mUBjDhoU5WbLz1FjFTdE1CpNfVl-ew4mYSL7tNgD9C_UDo0EViUg"
      }
      """
    Then the response status should be 401
