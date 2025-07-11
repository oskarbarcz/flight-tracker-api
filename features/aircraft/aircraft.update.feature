Feature: Update aircraft

  Scenario: As an admin I cannot update aircraft with correct data
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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

  Scenario: As operations I can update aircraft with correct data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)",
        "operatorId": "1d85d597-c3a1-43cf-b888-10d674ea7a46"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "fullName": "Airbus A330-900 neo (CFM version)",
        "icaoCode": "A339",
        "livery": "Lufthansa Classic (2024)",
        "registration": "D-AIMC",
        "selcal": "LR-CK",
        "shortName": "Airbus A330",
        "operator": {
          "id": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "icaoCode": "LOT",
          "shortName": "LOT",
          "fullName": "Polskie Linie Lotnicze LOT",
          "callsign": "LOT"
        }
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update aircraft with correct data
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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

  Scenario: As operations I cannot update aircraft with incorrect data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "fullName": "Airbus A330-900 neo (CFM version)",
        "icaoCode": "A339"
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
          "id": ["property id should not exist"]
        }
      }
      """

  Scenario: As operations I cannot update aircraft with non-existing operator
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "operatorId": "5f61b6eb-6393-478c-88b5-56b29ec0a077"
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

  Scenario: As operations I cannot update aircraft that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/aircraft/d02c2edf-0365-4d68-a027-ecacfb1fb605"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update aircraft with incorrect uuid
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/aircraft/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot update aircraft
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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
