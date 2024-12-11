Feature: Create aircraft resource

  Scenario: Update aircraft with correct data
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
    """json
    {
      "fullName": "Airbus A330-900 neo (CFM version)",
      "livery": "Lufthansa Classic (2024)"
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
      "shortName": "A330-900"
    }
    """

  Scenario: Update aircraft with incorrect data
    Given I use seed data
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
        "id": [
          "property id should not exist"
        ]
      }
    }
    """

  Scenario: Update aircraft that does not exist
    Given I use seed data
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

  Scenario: Update aircraft with incorrect uuid
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