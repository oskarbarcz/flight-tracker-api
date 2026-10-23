Feature: Get flights list

  Scenario: As an admin I can get flights list
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "52"

  Scenario: As operations I can get flight
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "52"

  Scenario: As a cabin crew I can get flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "52"

  Scenario: As cabin crew I can get flight filtered by flight phase
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?phase=upcoming"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "26"

  Scenario: As operations I can list flights with unresolved emergencies
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight?phase=emergency"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "2"

  Scenario: As cabin crew I cannot get flight filtered by incorrect flight phase
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?phase=invalid-phase-name"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "phase": ["phase must be one of the following values: upcoming, ongoing, finished, emergency"]
        }
      }
      """

  Scenario: As cabin crew I can get flight list paginated
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?limit=2&page=3"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "52"

  Scenario: As cabin crew I cannot get flight filtered by incorrect pagination
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?limit=1000&page=0"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "page": ["page must not be less than 1"],
          "limit": ["limit must not be greater than 100"]
        }
      }
      """

  Scenario: As an unauthorized user I can get flights list with public flights only
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "16"

  Scenario: As cabin crew I can list upcoming flights by scheduled off-block, earliest first
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?phase=upcoming&sort=scheduledOffBlockTime&order=asc&limit=5"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "26"
    And the response body property "0.flightNumber" should contain:
      """json
      "LH450"
      """
    And the response body property "3.flightNumber" should contain:
      """json
      "LH41"
      """

  Scenario: As cabin crew I can page through flights ordered by scheduled off-block
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?phase=upcoming&sort=scheduledOffBlockTime&order=asc&limit=2&page=2"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "26"
    And the response body property "1.flightNumber" should contain:
      """json
      "LH41"
      """

  Scenario: As cabin crew I can get the flight that arrived last
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?phase=finished&sort=actualOnBlockTime&order=desc&limit=1"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "3"
    And the response body property "0.flightNumber" should contain:
      """json
      "LH40"
      """

  Scenario: As cabin crew I cannot order flights by an unknown field or direction
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?sort=bogus&order=up"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "sort": ["sort must be one of the following values: createdAt, scheduledOffBlockTime, actualOnBlockTime"],
          "order": ["order must be one of the following values: asc, desc"]
        }
      }
      """
