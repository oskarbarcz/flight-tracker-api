Feature: I get data from SkyLink

  Scenario: As an admin I cannot retrieve airport information
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/skylink/airport/LHR"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can retrieve airport information
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/skylink/airport/LHR"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "icao": "EGLL",
        "iata": "LHR",
        "name": "London Heathrow Airport",
        "city": "London",
        "region": "England",
        "country": "GB",
        "elevation_ft": "83",
        "latitude": "51.47060013",
        "longitude": "-0.461941",
        "timezone": "Europe/London"
      }
      """

  Scenario: As cabin crew I cannot retrieve airport information
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/skylink/airport/LHR"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot retrieve not existing airport information
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/skylink/airport/XXX"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "No airport found for IATA code: XXX",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As unauthorized I cannot retrieve airport information
    When I send a "GET" request to "/api/v1/skylink/airport/LHR"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
