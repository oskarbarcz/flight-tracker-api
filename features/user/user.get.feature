Feature: Get user

  Scenario: As an admin I can get one user
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf"
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

  Scenario: As operations I can get one user
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf"
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

  Scenario: As a cabin crew I cannot get one user
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot get user that does not exist
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/4f6c4f03-9214-43ae-b621-5229eb8ca6ba"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "User with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an admin I cannot get user with incorrect uuid
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

  Scenario: As an unauthorized user I cannot get user
    When I send a "GET" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
