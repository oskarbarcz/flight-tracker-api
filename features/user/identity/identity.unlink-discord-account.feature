Feature: As a signed-in user I can unlink my Discord account to stop briefing messages

  Scenario: As a cabin crew I can unlink my Discord account and can no longer sign in with Discord
    Given I am signed in as "Michael Doe"
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "629be07f-5e65-429a-9d69-d34b99185f50",
        "name": "Michael Doe",
        "email": "michael.doe@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-98540",
        "currentFlightId": "d4a25ef2-39cf-484c-af00-a548999e8699",
        "homeAirportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "lastAirportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "lastAirportUpdatedAt": null,
        "simbriefUserId": null,
        "defaultWeatherSource": "aviation_weather_gov",
        "emails": [
          {
            "email": "michael.doe@example.com",
            "isConfirmed": true,
            "active": true
          },
          {
            "email": "michael.new@example.com",
            "isConfirmed": false,
            "active": false
          }
        ],
        "identities": {
          "google": { "linked": false },
          "discord": { "linked": false }
        }
      }
      """
    When I send a "POST" request to "/api/v1/auth/discord" with body:
      """json
      {
        "code": "valid-michael-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "No user account is linked to this Discord account.",
        "error": "Unauthorized",
        "statusCode": 401
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can link a Discord account again after unlinking it
    Given I am signed in as "Michael Doe"
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-michael-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "linked": true,
        "userId": "100000000000000100",
        "username": "michael.doe",
        "globalName": "Michael Doe",
        "avatarUrl": "https://cdn.discordapp.com/avatars/100000000000000100/b1c2d3e4f5061728394a5b6c7d8e9f00.png",
        "joinOutcome": "not_requested"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot unlink my Discord account with a wrong password
    Given I am signed in as "Michael Doe"
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
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
    When I send a "POST" request to "/api/v1/auth/discord" with body:
      """json
      {
        "code": "valid-michael-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 200

  Scenario: As a Google-only user I cannot unlink my Discord account before setting a password
    Given I am signed in with Google using ID token "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZ0LXRlc3QtZ29vZ2xlLWtleS0yIn0.eyJlbWFpbCI6ImdyYWNlLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR3JhY2UgRG9lIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MDEyLWRldm1vY2tjbGllbnRpZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzY0NTMyMDE5ODczNDUxMjA5NiIsImlhdCI6MTc1MDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.Y7kpnUXeyPTELUu4U5TneX_auKMS467-I1VxgPLk3oUMI_A3T7K7BCEEY-TgSnLRDaGN6Ah2yyAVzfiN5R4Le8N8JceXPnJ_tayNgD6MyU7rBamlTgKPtOtGXUuQG0I4afKhI40ylz6ykM7HlwjCFdBjFTwkXZMmmeBBQIfcr15WXpBaVyav9Qwr7gYt3VzBDHrxIAh59MLOD7vK55q9CJ2nFxIw_VW53jk1U2XsC9s8btvvb9yaO1-sTwUIOhJIEQogWGIB8fmnQ7xD4ha4XwcHHfBXn0AnxpvkeHjUHT8NIzqwQTSRfibI1-sUixOLPRKA9L0_ZI0ie8AUUnZW8A"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "Set a password before unlinking your Discord account, otherwise you would not be able to sign in.",
        "error": "Conflict",
        "statusCode": 409
      }
      """
    And I set database to initial state

  Scenario: As operations with no linked Discord account I cannot unlink one
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "User has no linked Discord account.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As an admin with no linked Discord account I cannot unlink one
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
      """json
      {
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "User has no linked Discord account.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: I cannot unlink my Discord account without providing my password
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
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

  Scenario: As an unauthorized user I cannot unlink a Discord account
    When I send a "POST" request to "/api/v1/user/me/unlink-discord-account" with body:
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
