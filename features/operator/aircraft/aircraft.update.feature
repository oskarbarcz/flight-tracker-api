Feature: Update aircraft

  Scenario: As an admin I cannot update aircraft
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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

  Scenario: As operations I can update aircraft
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "fullName": "Airbus A330-900 neo (CFM version)",
        "icaoCode": "A339",
        "livery": "Lufthansa Classic (2024)",
        "registration": "D-AIMC",
        "selcal": "LR-CK",
        "shortName": "Airbus A330"
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
        "fleetSize": 1,
        "fleetTypes": ["A339"],
        "avgFleetAge": 14.2,
        "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
        "backgroundUrl": null,
        "continent": "europe"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update aircraft
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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

  Scenario: As operations I cannot update aircraft with incorrect data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "fullName": "Airbus A330-900 neo (CFM version)",
        "icaoCode": "A339"
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
          "id": ["property id should not exist"]
        }
      }
      """

  Scenario: As operations I cannot update aircraft that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/operator/d02c2edf-0365-4d68-a027-ecacfb1fb605/aircraft/d02c2edf-0365-4d68-a027-ecacfb1fb605" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Operator with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update aircraft that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/34a8698a-152a-489c-9f29-3e3e5323a33e" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update aircraft with incorrect ID
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/incorrect-id" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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

  Scenario: As operations I cannot update aircraft for operator with incorrect ID
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/operator/incorrect-id/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)"
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

  Scenario: As an unauthorized user I cannot update aircraft
    When I send a "PATCH" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f" with body:
      """json
      {
        "fullName": "Airbus A330-900 neo (CFM version)",
        "livery": "Lufthansa Classic (2024)",
        "operatorId": "1d85d597-c3a1-43cf-b888-10d674ea7a46"
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
