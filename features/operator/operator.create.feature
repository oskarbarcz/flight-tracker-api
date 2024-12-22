Feature: Create operator

  Scenario: As an admin I cannot create operator
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator" with body:
    """json
    {
      "icaoCode": "UAL",
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

  Scenario: As operations I cannot create operator
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As a cabin crew I cannot create operator
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator" with body:
    """json
    {
      "icaoCode": "UAL",
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
    Given I use seed data
    And I am signed in as "operations"
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

    Scenario: As an unauthorized user I cannot create operator
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
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
