Feature: Get current user

  Scenario: As an admin I see my user data
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me"
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
        "homeAirportId": null,
        "lastAirportId": null,
        "lastAirportUpdatedAt": null,
        "simbriefUserId": null,
        "defaultWeatherSource": "aviation_weather_gov",
        "emails": [
          {
            "email": "admin@example.com",
            "isConfirmed": true,
            "active": true
          }
        ]
      }
      """

  Scenario: As operations I see my user data
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "721ab705-8608-4386-86b4-2f391a3655a7",
        "name": "Alice Doe",
        "email": "operations@example.com",
        "role": "Operations",
        "pilotLicenseId": null,
        "currentFlightId": null,
        "homeAirportId": null,
        "lastAirportId": null,
        "lastAirportUpdatedAt": null,
        "simbriefUserId": null,
        "defaultWeatherSource": "say_intentions",
        "emails": [
          {
            "email": "operations@example.com",
            "isConfirmed": true,
            "active": true
          }
        ]
      }
      """

  Scenario: As a cabin crew I see my user data
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-31270",
        "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
        "homeAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportUpdatedAt": null,
        "simbriefUserId": null,
        "defaultWeatherSource": "aviation_weather_gov",
        "emails": [
          {
            "email": "cabin-crew@example.com",
            "isConfirmed": true,
            "active": true
          }
        ]
      }
      """

  Scenario: I see my address as unconfirmed when nobody ever proved it
    Given I am signed in as "operations with Simbrief ID but empty etops"
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "c341231b-7aa0-47a1-ad23-636cbd959442",
        "name": "Emma Doe",
        "email": "emma.doe@example.com",
        "role": "Operations",
        "pilotLicenseId": null,
        "currentFlightId": null,
        "homeAirportId": null,
        "lastAirportId": null,
        "lastAirportUpdatedAt": null,
        "simbriefUserId": "333444",
        "defaultWeatherSource": "aviation_weather_gov",
        "emails": [
          {
            "email": "emma.doe@example.com",
            "isConfirmed": false,
            "active": true
          }
        ]
      }
      """

  Scenario: A confirmed email change leaves me with one confirmed address
    Given I clear sent emails directory
    And I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/user/me/change-email" with body:
      """json
      {
        "newEmail": "alan.new@example.com",
        "currentPassword": "P@$$w0rd"
      }
      """
    Then the response status should be 202
    When I send a "POST" request to "/api/v1/user/me/change-email/confirm" with the token from the email to "alan.new@example.com"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "name": "Alan Doe",
        "email": "alan.new@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-34560",
        "currentFlightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
        "homeAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "lastAirportUpdatedAt": null,
        "simbriefUserId": null,
        "defaultWeatherSource": "aviation_weather_gov",
        "emails": [
          {
            "email": "alan.new@example.com",
            "isConfirmed": true,
            "active": true
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I have proper error message
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
