Feature: List aircraft

  Scenario: As an admin I can list aircraft
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "fullName": "Airbus A330-900 neo",
          "icaoCode": "A339",
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "livery": "Fanhansa (2024)",
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "shortName": "Airbus A330"
        }
      ]
      """

  Scenario: As operations I can list aircraft
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 200

  Scenario: As an cabin crew I can list aircraft
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 200

  Scenario: As operations I cannot get aircraft list for non-existing operator
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/aircraft"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I cannot create aircraft with incorrect uuid
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/incorrect-uuid/aircraft"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot list aircraft
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
