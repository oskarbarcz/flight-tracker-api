Feature: List users

  Scenario: As an admin I can list users
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 200
    And the response body should contain:
    """json
    [
      {
        "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
        "name": "John Doe",
        "email": "admin@example.com",
        "role": "Admin",
        "currentFlightId": null
      },
      {
        "id": "721ab705-8608-4386-86b4-2f391a3655a7",
        "name": "Alice Doe",
        "email": "operations@example.com",
        "role": "Operations",
        "currentFlightId": null
      },
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e"
      }
    ]
    """

  Scenario: As operations I cannot list users
    Given I use seed data
    And I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As a cabin crew I cannot list users
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As an unauthorized user I cannot list users
    Given I use seed data
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
