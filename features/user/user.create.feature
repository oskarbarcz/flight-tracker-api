Feature: Create user

  Scenario: As an admin I can create user
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user" with body:
      """json
      {
        "name": "Anna Doe",
        "email": "anna.doe@example.com",
        "password": "P@$$w0rd",
        "role": "Admin"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "name": "Anna Doe",
        "email": "anna.doe@example.com",
        "role": "Admin",
        "currentFlightId": null
      }
      """

  Scenario: As operations I cannot create user
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user" with body:
      """json
      {
        "name": "Anna Doe",
        "email": "anna.doe@example.com",
        "password": "P@$$w0rd",
        "role": "Admin"
      }
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

  Scenario: As a cabin crew I cannot create user
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user" with body:
      """json
      {
        "name": "Anna Doe",
        "email": "anna.doe@example.com",
        "password": "P@$$w0rd",
        "role": "Admin"
      }
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

  Scenario: As an admin I cannot create user with incorrect data
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user" with body:
      """json
      {
        "name": "Anna Doe"
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
          "email": ["email should not be empty", "email must be a string"],
          "password": ["password should not be empty", "password must be a string"],
          "role": [
            "role must be one of the following values: CabinCrew, Operations, Admin",
            "role should not be empty",
            "role must be a string"
          ]
        }
      }
      """

  Scenario: As an admin I cannot create user with email that is actually registered
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user" with body:
      """json
      {
        "name": "John Doe",
        "email": "admin@example.com",
        "password": "P@$$w0rd",
        "role": "Admin"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "User with given email already exists.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot create user
    Given I use seed data
    When I send a "POST" request to "/api/v1/user" with body:
      """json
      {
        "name": "Anna Doe",
        "email": "anna.doe@example.com",
        "password": "P@$$w0rd",
        "role": "Admin"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
