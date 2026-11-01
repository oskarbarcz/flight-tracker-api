Feature: The Transponder collects its tokens once the user approves it

  Scenario: The Transponder gets its tokens once the sign-in is approved
    Given I am signed in as "cabin crew"
    And I set database to initial state
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "gqfYUaQ_UvExwB_AU5Fqcx5cmZCXr-h-J6Ft8Njj8i0"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "accessToken": "@jwt_transponder_access_token",
        "refreshToken": "@jwt_transponder_refresh_token"
      }
      """
    When I send a "GET" request to "/api/v1/user/me/session"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "client": "transponder",
          "deviceName": "HANGAR-PC",
          "createdAt": "@date('within 1 minute from now')",
          "lastUsedAt": "@date('within 1 minute from now')",
          "expiresAt": "@any",
          "current": false
        },
        {
          "id": "f3748658-8191-4e5f-8ae1-76bd2d0a1a3e",
          "client": "transponder",
          "deviceName": "SIM-PC",
          "createdAt": "2026-10-05T07:15:00.000Z",
          "lastUsedAt": "2026-10-31T21:05:00.000Z",
          "expiresAt": "2036-01-01T00:00:00.000Z",
          "current": false
        },
        {
          "id": "fc42ee65-1d1e-46c7-89b0-e6051e2bf831",
          "client": "web",
          "deviceName": null,
          "createdAt": "2026-10-20T08:00:00.000Z",
          "lastUsedAt": "2026-10-31T18:30:00.000Z",
          "expiresAt": "2036-01-01T00:00:00.000Z",
          "current": false
        }
      ]
      """
    And I set database to initial state

  Scenario: The Transponder can collect its tokens only once
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "gqfYUaQ_UvExwB_AU5Fqcx5cmZCXr-h-J6Ft8Njj8i0"
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "gqfYUaQ_UvExwB_AU5Fqcx5cmZCXr-h-J6Ft8Njj8i0"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Device sign-in does not exist or has expired.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    And I set database to initial state

  Scenario: The Transponder keeps waiting while nobody has decided
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "5Ltk0oBiQBtbdikMEOU0wj6cLnVpI3fP4KjzVXPPvr0"
      }
      """
    Then the response status should be 202
    And the response body should contain:
      """json
      {
        "status": "pending"
      }
      """

  Scenario: The Transponder learns once that its sign-in was declined
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "gcjXj7YAJprrbZbJvvM3tIMk_Hr0auf1PmZlSccU44o"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Device sign-in was declined.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "gcjXj7YAJprrbZbJvvM3tIMk_Hr0auf1PmZlSccU44o"
      }
      """
    Then the response status should be 404
    And I set database to initial state

  Scenario Outline: The Transponder gets nothing for a code that <case>
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      {
        "deviceCode": "<deviceCode>"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Device sign-in does not exist or has expired.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

    Examples:
      | case           | deviceCode                                  |
      | has expired    | 1aVXeGl-LFK8MjFhU9SiqB1ljBhhvMjp1_gAKEqEc3E |
      | does not exist | 9lbtrWkcQQZ5y0rFXuU2wx7oCAMTu1hsKqgY6vKSc2s |

  Scenario Outline: The Transponder cannot poll with <case>
    When I send a "POST" request to "/api/v1/auth/device/token" with body:
      """json
      <body>
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "deviceCode": <violations>
        }
      }
      """

    Examples:
      | case            | body                 | violations                                                        |
      | no device code  | {}                   | ["deviceCode must be a string", "deviceCode should not be empty"] |
      | a number        | { "deviceCode": 42 } | ["deviceCode must be a string"]                                   |
      | an empty string | { "deviceCode": "" } | ["deviceCode should not be empty"]                                |
