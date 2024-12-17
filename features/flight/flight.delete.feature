Feature: Delete flight resource
  Scenario: Delete a flight
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete a flight that cannot be deleted
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/flight/23da8bc9-a21b-4678-b2e9-1151d3bd15ab"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Flight that has been scheduled cannot be removed.",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: Delete flight that does not exist
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/flight/ef95408a-bb6e-4f4e-9d87-6403164cb4df"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Delete flight with incorrect uuid
    When I send a "DELETE" request to "/api/v1/flight/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
