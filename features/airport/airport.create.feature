Feature: Create airport resource

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

  Scenario: Create airport with incorrect data
    When I send a "POST" request to "/api/v1/airport" with body:
    """json
    {
      "icaoCode": "KMIA",
      "name": "Miami Intl"
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
        "country": [
          "country should not be empty",
          "country must be a string"
        ],
        "timezone": [
          "timezone should not be empty",
          "timezone must be a valid IANA time-zone",
          "timezone must be a string"
        ]
      }
    }
    """
