Feature: As a signed-in user I can link my Discord account to receive flight briefings

  Scenario: As operations I can link my Discord account and join the server in one pass
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-join-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok",
        "joinServer": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "linked": true,
        "userId": "100000000000000002",
        "username": "newcomer",
        "globalName": "Newcomer",
        "avatarUrl": "https://cdn.discordapp.com/avatars/100000000000000002/a_57e2f1cb90d4a3865fbb0e7cd2419a68.gif",
        "joinOutcome": "joined"
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
        "defaultWeatherSource": "say_intentions",
        "emails": [
          {
            "email": "operations@example.com",
            "isConfirmed": true,
            "active": true
          }
        ],
        "identities": {
          "google": { "linked": false },
          "discord": {
            "linked": true,
            "userId": "100000000000000002",
            "username": "newcomer",
            "globalName": "Newcomer",
            "avatarUrl": "https://cdn.discordapp.com/avatars/100000000000000002/a_57e2f1cb90d4a3865fbb0e7cd2419a68.gif"
          }
        }
      }
      """
    And I set database to initial state

  Scenario: As operations I can link my Discord account without joining the server
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-nojoin-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "linked": true,
        "userId": "100000000000000003",
        "username": "loner",
        "globalName": null,
        "avatarUrl": null,
        "joinOutcome": "not_requested"
      }
      """
    And I set database to initial state

  Scenario: As operations linking an account already in the server I am told it was there
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-member-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok",
        "joinServer": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "linked": true,
        "userId": "100000000000000005",
        "username": "veteran",
        "globalName": "Veteran",
        "avatarUrl": "https://cdn.discordapp.com/avatars/100000000000000005/cafe1f2e3d4c5b6a798877665544332211.png",
        "joinOutcome": "already_member"
      }
      """
    And I set database to initial state

  Scenario: A server join the bot is not allowed to perform leaves the link standing
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-joinfail-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok",
        "joinServer": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "linked": true,
        "userId": "100000000000000004",
        "username": "unlucky",
        "globalName": null,
        "avatarUrl": null,
        "joinOutcome": "failed"
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
        "defaultWeatherSource": "say_intentions",
        "emails": [
          {
            "email": "operations@example.com",
            "isConfirmed": true,
            "active": true
          }
        ],
        "identities": {
          "google": { "linked": false },
          "discord": {
            "linked": true,
            "userId": "100000000000000004",
            "username": "unlucky",
            "globalName": null,
            "avatarUrl": null
          }
        }
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot request a server join the authorization does not cover
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-nojoin-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok",
        "joinServer": true
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Joining the server was not authorized.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As a cabin crew who already linked a Discord account I cannot link another
    Given I am signed in as "Michael Doe"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-nojoin-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "User already has a linked Discord account.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As operations I cannot link a Discord account another user already linked
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-michael-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "This Discord account is already linked to another user.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As operations I cannot link by replaying an authorization code Discord already spent
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "already-used-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Discord authorization code is not valid.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot redirect an authorization code to a URI this deployment does not allow
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-join-code",
        "redirectUri": "https://attacker.example.com/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Redirect URI is not allowed.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot link a Discord account
    When I send a "POST" request to "/api/v1/user/me/link-discord-account" with body:
      """json
      {
        "code": "valid-join-code",
        "redirectUri": "http://localhost:5173/auth/discord/callback",
        "codeVerifier": "dBjftJeZ4CVPmB92K27uhbUJU1p1r1wiuGHEeQzW1ok"
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
