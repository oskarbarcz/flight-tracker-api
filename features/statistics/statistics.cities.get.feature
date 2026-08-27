Feature: Get my visited cities

  Scenario: As a cabin crew I can see every city I have landed in
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/cities"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "cities": [
          {
            "city": {
              "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
              "name": "Philadelphia"
            },
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "visits": 7,
            "firstVisitAt": "2025-01-01T16:18:00.000Z",
            "lastVisitAt": "2025-01-01T16:28:00.000Z"
          },
          {
            "city": {
              "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
              "name": "New York"
            },
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "visits": 1,
            "firstVisitAt": "2025-01-02T02:45:00.000Z",
            "lastVisitAt": "2025-01-02T02:45:00.000Z"
          },
          {
            "city": {
              "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
              "name": "Frankfurt"
            },
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "visits": 1,
            "firstVisitAt": "2025-01-03T11:45:00.000Z",
            "lastVisitAt": "2025-01-03T11:45:00.000Z"
          }
        ]
      }
      """

  Scenario: As an admin who has never flown I have visited no city
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/cities"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "cities": []
      }
      """

  Scenario: As operations who has never flown I have visited no city
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me/stats/cities"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "cities": []
      }
      """

  Scenario: As an unauthorized user I cannot see visited cities
    When I send a "GET" request to "/api/v1/user/me/stats/cities"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
