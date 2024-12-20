Feature: List users resource

  Scenario: List users resource
    Given I use seed data
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 200
    And the response body should contain:
    """json
    [
      {
        "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
        "name": "John Doe",
        "email": "admin@example.com",
        "role": "Admin"
      },
      {
        "id": "721ab705-8608-4386-86b4-2f391a3655a7",
        "name": "Alice Doe",
        "email": "operations@example.com",
        "role": "Operations"
      },
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew"
      }
    ]
    """