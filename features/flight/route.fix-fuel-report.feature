Feature: Report actual fuel over a fix of the planned route

  Scenario: As cabin crew I can report actual fuel over a fix while in cruise
    Given I set database to initial state
    And I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 200
    And the response body property "fixes.4.fuelReport" should contain:
      """json
      {
        "actualOnBoard": 7900,
        "reportedAt": "@date('within 1 minute from now')"
      }
      """
    And the response body property "fixes.3.fuelReport" should contain:
      """json
      null
      """
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route"
    Then the response status should be 200
    And the response body property "fixes.4.fuelReport" should contain:
      """json
      {
        "actualOnBoard": 7900,
        "reportedAt": "@date('within 1 minute from now')"
      }
      """

  Scenario: As cabin crew I can report fuel over a climb or descent fix while in cruise
    Given I set database to initial state
    And I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/1/fuel-report" with body:
      """json
      { "actualOnBoard": 10150 }
      """
    Then the response status should be 200
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/7/fuel-report" with body:
      """json
      { "actualOnBoard": 6400 }
      """
    Then the response status should be 200
    And the response body property "fixes.1.fuelReport.actualOnBoard" should contain:
      """json
      10150
      """
    And the response body property "fixes.7.fuelReport.actualOnBoard" should contain:
      """json
      6400
      """

  Scenario: As cabin crew reporting a fix again replaces the earlier figure
    Given I set database to initial state
    And I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 200
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7850 }
      """
    Then the response status should be 200
    And the response body property "fixes.4.fuelReport.actualOnBoard" should contain:
      """json
      7850
      """

  Scenario: As anyone I can read a reported figure in the briefing
    Given I set database to initial state
    And I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/etops-briefing"
    Then the response status should be 200
    And the response body property "route.fixes.4.fuelReport.actualOnBoard" should contain:
      """json
      7900
      """

  Scenario: As cabin crew I cannot report fuel while the flight is not in cruise
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot report fuel for flight that is not in cruise."
      }
      """

  Scenario: As operations I cannot report fuel over a fix
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot report fuel over a fix
    Given I am signed in as "admin"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot report fuel over a fix
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As cabin crew I cannot report fuel over a fix that is not on the route
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/99999999999/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Fix with given ordinal does not exist on the planned route."
      }
      """

  Scenario: As cabin crew I cannot report fuel on a flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/11111111-1111-4111-8111-111111111111/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 404

  Scenario: As cabin crew I cannot report fuel over a malformed fix ordinal
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/first/fuel-report" with body:
      """json
      { "actualOnBoard": 7900 }
      """
    Then the response status should be 400

  Scenario Outline: As cabin crew I cannot report a figure that is not a fuel mass
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/route/fix/4/fuel-report" with body:
      """json
      { "actualOnBoard": <value> }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "actualOnBoard": [<violation>]
        }
      }
      """

    Examples:
      | value   | violation                                       |
      | -1      | "actualOnBoard must not be less than 0"         |
      | 1000000 | "actualOnBoard must not be greater than 999999" |
      | 7900.5  | "actualOnBoard must be an integer number"       |
