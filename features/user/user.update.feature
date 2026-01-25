Feature: Update user

  Scenario: As an admin I can change user name and email
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "name": "John Alfred Doe",
        "email": "john.doe@example.com",
        "simbriefUserId": "123456"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
        "name": "John Alfred Doe",
        "email": "john.doe@example.com",
        "role": "Admin",
        "pilotLicenseId": null,
        "currentFlightId": null,
        "currentRotationId": null
      }
      """
    And I set database to initial state

  Scenario: As an admin I can change user password
    Given I am signed in as "admin"
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
        "role": "Admin",
        "pilotLicenseId": null,
        "currentFlightId": null,
        "currentRotationId": null
      }
      """
    And I set database to initial state

  Scenario: As an admin I can change user role
    Given I am signed in as "admin"
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
        "role": "CabinCrew",
        "pilotLicenseId": null,
        "currentFlightId": null,
        "currentRotationId": null
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot change user name and email
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "name": "John Alfred Doe",
        "email": "john.doe@example.com"
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

  Scenario: As operations I cannot change user password
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "password": "NeWsTr0nGP@$$w0rd"
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

  Scenario: As operations I cannot change user role
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "role": "CabinCrew"
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

  Scenario: As a cabin crew I cannot change user name and email
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "name": "John Alfred Doe",
        "email": "john.doe@example.com"
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

  Scenario: As a cabin crew I cannot change user password
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "password": "NeWsTr0nGP@$$w0rd"
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

  Scenario: As a cabin crew I cannot change user role
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "role": "CabinCrew"
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

  Scenario: As an admin I can set pilotLicenseId for CabinCrew user
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d" with body:
      """json
      {
        "pilotLicenseId": "UK-12345"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-12345",
        "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
        "currentRotationId": null
      }
      """
    And I set database to initial state

  Scenario: As an admin I cannot set pilotLicenseId for other user
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "pilotLicenseId": "UK-12345"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Only CabinCrew can have a pilot license ID.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an admin I cannot create user with incorrect data
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "name": "",
        "role": "IncorrectRole",
        "pilotLicenseId": ""
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "name": ["name should not be empty"],
          "role": ["role must be one of the following values: CabinCrew, Operations, Admin"],
          "pilotLicenseId": ["Pilot license ID does not match the required format."]
        }
      }
      """

  Scenario: As an admin I cannot update user with incorrect uuid
    Given I am signed in as "admin"
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

  Scenario: As an unauthorized user I cannot change user name and email
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "name": "John Alfred Doe",
        "email": "john.doe@example.com"
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

  Scenario: As an unauthorized user I cannot change user password
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "password": "NeWsTr0nGP@$$w0rd"
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

  Scenario: As an unauthorized user I cannot change user role
    When I send a "PATCH" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf" with body:
      """json
      {
        "role": "CabinCrew"
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
