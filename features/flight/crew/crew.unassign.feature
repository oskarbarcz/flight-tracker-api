Feature: Unassign a crew member from a flight

  Scenario: As an admin I cannot unassign a crew member from a flight
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew/447c5e6d-0e88-4362-ab12-285677d5bbd3"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can unassign a crew member from a flight
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew/447c5e6d-0e88-4362-ab12-285677d5bbd3"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/crew"
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
    And I set database to initial state

  Scenario: As a cabin crew I cannot unassign a crew member from a flight
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew/447c5e6d-0e88-4362-ab12-285677d5bbd3"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot unassign crew after boarding is finished
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/flight/d085c107-308d-48e6-9c93-beca6552a8a3/crew/447c5e6d-0e88-4362-ab12-285677d5bbd3"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot assign or unassign crew after boarding has finished.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As an unauthorized user I cannot unassign a crew member from a flight
    When I send a "DELETE" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/crew/447c5e6d-0e88-4362-ab12-285677d5bbd3"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
