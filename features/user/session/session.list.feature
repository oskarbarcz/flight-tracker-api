Feature: As a user I can see where I am signed in

  Scenario: As a cabin crew I see my sessions, the most recently used first
    Given I set database to initial state
    And I am signed in with a new session as "cabin crew"
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

  Scenario: As an admin I see my sessions
    Given I am signed in as "admin"
    And I set database to initial state
    When I send a "GET" request to "/api/v1/user/me/session"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "de1f7240-5a37-4e64-a77e-401177bbe5ae",
          "client": "web",
          "deviceName": null,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "lastUsedAt": "2025-01-01T00:00:00.000Z",
          "expiresAt": "2036-01-01T00:00:00.000Z",
          "current": false
        }
      ]
      """

  Scenario: As operations I see my sessions
    Given I am signed in as "operations"
    And I set database to initial state
    When I send a "GET" request to "/api/v1/user/me/session"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "64a5ef90-399a-4ce5-8ee3-41c6707d0e68",
          "client": "web",
          "deviceName": null,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "lastUsedAt": "2025-01-01T00:00:00.000Z",
          "expiresAt": "2036-01-01T00:00:00.000Z",
          "current": false
        }
      ]
      """

  Scenario: The Transponder cannot see my sessions
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/session"
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

  Scenario: As an unauthorized user I cannot see sessions
    When I send a "GET" request to "/api/v1/user/me/session"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
