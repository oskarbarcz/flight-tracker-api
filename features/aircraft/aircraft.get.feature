Feature: Get aircraft

  Scenario: As an admin I can get one aircraft
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "fullName": "Airbus A330-900 neo",
        "icaoCode": "A339",
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "livery": "Fanhansa (2024)",
        "registration": "D-AIMC",
        "selcal": "LR-CK",
        "shortName": "Airbus A330",
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        }
      }
      """

  Scenario: As operations I can get one aircraft
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "fullName": "Airbus A330-900 neo",
        "icaoCode": "A339",
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "livery": "Fanhansa (2024)",
        "registration": "D-AIMC",
        "selcal": "LR-CK",
        "shortName": "Airbus A330",
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        }
      }
      """

  Scenario: As a cabin crew I can get one aircraft
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "fullName": "Airbus A330-900 neo",
        "icaoCode": "A339",
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "livery": "Fanhansa (2024)",
        "registration": "D-AIMC",
        "selcal": "LR-CK",
        "shortName": "Airbus A330",
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        }
      }
      """

  Scenario: Get aircraft that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/aircraft/0e37fd75-141d-4f01-b040-bcde2f7be839"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Get aircraft with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/aircraft/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot get one aircraft
    When I send a "GET" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
