Feature: Get activity heatmap series

  Scenario: As a cabin crew I see my per-day activity over a date range
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/activity?from=2025-01-01&to=2025-01-03"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "days": [
          {
            "day": "2025-01-01",
            "flights": 7,
            "airborneMinutes": 1155,
            "blockMinutes": 1386
          },
          {
            "day": "2025-01-02",
            "flights": 1,
            "airborneMinutes": 510,
            "blockMinutes": 540
          },
          {
            "day": "2025-01-03",
            "flights": 1,
            "airborneMinutes": 430,
            "blockMinutes": 465
          }
        ]
      }
      """

  Scenario: As an admin with no flights the activity series is empty
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/activity?from=2025-01-01&to=2025-01-03"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "days": []
      }
      """

  Scenario: As an unauthorized user I cannot get the activity series
    When I send a "GET" request to "/api/v1/user/me/stats/activity?from=2025-01-01&to=2025-01-03"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
