Feature: Delete flight

  Scenario: As an admin I cannot delete a flight
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
    And I set database to initial state

  Scenario: As a cabin crew I cannot delete a flight
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

  Scenario: Deleting a flight removes its crew links but keeps the crew
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 201
    When I send a "DELETE" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 204
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
