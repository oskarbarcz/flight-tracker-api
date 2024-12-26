Feature: Create aircraft

  Scenario: As an admin I cannot create aircraft
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/aircraft" with body:
    """json
    {
      "icaoCode": "B748",
      "shortName": "747-8i",
      "selcal": "SL-PR",
      "fullName": "Boeing 747-8 Intercontinental",
      "registration": "SP-LRA",
      "livery": "Sunshine"
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

  Scenario: As operations I create aircraft
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/aircraft" with body:
    """json
    {
      "icaoCode": "B748",
      "shortName": "747-8i",
      "selcal": "SL-PR",
      "fullName": "Boeing 747-8 Intercontinental",
      "registration": "SP-LRA",
      "livery": "Sunshine"
    }
    """
    Then the response status should be 201
    And the response body should contain:
    """json
    {
      "id": "@uuid",
      "icaoCode": "B748",
      "shortName": "747-8i",
      "selcal": "SL-PR",
      "fullName": "Boeing 747-8 Intercontinental",
      "registration": "SP-LRA",
      "livery": "Sunshine"
    }
    """

  Scenario: As a cabin crew I cannot create aircraft with correct data
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/aircraft" with body:
    """json
    {
      "icaoCode": "B748",
      "shortName": "747-8i",
      "selcal": "SL-PR",
      "fullName": "Boeing 747-8 Intercontinental",
      "registration": "SP-LRA",
      "livery": "Sunshine"
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

  Scenario: As operations I cannot create aircraft with incorrect data
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As an unauthorized user I cannot create aircraft
    Given I use seed data
    When I send a "POST" request to "/api/v1/aircraft" with body:
    """json
    {
      "icaoCode": "B748",
      "shortName": "747-8i",
      "selcal": "SL-PR",
      "fullName": "Boeing 747-8 Intercontinental",
      "registration": "SP-LRA",
      "livery": "Sunshine"
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
