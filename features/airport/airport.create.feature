Feature: Create aircraft resource

  Scenario: Create airport with correct data
    Given I use seed data
    When I send a "POST" request to "/api/v1/airport" with body:
    """json
    {
      "icaoCode": "KMIA",
      "name": "Miami Intl",
      "country": "United States of America",
      "timezone": "America/New_York"
    }
    """
    Then the response status should be 201
    And the response body should contain:
    """json
    {
      "id": "@uuid",
      "icaoCode": "KMIA",
      "name": "Miami Intl",
      "country": "United States of America",
      "timezone": "America/New_York"
    }
    """

  Scenario: Create aircraft with incorrect data
    When I send a "POST" request to "/api/v1/aircraft" with body:
    """json
    {
      "icaoCode": "B748",
      "fullName": "Boeing 747-8 Intercontinental",
      "livery": "Sunshine"
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
        "registration": [
          "registration should not be empty",
           "registration must be a string"
        ],
        "selcal": [
          "selcal should not be empty",
          "selcal must be a string"
        ],
        "shortName": [
          "shortName should not be empty",
          "shortName must be a string"
        ]
      }
    }
    """
