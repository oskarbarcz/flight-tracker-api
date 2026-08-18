Feature: As a user who signs in with Google I can set a first password

  Scenario: As a Google-only user I can set my first password and sign in with it
    Given I am signed in with Google using ID token "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleS0yIn0.eyJlbWFpbCI6ImdyYWNlLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR3JhY2UgRG9lIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzY0NTMyMDE5ODczNDUxMjA5NiIsImlhdCI6MTc1MDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.Y7kpnUXeyPTELUu4U5TneX_auKMS467-I1VxgPLk3oUMI_A3T7K7BCEEY-TgSnLRDaGN6Ah2yyAVzfiN5R4Le8N8JceXPnJ_tayNgD6MyU7rBamlTgKPtOtGXUuQG0I4afKhI40ylz6ykM7HlwjCFdBjFTwkXZMmmeBBQIfcr15WXpBaVyav9Qwr7gYt3VzBDHrxIAh59MLOD7vK55q9CJ2nFxIw_VW53jk1U2XsC9s8btvvb9yaO1-sTwUIOhJIEQogWGIB8fmnQ7xD4ha4XwcHHfBXn0AnxpvkeHjUHT8NIzqwQTSRfibI1-sUixOLPRKA9L0_ZI0ie8AUUnZW8A"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/sign-in" with body:
      """json
      {
        "email": "grace.doe@example.com",
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
    And I set database to initial state

  Scenario: As a Google-only user setting a password leaves my Google sign-in working
    Given I am signed in with Google using ID token "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleS0yIn0.eyJlbWFpbCI6ImdyYWNlLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR3JhY2UgRG9lIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzY0NTMyMDE5ODczNDUxMjA5NiIsImlhdCI6MTc1MDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.Y7kpnUXeyPTELUu4U5TneX_auKMS467-I1VxgPLk3oUMI_A3T7K7BCEEY-TgSnLRDaGN6Ah2yyAVzfiN5R4Le8N8JceXPnJ_tayNgD6MyU7rBamlTgKPtOtGXUuQG0I4afKhI40ylz6ykM7HlwjCFdBjFTwkXZMmmeBBQIfcr15WXpBaVyav9Qwr7gYt3VzBDHrxIAh59MLOD7vK55q9CJ2nFxIw_VW53jk1U2XsC9s8btvvb9yaO1-sTwUIOhJIEQogWGIB8fmnQ7xD4ha4XwcHHfBXn0AnxpvkeHjUHT8NIzqwQTSRfibI1-sUixOLPRKA9L0_ZI0ie8AUUnZW8A"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/google" with body:
      """json
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleS0yIn0.eyJlbWFpbCI6ImdyYWNlLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR3JhY2UgRG9lIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzY0NTMyMDE5ODczNDUxMjA5NiIsImlhdCI6MTc1MDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.Y7kpnUXeyPTELUu4U5TneX_auKMS467-I1VxgPLk3oUMI_A3T7K7BCEEY-TgSnLRDaGN6Ah2yyAVzfiN5R4Le8N8JceXPnJ_tayNgD6MyU7rBamlTgKPtOtGXUuQG0I4afKhI40ylz6ykM7HlwjCFdBjFTwkXZMmmeBBQIfcr15WXpBaVyav9Qwr7gYt3VzBDHrxIAh59MLOD7vK55q9CJ2nFxIw_VW53jk1U2XsC9s8btvvb9yaO1-sTwUIOhJIEQogWGIB8fmnQ7xD4ha4XwcHHfBXn0AnxpvkeHjUHT8NIzqwQTSRfibI1-sUixOLPRKA9L0_ZI0ie8AUUnZW8A"
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

  Scenario: Setting a password revokes my other sessions
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OWJkNTJmMC02NTIzLTRhMDQtYjFmNy05NjA5OGRiMDVmZDAiLCJzZXNzaW9uIjoiYzk4Y2RlYWUtNzk0NS00YjIyLWFmYmItMjVmZjkzMWZjZDdhIiwibmFtZSI6IkdyYWNlIERvZSIsImVtYWlsIjoiZ3JhY2UuZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6Im9wZXJhdGlvbnMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NTQxMTI4NywiZXhwIjoyMTAwNzcxMjg3fQ.5qskn6UHavq76UvSkzAmKvjjVlO2Brp8OCU6oourCccNUHdwRsjQ_gD0FnPd5RD7EfPZbQMkYGNvU7Gex0g-Vg"
    Then the response status should be 200
    And I set database to initial state
    Given I am signed in with Google using ID token "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleS0yIn0.eyJlbWFpbCI6ImdyYWNlLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR3JhY2UgRG9lIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzY0NTMyMDE5ODczNDUxMjA5NiIsImlhdCI6MTc1MDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.Y7kpnUXeyPTELUu4U5TneX_auKMS467-I1VxgPLk3oUMI_A3T7K7BCEEY-TgSnLRDaGN6Ah2yyAVzfiN5R4Le8N8JceXPnJ_tayNgD6MyU7rBamlTgKPtOtGXUuQG0I4afKhI40ylz6ykM7HlwjCFdBjFTwkXZMmmeBBQIfcr15WXpBaVyav9Qwr7gYt3VzBDHrxIAh59MLOD7vK55q9CJ2nFxIw_VW53jk1U2XsC9s8btvvb9yaO1-sTwUIOhJIEQogWGIB8fmnQ7xD4ha4XwcHHfBXn0AnxpvkeHjUHT8NIzqwQTSRfibI1-sUixOLPRKA9L0_ZI0ie8AUUnZW8A"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/auth/refresh" with bearer token "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OWJkNTJmMC02NTIzLTRhMDQtYjFmNy05NjA5OGRiMDVmZDAiLCJzZXNzaW9uIjoiYzk4Y2RlYWUtNzk0NS00YjIyLWFmYmItMjVmZjkzMWZjZDdhIiwibmFtZSI6IkdyYWNlIERvZSIsImVtYWlsIjoiZ3JhY2UuZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6Im9wZXJhdGlvbnMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NTQxMTI4NywiZXhwIjoyMTAwNzcxMjg3fQ.5qskn6UHavq76UvSkzAmKvjjVlO2Brp8OCU6oourCccNUHdwRsjQ_gD0FnPd5RD7EfPZbQMkYGNvU7Gex0g-Vg"
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

  Scenario: As an admin who already has a password I cannot set a first one
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "This account already has a password. Change it instead.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As a cabin crew who already has a password I cannot set a first one
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
        "newPassword": "NeWsTr0nGP@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "This account already has a password. Change it instead.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: I cannot set a first password that is too short
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
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

  Scenario: I cannot set a long first password that has no uppercase, number or symbol
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
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

  Scenario: I cannot set a first password without providing one
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
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
          "newPassword": [
            "Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number and a symbol.",
            "newPassword must be a string",
            "newPassword should not be empty"
          ]
        }
      }
      """

  Scenario: As an unauthorized user I cannot set a password
    When I send a "POST" request to "/api/v1/user/me/set-password" with body:
      """json
      {
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
