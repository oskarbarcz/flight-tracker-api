Feature: Get user resource

  Scenario: Get one user
    Given I use seed data
    When I send a "GET" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
      "name": "John Doe",
      "email": "admin@example.com",
      "role": "Admin"
    }
    """

  Scenario: Get user that does not exist
    Given I use seed data
    When I send a "GET" request to "/api/v1/user/4f6c4f03-9214-43ae-b621-5229eb8ca6ba"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "User with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Get user with incorrect uuid
    When I send a "GET" request to "/api/v1/user/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
