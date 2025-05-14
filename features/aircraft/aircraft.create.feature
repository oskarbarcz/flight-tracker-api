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
        "livery": "Sunshine",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d"
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
        "livery": "Sunshine",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d"
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
        "livery": "Sunshine",
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        }
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
        "livery": "Sunshine",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d"
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
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "registration": ["registration should not be empty", "registration must be a string"],
          "selcal": ["selcal should not be empty", "selcal must be a string"],
          "shortName": ["shortName should not be empty", "shortName must be a string"],
          "operatorId": ["operatorId should not be empty", "operatorId must be a string"]
        }
      }
      """

  Scenario: As operations I cannot create aircraft with non-existing operator
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
        "livery": "Sunshine",
        "operatorId": "16b531c3-d817-4326-841c-2a4c243f9c1f"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Cannot find operator declared in the request."
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
        "livery": "Sunshine",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d"
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
