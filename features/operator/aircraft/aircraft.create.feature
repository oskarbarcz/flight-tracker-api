Feature: Create aircraft for operator

  Scenario: As an admin I cannot create aircraft
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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

  Scenario: As operations I create aircraft
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airframe": {
          "type": "B748",
          "name": "Boeing 747-8",
          "cruiseSpeed": { "value": 0.85, "unit": "mach" },
          "serviceCeiling": 43100,
          "performanceCode": "D",
          "weightCategory": "super"
        },
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "currentState": "idle",
        "etopsThresholdMinutes": null,
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "icaoCode": "DLH",
        "iataCode": "LH",
        "shortName": "Lufthansa",
        "fullName": "Deutsche Lufthansa AG",
        "callsign": "LUFTHANSA",
        "type": "legacy",
        "hubs": ["FRA", "MUC"],
        "fleetSize": 9,
        "fleetTypes": ["A339", "B748"],
        "avgFleetAge": 14.2,
        "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
        "backgroundUrl": null,
        "continent": "europe",
        "alliance": "star_alliance",
        "group": "lufthansa_group"
      }
      """
    And I set database to initial state

  Scenario: As operations I create an ETOPS-certified aircraft
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "etopsThresholdMinutes": 180
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airframe": {
          "type": "B748",
          "name": "Boeing 747-8",
          "cruiseSpeed": { "value": 0.85, "unit": "mach" },
          "serviceCeiling": 43100,
          "performanceCode": "D",
          "weightCategory": "super"
        },
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "currentState": "idle",
        "etopsThresholdMinutes": 180,
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I create aircraft without a SELCAL code
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airframe": {
          "type": "B748",
          "name": "Boeing 747-8",
          "cruiseSpeed": { "value": 0.85, "unit": "mach" },
          "serviceCeiling": 43100,
          "performanceCode": "D",
          "weightCategory": "super"
        },
        "selcal": null,
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "currentState": "idle",
        "etopsThresholdMinutes": null,
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I create aircraft without a livery
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airframe": {
          "type": "B748",
          "name": "Boeing 747-8",
          "cruiseSpeed": { "value": 0.85, "unit": "mach" },
          "serviceCeiling": 43100,
          "performanceCode": "D",
          "weightCategory": "super"
        },
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "@defaultLivery('Lufthansa')",
        "currentState": "idle",
        "etopsThresholdMinutes": null,
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot create aircraft with an unknown base airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "0e37fd75-141d-4f01-b040-bcde2f7be839"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airport with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot create aircraft with correct data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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

  Scenario: As operations I cannot create aircraft with incorrect data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "livery": "Sunshine"
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
          "registration": ["registration should not be empty", "registration must be a string"],
          "baseAirportId": ["baseAirportId must be a UUID"]
        }
      }
      """

  Scenario: As operations I cannot create aircraft with non-existing operator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I cannot create aircraft with unknown airframe type
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "ZZZZ",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airframe with given type not found."
      }
      """

  Scenario: As operations I cannot create aircraft with existing registration
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "D-AIMC",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "Aircraft with given registration already exists."
      }
      """

  Scenario: As operations I cannot create aircraft with incorrect uuid
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/incorrect-uuid/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot create aircraft
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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
