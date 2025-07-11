Feature: List users

  Scenario: As an admin I can list users
    Given I am signed in as "admin"
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
          "pilotLicenseId": null,
          "currentFlightId": null
        },
        {
          "id": "721ab705-8608-4386-86b4-2f391a3655a7",
          "name": "Alice Doe",
          "email": "operations@example.com",
          "role": "Operations",
          "pilotLicenseId": null,
          "currentFlightId": null
        },
        {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "email": "cabin-crew@example.com",
          "role": "CabinCrew",
          "pilotLicenseId": "UK-31270",
          "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e"
        }
      ]
      """

  Scenario: As an admin I can find user by pilot license ID
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user?pilotLicenseId=UK-31270"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "email": "cabin-crew@example.com",
          "role": "CabinCrew",
          "pilotLicenseId": "UK-31270",
          "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e"
        }
      ]
      """

  Scenario: As an admin I get non-existing pilot license ID
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user?pilotLicenseId=PL-00000"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As an admin I get 400 for invalid pilot license ID format
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user?pilotLicenseId=INVALID"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "pilotLicenseId": ["Pilot license ID does not match the required format."]
        }
      }
      """

  Scenario: As operations I cannot list users
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an operations I can find user by pilot license ID
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user?pilotLicenseId=UK-31270"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "email": "cabin-crew@example.com",
          "role": "CabinCrew",
          "pilotLicenseId": "UK-31270",
          "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e"
        }
      ]
      """

  Scenario: As a cabin crew I cannot list all users
    Given I am signed in as "cabin crew"
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

  Scenario: As an cabin crew I cannot find user by pilot license ID
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user?pilotLicenseId=UK-31270"
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
    When I send a "GET" request to "/api/v1/user"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
