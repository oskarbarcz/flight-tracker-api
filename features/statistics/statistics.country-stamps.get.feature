Feature: Get my stamps for one country

  Scenario: As a cabin crew I can see every visit I made to a country
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/countries/DE"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "country": {
          "code": "DE",
          "name": "Germany"
        },
        "flag": "🇩🇪",
        "stamps": [
          {
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "airportName": "Frankfurt Rhein/Main",
            "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "flightId": "d4a25ef2-39cf-484c-af00-a548999e8699",
            "visitedAt": "2025-01-03T11:45:00.000Z"
          }
        ]
      }
      """

  Scenario: As a cabin crew the country code is not case sensitive
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/countries/de"
    Then the response status should be 200
    And the response body property "country" should contain:
      """json
      {
        "code": "DE",
        "name": "Germany"
      }
      """

  Scenario: As a cabin crew I get no stamps for a country I have never landed in
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/countries/CA"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "You have not visited CA.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot ask for something that is not a country
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/countries/QQ"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "\"QQ\" is not a known ISO 3166-1 alpha-2 country code.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an admin I can read my own stamps
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/countries/DE"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "You have not visited DE.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot read stamps
    When I send a "GET" request to "/api/v1/user/me/stats/countries/DE"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
