Feature: Delete operator resource

  Scenario: Delete operator with correct data
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Operator with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete operator that does not exist
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/operator/86e77d4e-cb83-48fa-bbf7-62a9953e475f"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Operator with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete operator with incorrect uuid
    When I send a "DELETE" request to "/api/v1/operator/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
