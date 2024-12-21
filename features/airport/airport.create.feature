Feature: Create airport

  Scenario: As an admin I cannot create airport
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport" with body:
    """json
    {
      "icaoCode": "KMIA",
      "name": "Miami Intl",
      "country": "United States of America",
      "timezone": "America/New_York"
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

  Scenario: As operations I can create airport
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As a cabin crew I cannot create airport
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport" with body:
    """json
    {
      "icaoCode": "KMIA",
      "name": "Miami Intl",
      "country": "United States of America",
      "timezone": "America/New_York"
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

  Scenario: As operations I cannot create airport with incorrect data
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As an unauthorized user I cannot create airport
    Given I use seed data
    When I send a "POST" request to "/api/v1/airport" with body:
    """json
    {
      "icaoCode": "KMIA",
      "name": "Miami Intl"
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
