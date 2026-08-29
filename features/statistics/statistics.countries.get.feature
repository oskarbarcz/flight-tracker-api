Feature: Get my visited countries

  Scenario: As a cabin crew I can see every country I have landed in
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/countries"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "countries": [
          {
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "flag": "🇺🇸",
            "visits": 8,
            "firstVisitAt": "2025-01-01T16:18:00.000Z",
            "lastVisitAt": "2025-01-02T02:45:00.000Z"
          },
          {
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "flag": "🇩🇪",
            "visits": 1,
            "firstVisitAt": "2025-01-03T11:45:00.000Z",
            "lastVisitAt": "2025-01-03T11:45:00.000Z"
          }
        ]
      }
      """

  Scenario: As an admin who has never flown my passport is empty
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/countries"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "countries": []
      }
      """

  Scenario: As operations who has never flown my passport is empty
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me/stats/countries"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "countries": []
      }
      """

  Scenario: As an unauthorized user I cannot see visited countries
    When I send a "GET" request to "/api/v1/user/me/stats/countries"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
