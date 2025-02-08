Feature: Delete operator

  Scenario: As an admin I cannot delete operator
    Given I use seed data
    And I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I can delete operator
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Operator with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: As a cabin crew I cannot delete operator
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I cannot delete operator that has aircraft assigned
    Given I use seed data
    And I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "statusCode": 400,
      "error": "Bad Request",
      "message": "Operator cannot be deleted because it has flights scheduled."
    }
    """

  Scenario: As operations I cannot delete operator that does not exist
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As operations I cannot delete operator with incorrect uuid
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As an unauthorized user I cannot delete operator
    Given I use seed data
    When I send a "DELETE" request to "/api/v1/operator/5c00f71c-287c-4bca-a738-caf7e2669c65"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
