Feature: Get calendar-period statistics

  Scenario: As an admin with no flights every period is empty
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/periods"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "week": {
          "current": { "distanceNm": 0, "airborneMinutes": 0, "blockMinutes": 0, "flights": 0, "fuelBurned": 0 },
          "previous": { "distanceNm": 0, "airborneMinutes": 0, "blockMinutes": 0, "flights": 0, "fuelBurned": 0 },
          "unlocked": { "airports": [], "aircraftTypes": [] }
        },
        "month": {
          "current": { "distanceNm": 0, "airborneMinutes": 0, "blockMinutes": 0, "flights": 0, "fuelBurned": 0 },
          "previous": { "distanceNm": 0, "airborneMinutes": 0, "blockMinutes": 0, "flights": 0, "fuelBurned": 0 },
          "unlocked": { "airports": [], "aircraftTypes": [] }
        },
        "year": {
          "current": { "distanceNm": 0, "airborneMinutes": 0, "blockMinutes": 0, "flights": 0, "fuelBurned": 0 },
          "previous": { "distanceNm": 0, "airborneMinutes": 0, "blockMinutes": 0, "flights": 0, "fuelBurned": 0 },
          "unlocked": { "airports": [], "aircraftTypes": [] }
        }
      }
      """

  Scenario: As a cabin crew completing a flight to an airport I never visited unlocks it with its first visit date
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/report-arrival"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/report-on-block"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/user/me/stats/periods"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "week": "@any",
        "month": {
          "current": "@any",
          "previous": "@any",
          "unlocked": {
            "airports": [{ "icaoCode": "LFPG", "firstVisitAt": "@date('within 1 minute from now')" }],
            "aircraftTypes": "@any"
          }
        },
        "year": "@any"
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot get period statistics
    When I send a "GET" request to "/api/v1/user/me/stats/periods"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
