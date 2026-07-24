Feature: Get statistics per aircraft type

  Scenario: As a cabin crew I see my flying broken down per aircraft type
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/aircraft-types"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "types": [
          {
            "type": "B77W",
            "flights": 7,
            "distanceNm": 1610,
            "airborneMinutes": 1155,
            "blockMinutes": 1386,
            "firstFlownAt": "2025-01-01T16:18:00.000Z",
            "lastFlownAt": "2025-01-01T16:28:00.000Z"
          },
          {
            "type": "A339",
            "flights": 2,
            "distanceNm": 6700,
            "airborneMinutes": 940,
            "blockMinutes": 1005,
            "firstFlownAt": "2025-01-02T02:45:00.000Z",
            "lastFlownAt": "2025-01-03T11:45:00.000Z"
          }
        ]
      }
      """

  Scenario: As an admin with no flights the per-type breakdown is empty
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/aircraft-types"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "types": []
      }
      """

  Scenario: As an unauthorized user I cannot get the per-type breakdown
    When I send a "GET" request to "/api/v1/user/me/stats/aircraft-types"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
