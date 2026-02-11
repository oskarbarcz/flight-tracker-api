Feature: Get user stats

  Scenario: As an admin I can get my user stats
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "total": {
          "blockTime": 0,
          "totalFuelBurned": 0,
          "totalFlightTime": 0,
          "totalGreatCircleDistance": 0
        }
      }
      """

  Scenario: As operations I can get my user stats
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me/stats"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "total": {
          "blockTime": 0,
          "totalFuelBurned": 0,
          "totalFlightTime": 0,
          "totalGreatCircleDistance": 0
        }
      }
      """

  Scenario: As a cabin crew I can get my user stats
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "total": {
          "blockTime": 1797,
          "totalFuelBurned": 326000,
          "totalFlightTime": 1797,
          "totalGreatCircleDistance": 7850
        }
      }
      """

  Scenario: As an unauthorized user I cannot get user stats
    When I send a "GET" request to "/api/v1/user/me/stats"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
