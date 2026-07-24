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
