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
          "currentFlightId": null,
          "currentRotationId": null
        },
        {
          "id": "721ab705-8608-4386-86b4-2f391a3655a7",
          "name": "Alice Doe",
          "email": "operations@example.com",
          "role": "Operations",
          "pilotLicenseId": null,
          "currentFlightId": null,
          "currentRotationId": null
        },
        {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "email": "cabin-crew@example.com",
          "role": "CabinCrew",
          "pilotLicenseId": "UK-31270",
          "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
          "currentRotationId": null
        },
        {
          "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "name": "Alan Doe",
          "email": "alan.doe@example.com",
          "role": "CabinCrew",
          "pilotLicenseId": "UK-34560",
          "currentFlightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "currentRotationId": null
        },
        {
          "id": "629be07f-5e65-429a-9d69-d34b99185f50",
          "name": "Michael Doe",
          "email": "michael.doe@example.com",
          "role": "CabinCrew",
          "pilotLicenseId": "UK-98540",
          "currentFlightId": "d4a25ef2-39cf-484c-af00-a548999e8699",
          "currentRotationId": "c2e12afb-a712-45aa-9ba5-fec71868e59a"
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
          "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
          "currentRotationId": null
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
