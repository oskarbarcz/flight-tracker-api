Feature: As a user who linked a Discord account I can sign in with it

  Scenario: As a cabin crew with a linked Discord account I can sign in with Discord
    When I send a "POST" request to "/api/v1/auth/discord" with body:
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
        "accessToken": "@jwt_access_token",
        "refreshToken": "@jwt_refresh_token"
      }
      """

  Scenario: As a holder of a Discord account nobody linked I cannot sign in with it
    When I send a "POST" request to "/api/v1/auth/discord" with body:
      """json
      {
        "code": "valid-stranger-code",
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

  Scenario: I cannot sign in by replaying an authorization code Discord already spent
    When I send a "POST" request to "/api/v1/auth/discord" with body:
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

  Scenario: I cannot redirect an authorization code to a URI this deployment does not allow
    When I send a "POST" request to "/api/v1/auth/discord" with body:
      """json
      {
        "code": "valid-michael-code",
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

  Scenario: I cannot sign in with Discord without the whole authorization
    When I send a "POST" request to "/api/v1/auth/discord" with body:
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
          "code": ["code must be a string", "code should not be empty"],
          "redirectUri": ["redirectUri must be a string", "redirectUri should not be empty"],
          "codeVerifier": ["codeVerifier must be a string", "codeVerifier should not be empty"]
        }
      }
      """
