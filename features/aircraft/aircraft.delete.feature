Feature: Delete aircraft

  Scenario: As an admin I cannot delete aircraft
    Given I use seed data
    And I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I can delete aircraft
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Aircraft with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: As a cabin crew I cannot delete aircraft
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I cannot delete aircraft that is already in use
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Cannot remove aircraft that is used by any of flights.",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: As operations I cannot delete aircraft that does not exist
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As operations I cannot delete aircraft with incorrect uuid
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As an unauthorized user I cannot delete aircraft
    When I send a "DELETE" request to "/api/v1/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
