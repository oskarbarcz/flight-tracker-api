Feature: Read own Discord rich presence

  Scenario: As a cabin crew with rich presence on I get the activity of my flight
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "state": "Checked in, takeoff at 13:15 UTC",
        "details": "Boston (BOS) -> Philadelphia (PHL)",
        "startTimestamp": "2025-01-01T13:00:00.000Z",
        "endTimestamp": "2025-01-01T15:50:00.000Z",
        "smallImageKey": "flight-tracker",
        "largeImageKey": "msfs 2024"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew on a flight with no crew estimate the scheduled times are published
    Given I am signed in as "Alan Doe"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "state": "Ready, takeoff at 18:00 UTC",
        "details": "New York (JFK) -> Frankfurt (FRA)",
        "startTimestamp": "2025-01-02T17:40:00.000Z",
        "endTimestamp": "2025-01-03T02:00:00.000Z",
        "smallImageKey": "flight-tracker",
        "largeImageKey": "msfs 2024"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew who has landed the activity states no further time
    Given I am signed in as "Michael Doe"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "state": "Offboarding complete",
        "details": "New York (JFK) -> Frankfurt (FRA)",
        "startTimestamp": "2025-01-03T04:00:00.000Z",
        "endTimestamp": "2025-01-03T11:30:00.000Z",
        "smallImageKey": "flight-tracker",
        "largeImageKey": "msfs 2024"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew with rich presence off nothing is published
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 204

  Scenario: As a cabin crew turning rich presence back off stops publishing the flight
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 200
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": false
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 204
    And I set database to initial state

  Scenario: As an admin with rich presence on but no flight nothing is published
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 204
    And I set database to initial state

  Scenario: As operations with rich presence on but no flight nothing is published
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 204
    And I set database to initial state

  Scenario: As an unauthorized user I cannot read rich presence
    When I send a "GET" request to "/api/v1/user/me/discord-presence"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
