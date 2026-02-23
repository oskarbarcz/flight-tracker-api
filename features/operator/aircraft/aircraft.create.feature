Feature: Create aircraft for operator

  Scenario: As an admin I cannot create aircraft
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
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
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
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
    And I set database to initial state

  Scenario: As a cabin crew I cannot create aircraft with correct data
    Given I am signed in as "cabin crew"
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
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
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
          "shortName": ["shortName should not be empty", "shortName must be a string"]
        }
      }
      """

  Scenario: As operations I cannot create aircraft with non-existing operator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/aircraft" with body:
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
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I create aircraft with existing registration
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "icaoCode": "B748",
        "shortName": "747-8i",
        "selcal": "SL-PR",
        "fullName": "Boeing 747-8 Intercontinental",
        "registration": "D-AIMC",
        "livery": "Sunshine"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "Aircraft with given registration already exists."
      }
      """

  Scenario: As operations I cannot create aircraft with incorrect uuid
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/incorrect-uuid/aircraft" with body:
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
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot create aircraft
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
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
