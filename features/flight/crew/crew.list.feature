Feature: List crew for a flight

  Scenario: As an admin I can list a flight's crew
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew"
    Then the response status should be 200

  Scenario: As operations I can list a flight's crew
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "447c5e6d-0e88-4362-ab12-285677d5bbd3",
          "name": "James Carter",
          "email": "james.carter@americanairlines.com",
          "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "role": "fo",
          "createdAt": "2025-01-01T00:00:00.000Z"
        },
        {
          "id": "f4fde12f-64c6-40a4-9e89-ccca6d652101",
          "name": "Susan Brooks",
          "email": "susan.brooks@americanairlines.com",
          "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "role": "pu",
          "createdAt": "2025-01-01T00:00:00.000Z"
        },
        {
          "id": "6a0ecac2-4771-422b-8de2-5936c2546341",
          "name": "Emily Ross",
          "email": "emily.ross@americanairlines.com",
          "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "role": "fa",
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I can list a flight's crew
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew"
    Then the response status should be 200

  Scenario: A flight with no assigned crew returns an empty list
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/23da8bc9-a21b-4678-b2e9-1151d3bd15ab/crew"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As operations I cannot list crew for a flight that does not exist
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/ef95408a-bb6e-4f4e-9d87-6403164cb4df/crew"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot list a flight's crew
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
