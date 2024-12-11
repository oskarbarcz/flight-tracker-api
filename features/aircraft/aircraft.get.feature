Feature: Get aircraft resource

  Scenario: Get one aircraft
    Given I use seed data
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
      "shortName": "A330-900"
    }
    """

  Scenario: Get aircraft that does not exist
    Given I use seed data
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