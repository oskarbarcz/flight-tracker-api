Feature: Delete airport resource

  Scenario: Delete airport
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Airport with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete airport that is already in use
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Cannot remove airport that is already in use by any of flights.",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: Delete airport that does not exist
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/airport/0e37fd75-141d-4f01-b040-bcde2f7be839"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Airport with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete airport with incorrect uuid
    When I send a "DELETE" request to "/api/v1/airport/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
