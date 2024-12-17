Feature: Delete aircraft resource

  Scenario: Delete aircraft
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Aircraft with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete aircraft that is already in use
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Aircraft with given id does not exist.",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: Delete aircraft that does not exist
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/aircraft/0e37fd75-141d-4f01-b040-bcde2f7be839"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Aircraft with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete aircraft with incorrect uuid
    When I send a "DELETE" request to "/api/v1/aircraft/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
