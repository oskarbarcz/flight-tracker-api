Feature: Create operator

  Scenario: As an admin I cannot create operator
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator" with body:
      """json
      {
        "icaoCode": "UAL",
        "iataCode": "UA",
        "shortName": "United",
        "fullName": "United Airlines, Inc.",
        "callsign": "UNITED"
      }
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

  Scenario: As operations I can create operator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator" with body:
      """json
      {
        "icaoCode": "UAL",
        "iataCode": "UA",
        "shortName": "United",
        "fullName": "United Airlines, Inc.",
        "callsign": "UNITED"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "icaoCode": "UAL",
        "iataCode": "UA",
        "shortName": "United",
        "fullName": "United Airlines, Inc.",
        "callsign": "UNITED",
        "type": "legacy",
        "hubs": [],
        "fleetSize": 0,
        "fleetTypes": [],
        "avgFleetAge": 5,
        "logoUrl": null,
        "backgroundUrl": null,
        "continent": "europe"
      }
      """
    And I set database to initial state

  Scenario: As operations I can create operator with additional fields
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator" with body:
      """json
      {
        "icaoCode": "WZZ",
        "iataCode": "W6",
        "shortName": "Wizz Air",
        "fullName": "Wizz Air Hungary",
        "callsign": "WIZZAIR",
        "type": "low_cost",
        "hubs": ["BUD"],
        "avgFleetAge": 10,
        "logoUrl": "https://example.com/logo.png",
        "backgroundUrl": "https://example.com/background.png",
        "continent": "europe"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "icaoCode": "WZZ",
        "iataCode": "W6",
        "shortName": "Wizz Air",
        "fullName": "Wizz Air Hungary",
        "callsign": "WIZZAIR",
        "type": "low_cost",
        "hubs": ["BUD"],
        "avgFleetAge": 10,
        "logoUrl": "https://example.com/logo.png",
        "backgroundUrl": "https://example.com/background.png",
        "continent": "europe",
        "fleetSize": 0,
        "fleetTypes": []
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot create operator
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator" with body:
      """json
      {
        "icaoCode": "UAL",
        "iataCode": "UA",
        "shortName": "United",
        "fullName": "United Airlines, Inc.",
        "callsign": "UNITED"
      }
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

  Scenario: As operations I cannot operator with incorrect data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator" with body:
      """json
      {
        "icaoCode": "CDG",
        "shortName": "Condor Copy"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "fullName": ["fullName should not be empty", "fullName must be a string"],
          "callsign": ["callsign should not be empty", "callsign must be a string"],
          "iataCode": [
            "iataCode should not be empty",
            "iataCode must be longer than or equal to 2 characters",
            "iataCode must be a string"
          ]
        }
      }
      """

  Scenario: As an unauthorized user I cannot create operator
    When I send a "POST" request to "/api/v1/operator" with body:
      """json
      {
        "icaoCode": "UAL",
        "iataCode": "UA",
        "shortName": "United",
        "fullName": "United Airlines, Inc.",
        "callsign": "UNITED"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
