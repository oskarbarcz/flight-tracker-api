Feature: As a user I can sign one of my sessions out

  Scenario: As a cabin crew I sign my Transponder out
    Given I set database to initial state
    And I am signed in with a new session as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user/me/session/f3748658-8191-4e5f-8ae1-76bd2d0a1a3e"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/user/me/session"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "client": "web",
          "deviceName": null,
          "createdAt": "@date('within 1 minute from now')",
          "lastUsedAt": "@date('within 1 minute from now')",
          "expiresAt": "@any",
          "current": true
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

  Scenario: As an admin I sign one of my sessions out
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/user/me/session/de1f7240-5a37-4e64-a77e-401177bbe5ae"
    Then the response status should be 204
    And I set database to initial state

  Scenario Outline: As a cabin crew I cannot sign out a session that <case>
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user/me/session/<id>"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Session does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

    Examples:
      | case                    | id                                   |
      | belongs to someone else | de1f7240-5a37-4e64-a77e-401177bbe5ae |
      | does not exist          | 0b8f1c2e-6f8e-4d2b-9a43-7c1d5e9f3a21 |

  Scenario: As a cabin crew I cannot sign out a session with an invalid id
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user/me/session/not-a-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: The Transponder cannot sign sessions out
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user/me/session/fc42ee65-1d1e-46c7-89b0-e6051e2bf831"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "This action is not available to the Transponder.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot sign sessions out
    When I send a "DELETE" request to "/api/v1/user/me/session/fc42ee65-1d1e-46c7-89b0-e6051e2bf831"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
