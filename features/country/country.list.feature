Feature: List countries

  Scenario: As an admin I can list countries
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/country"
    Then the response status should be 200
    And the only entry of the response body list "countries" with "code" set to "DE" should contain:
      """json
      {
        "code": "DE",
        "name": "Germany",
        "flag": "🇩🇪",
        "continent": "europe"
      }
      """

  Scenario: As operations I can list countries
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/country"
    Then the response status should be 200
    And the only entry of the response body list "countries" with "code" set to "US" should contain:
      """json
      {
        "code": "US",
        "name": "United States of America",
        "flag": "🇺🇸",
        "continent": "north_america"
      }
      """

  Scenario: As a cabin crew I can list countries
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/country"
    Then the response status should be 200
    And the response body list "countries" should have distinct "code" values
    And every entry of the response body list "countries" should have a "flag"

  Scenario: As an unauthorized user I cannot list countries
    When I send a "GET" request to "/api/v1/country"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
