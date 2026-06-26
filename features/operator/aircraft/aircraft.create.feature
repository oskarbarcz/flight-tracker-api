Feature: Create aircraft for operator

  Scenario: As an admin I cannot create aircraft
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine"
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
        "livery": "Sunshine"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airframe": {
          "type": "B748",
          "name": "B747-8",
          "cruiseSpeed": { "value": 0.85, "unit": "mach" },
          "serviceCeiling": 43100,
          "performanceCode": "D",
          "weightCategory": "super"
        },
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine",
        "currentState": "idle",
        "baseAirportId": null,
        "lastAirportId": null,
        "lastAirportUpdatedAt": null
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

  Scenario: As a cabin crew I cannot create aircraft with correct data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft" with body:
      """json
      {
        "type": "B748",
        "selcal": "SL-PR",
        "registration": "SP-LRA",
        "livery": "Sunshine"
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
          "selcal": ["selcal should not be empty", "selcal must be a string"]
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
        "livery": "Sunshine"
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
        "livery": "Sunshine"
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
        "livery": "Sunshine"
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
        "livery": "Sunshine"
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
        "livery": "Sunshine"
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
