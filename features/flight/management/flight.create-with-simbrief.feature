Feature: Create a flight with Simbrief

  Scenario: As an admin I cannot create a flight with Simbrief
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations user with SimBrief connected I can create a flight with Simbrief
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "flightNumber": "DLH80",
        "callsign": "DLH80",
        "status": "created",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-05T09:00:00.000Z",
            "takeoffTime": "2025-01-05T09:20:00.000Z",
            "arrivalTime": "2025-01-05T17:10:00.000Z",
            "onBlockTime": "2025-01-05T17:25:00.000Z"
          }
        },
        "loadsheets": {
          "final": null,
          "preliminary": {
            "cargo": 8,
            "payload": 37.9,
            "blockFuel": 71.6,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 12,
              "reliefPilots": 1
            },
            "passengers": 348,
            "zeroFuelWeight": 206.5
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "icaoCode": "A339",
          "shortName": "Airbus A330",
          "fullName": "Airbus A330-900 neo",
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "livery": "Fanhansa (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          }
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        },
        "airports": [
          {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "continent": "europe",
            "location": {
              "latitude": 50.04693,
              "longitude": 8.57397
            },
            "type": "departure"
          },
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "destination"
          }
        ],
        "isFlightDiverted": false,
        "rotationId": null,
        "source": "simbrief",
        "createdAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot create a flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations user with incorrect SimBrief flight plan I cannot create a flight
    Given I am signed in as "operations with Simbrief ID but non existing aircraft"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft with given registration does not exist."
      }
      """

  Scenario: As operations without Simbrief ID I cannot create a flight with SimBrief
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "User has not connected SimBrief ID."
      }
      """

  Scenario: As an unauthorized user I cannot create a flight with SimBrief
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
