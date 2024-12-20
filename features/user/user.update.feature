Feature: Update user resource

  Scenario: Change user name and email
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
    """json
    {
      "name": "John Alfred Doe",
      "email": "john.doe@example.com"
    }
    """
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
      "name": "John Alfred Doe",
      "email": "john.doe@example.com",
      "role": "Admin"
    }
    """

  Scenario: Change user password
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
    """json
    {
      "password": "NeWsTr0nGP@$$w0rd"
    }
    """
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

  Scenario: Change user role
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
    """json
    {
      "role": "CabinCrew"
    }
    """
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
      "name": "John Doe",
      "email": "admin@example.com",
      "role": "CabinCrew"
    }
    """

  Scenario: Create user with incorrect data
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
    """json
    {
      "name": "",
      "role": "IncorrectRole"
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
        "name": [
          "name should not be empty"
        ],
        "role": [
          "role must be one of the following values: CabinCrew, Operations, Admin"
        ]
      }
    }
    """

  Scenario: Update with incorrect uuid
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
