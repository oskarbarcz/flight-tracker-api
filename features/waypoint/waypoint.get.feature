Feature: Read a catalogued waypoint

  Waypoints are accumulated from the flight plans the system imports. Nothing is catalogued
  until a plan publishes it.

  Scenario: A waypoint no imported plan has published is not known
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "GET" request to "/api/v1/waypoint/MALOT"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Waypoint with given identifier is not known.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Importing a flight plan catalogues the waypoints along its route
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/waypoint/MALOT"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "ident": "MALOT",
          "icaoRegion": "EI",
          "kind": "waypoint",
          "location": {
            "latitude": 54,
            "longitude": -15
          },
          "frequency": null,
          "lastSeenAt": "@date('within 1 minute from now')"
        }
      ]
      """

  Scenario: A navaid is catalogued with its frequency
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/waypoint/SPI"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "ident": "SPI",
          "icaoRegion": "EB",
          "kind": "navaid",
          "location": {
            "latitude": 50.514444,
            "longitude": 4.646667
          },
          "frequency": 113.1,
          "lastSeenAt": "@date('within 1 minute from now')"
        }
      ]
      """

  Scenario: The top of climb is not catalogued as a waypoint
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/waypoint/TOC"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Waypoint with given identifier is not known.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: An airport on the route is not catalogued as a waypoint
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/waypoint/KJFK"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Waypoint with given identifier is not known.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Importing the same plan twice does not duplicate a waypoint
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/waypoint/MALOT"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "ident": "MALOT",
          "icaoRegion": "EI",
          "kind": "waypoint",
          "location": {
            "latitude": 54,
            "longitude": -15
          },
          "frequency": null,
          "lastSeenAt": "@date('within 1 minute from now')"
        }
      ]
      """

  Scenario: An unauthenticated user cannot read the catalogue
    When I send a "GET" request to "/api/v1/waypoint/MALOT"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
