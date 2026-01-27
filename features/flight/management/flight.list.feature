Feature: Get flights list

  Scenario: As an admin I can get flights list
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200

  Scenario: As operations I can get flight
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200

  Scenario: As a cabin crew I can get flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 200

  Scenario: As cabin crew I can get flight filtered by flight phase
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight?phase=upcoming"
    Then the response status should be 200

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
          "phase": ["phase must be one of the following values: upcoming, ongoing, finished"]
        }
      }
      """
    And I dump response

  Scenario: As an unauthorized user I cannot get flights list
    When I send a "GET" request to "/api/v1/flight"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
