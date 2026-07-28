Feature: List crew for operator

  Scenario: As an admin I can list operator crew
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46/crew"
    Then the response status should be 200

  Scenario: As operations I can list operator crew
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46/crew"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "22772d9d-5e77-4e6a-9f82-b5329440febe",
          "name": "Piotr Lewandowski",
          "email": "piotr.lewandowski@lot.com",
          "operatorId": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "role": "fo",
          "createdAt": "2025-01-01T00:00:00.000Z"
        },
        {
          "id": "99d37979-dd64-47e2-9517-ebffe3984124",
          "name": "Marek Zielinski",
          "email": "marek.zielinski@lot.com",
          "operatorId": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "role": "pu",
          "createdAt": "2025-01-01T00:00:00.000Z"
        },
        {
          "id": "f96c4581-a3a5-48c5-a3d0-f628ba05fc22",
          "name": "Anna Nowak",
          "email": "anna.nowak@lot.com",
          "operatorId": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "role": "fa",
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ]
      """

  Scenario: As cabin crew I can list operator crew
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46/crew"
    Then the response status should be 200

  Scenario: As operations I cannot list crew for a non-existing operator
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/crew"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I cannot list crew with an invalid operator ID
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/incorrect-uuid/crew"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot list crew
    When I send a "GET" request to "/api/v1/operator/1d85d597-c3a1-43cf-b888-10d674ea7a46/crew"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
