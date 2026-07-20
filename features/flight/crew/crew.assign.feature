Feature: Assign a crew member to a flight

  Scenario: As an admin I cannot assign crew to a flight
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can assign a crew member of the flight's operator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 201
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
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot assign crew to a flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations assigning the same crew member twice is idempotent
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 201
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 201
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
        }
      ]
      """
    And I set database to initial state

  Scenario: As operations I cannot assign a crew member of a different operator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "22772d9d-5e77-4e6a-9f82-b5329440febe" }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "Crew member does not belong to the flight operator.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As operations I cannot assign a crew member that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "ef95408a-bb6e-4f4e-9d87-6403164cb4df" }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Crew member with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot assign crew to a flight that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/ef95408a-bb6e-4f4e-9d87-6403164cb4df/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot assign crew after boarding is finished
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/d085c107-308d-48e6-9c93-beca6552a8a3/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot assign or unassign crew after boarding has finished.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As an unauthorized user I cannot assign crew to a flight
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/crew" with body:
      """json
      { "crewId": "447c5e6d-0e88-4362-ab12-285677d5bbd3" }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
