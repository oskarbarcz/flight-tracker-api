Feature: Update own profile

  Scenario: As a cabin crew I can change my own name and pilot license
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "Rick Alfred Doe",
        "pilotLicenseId": "UK-99887"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Alfred Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-99887",
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
    And I set database to initial state

  Scenario: As an admin I can change my own name
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "John Alfred Doe"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
        "name": "John Alfred Doe",
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
    And I set database to initial state

  Scenario: As a cabin crew I can change my name without losing my pilot license
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "Rick Alfred Doe"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Alfred Doe",
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
    And I set database to initial state

  Scenario: As a cabin crew I can clear my own pilot license
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "pilotLicenseId": null
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
        "pilotLicenseId": null,
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
    And I set database to initial state

  Scenario: As a cabin crew I cannot promote myself
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "Rick Alfred Doe",
        "role": "Admin"
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
          "role": ["property role should not exist"]
        }
      }
      """

  Scenario: As a cabin crew I cannot change my credentials through my profile
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "email": "rick.doe@example.com",
        "password": "NeWsTr0nGP@$$w0rd"
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
          "email": ["property email should not exist"],
          "password": ["property password should not exist"]
        }
      }
      """

  Scenario: As a cabin crew I cannot change system maintained details through my profile
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
        "currentFlightId": null,
        "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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
          "id": ["property id should not exist"],
          "currentFlightId": ["property currentFlightId should not exist"],
          "lastAirportId": ["property lastAirportId should not exist"]
        }
      }
      """

  Scenario: As a cabin crew I can change my own home airport
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "homeAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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
        "pilotLicenseId": "UK-31270",
        "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
        "homeAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
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
    And I set database to initial state

  Scenario: As a cabin crew I can set my own Simbrief user ID
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "simbriefUserId": "987654"
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
        "pilotLicenseId": "UK-31270",
        "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
        "homeAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportUpdatedAt": null,
        "simbriefUserId": "987654",
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
    And I set database to initial state

  Scenario: As operations I can set my own Simbrief user ID
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "simbriefUserId": "987654"
      }
      """
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
        "simbriefUserId": "987654",
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
    And I set database to initial state

  Scenario: As a cabin crew I can clear my own Simbrief user ID
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "simbriefUserId": null
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
    And I set database to initial state

  Scenario: As operations I cannot give myself a home airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "homeAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Only CabinCrew can have a home airport.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As a cabin crew I cannot clear my own home airport
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "homeAirportId": null
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
          "homeAirportId": ["homeAirportId must be a UUID"]
        }
      }
      """

  Scenario: As a cabin crew I cannot set a malformed home airport
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "homeAirportId": "not-an-airport"
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
          "homeAirportId": ["homeAirportId must be a UUID"]
        }
      }
      """

  Scenario: As a cabin crew I cannot set a home airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "homeAirportId": "6a26aa32-2c1a-4f3e-9d1c-4c9a5f80f8b1"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
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

  Scenario: As operations I cannot give myself a pilot license
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
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

  Scenario: As a cabin crew I cannot set a malformed pilot license
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "pilotLicenseId": "UK-123"
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
          "pilotLicenseId": ["Pilot license ID does not match the required format."]
        }
      }
      """

  Scenario: As an unauthorized user I cannot update a profile
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "Rick Alfred Doe"
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

  Scenario: My updated profile is visible immediately in my own user data
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "Rick Alfred Doe",
        "pilotLicenseId": "UK-99887"
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Alfred Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-99887",
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
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "name": "Rick Doe",
        "pilotLicenseId": "UK-31270"
      }
      """
    Then the response status should be 200
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
    And I set database to initial state

  Scenario: As a cabin crew I can choose my own default weather source
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "defaultWeatherSource": "say_intentions"
      }
      """
    Then the response status should be 200
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
        "defaultWeatherSource": "say_intentions",
        "emails": [
          {
            "email": "cabin-crew@example.com",
            "isConfirmed": true,
            "active": true
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "17349a5b-a0f3-4740-b04a-6493576fdccd",
          "source": "say_intentions",
          "informationType": "atis",
          "content": "Warsaw Chopin airport, information Sierra. 1030 Zulu. Arriving runway 11. Departing runway 15. Wind 150 at 9. CAVOK. Temperature 29, dewpoint 12. QNH 1013. Transition level 80. Advise on initial contact you have information Sierra.",
          "lastFetched": "2026-07-08T11:30:00.000Z"
        },
        {
          "id": "029388aa-805a-4de8-89bb-a3ac4db9a88f",
          "source": "say_intentions",
          "informationType": "metar",
          "content": "EPWA 101030Z 15009KT 130V190 CAVOK 29/12 Q1013 NOSIG",
          "lastFetched": "2026-07-08T11:30:00.000Z"
        },
        {
          "id": "51f1542c-243f-4114-adf9-164e6a22b458",
          "source": "say_intentions",
          "informationType": "taf",
          "content": "TAF EPWA 100830Z 1009/1109 17007KT CAVOK BECMG 1010/1013 26012KT",
          "lastFetched": "2026-07-08T11:30:00.000Z"
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot set a default weather source the system does not collect from
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me" with body:
      """json
      {
        "defaultWeatherSource": "all"
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
          "defaultWeatherSource": [
            "defaultWeatherSource must be one of the following values: aviation_weather_gov, say_intentions"
          ]
        }
      }
      """
