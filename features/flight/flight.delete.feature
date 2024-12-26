Feature: Delete flight
  Scenario: As an admin I cannot delete a flight
    Given I use seed data
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I can delete a flight
    Given I use seed data
    Given I am signed in as "operations"
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

  Scenario: As a cabin crew I cannot delete a flight
    Given I use seed data
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I cannot delete a flight that has been marked as ready
    Given I use seed data
    Given I am signed in as "operations"
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

  Scenario: As operations I cannot delete flight that does not exist
    Given I use seed data
    Given I am signed in as "operations"
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

  Scenario: As operations I cannot delete flight with incorrect uuid
    Given I use seed data
    Given I am signed in as "operations"
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

  Scenario: As an unauthorized user I cannot delete flight
    When I send a "DELETE" request to "/api/v1/flight/incorrect-uuid"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
