Feature: Create operator resource

  Scenario: Create operator with correct data
    Given I use seed data
    When I send a "POST" request to "/api/v1/operator" with body:
    """json
    {
      "icaoCode": "UAL",
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
      "shortName": "United",
      "fullName": "United Airlines, Inc.",
      "callsign": "UNITED"
    }
    """

  Scenario: Create operator with incorrect data
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
        "fullName": [
          "fullName should not be empty",
          "fullName must be a string"
        ],
        "callsign": [
          "callsign should not be empty",
          "callsign must be a string"
        ]
      }
    }
    """
