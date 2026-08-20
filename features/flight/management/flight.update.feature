Feature: Update flight

  Scenario: As operations I can change flight service type to cargo
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "cargo"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
        "flightNumber": "AA4907",
        "callsign": "AAL4907",
        "atcCallsign": "AAL07J",
        "isEtops": false,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01T13:00:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z"
          }
        },
        "loadsheets": {
          "final": {
            "cargo": 8.2,
            "payload": 39.1,
            "blockFuel": 12.5,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 294,
            "zeroFuelWeight": 207.7
          },
          "preliminary": {
            "fuel": {
              "atc": 0,
              "mel": 0,
              "wxx": 0,
              "taxi": 0.3,
              "trip": 10.4,
              "block": 12.7,
              "extra": 0,
              "reserve": 0.6,
              "alternate": 0.9,
              "tankering": 0,
              "contingencyType": "5%",
              "contingencyAmount": 0.5
            },
            "cargo": 8.5,
            "payload": 40.3,
            "blockFuel": 12.7,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 296,
            "zeroFuelWeight": 208.9
          }
        },
        "source": "manual",
        "tracking": "public",
        "serviceType": "cargo",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "departureParkingPositionId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isEmergencyDeclared": false,
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
        },
        "aircraft": {
          "id": "ed247c36-58f0-43ff-81fd-ffae548a73e2",
          "airframe": {
            "type": "B77W",
            "iataType": "77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": {
              "value": 0.84,
              "unit": "mach"
            },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
          "registration": "N719AN",
          "selcal": "AB-CE",
          "livery": "Flagship (2022)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "airports": [
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
            "shape": "@coordinates",
            "type": "departure"
          },
          {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "icaoCode": "KPHL",
            "iataCode": "PHL",
            "city": "Philadelphia",
            "name": "Philadelphia Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 39.87113,
              "longitude": -75.24349
            },
            "shape": "@coordinates",
            "type": "destination"
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
            "dataQuality": "low",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "shape": "@coordinates",
            "type": "destination_alternate"
          }
        ],
        "isFlightDiverted": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "pilot": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can change flight service type back to passenger
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "cargo"
      }
      """
    Then the response status should be 204
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "passenger"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
        "flightNumber": "AA4907",
        "callsign": "AAL4907",
        "atcCallsign": "AAL07J",
        "isEtops": false,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01T13:00:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z"
          }
        },
        "loadsheets": {
          "final": {
            "cargo": 8.2,
            "payload": 39.1,
            "blockFuel": 12.5,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 294,
            "zeroFuelWeight": 207.7
          },
          "preliminary": {
            "fuel": {
              "atc": 0,
              "mel": 0,
              "wxx": 0,
              "taxi": 0.3,
              "trip": 10.4,
              "block": 12.7,
              "extra": 0,
              "reserve": 0.6,
              "alternate": 0.9,
              "tankering": 0,
              "contingencyType": "5%",
              "contingencyAmount": 0.5
            },
            "cargo": 8.5,
            "payload": 40.3,
            "blockFuel": 12.7,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 296,
            "zeroFuelWeight": 208.9
          }
        },
        "source": "manual",
        "tracking": "public",
        "serviceType": "passenger",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "departureParkingPositionId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isEmergencyDeclared": false,
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
        },
        "aircraft": {
          "id": "ed247c36-58f0-43ff-81fd-ffae548a73e2",
          "airframe": {
            "type": "B77W",
            "iataType": "77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": {
              "value": 0.84,
              "unit": "mach"
            },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
          "registration": "N719AN",
          "selcal": "AB-CE",
          "livery": "Flagship (2022)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "airports": [
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
            "shape": "@coordinates",
            "type": "departure"
          },
          {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "icaoCode": "KPHL",
            "iataCode": "PHL",
            "city": "Philadelphia",
            "name": "Philadelphia Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 39.87113,
              "longitude": -75.24349
            },
            "shape": "@coordinates",
            "type": "destination"
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
            "dataQuality": "low",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "shape": "@coordinates",
            "type": "destination_alternate"
          }
        ],
        "isFlightDiverted": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "pilot": null
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot change service type of a flight marked as ready
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab" with body:
      """json
      {
        "serviceType": "cargo"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot change flight service type, because flight was marked as ready."
      }
      """

  Scenario: As operations I cannot change service type to an incorrect value
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "incorrect-value"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "serviceType": ["serviceType must be one of the following values: passenger, cargo"]
        }
      }
      """

  Scenario: As operations I can send an empty update without changing the flight
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {}
      """
    Then the response status should be 204

  Scenario: As operations I cannot update a flight that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449" with body:
      """json
      {
        "serviceType": "cargo"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update a flight with incorrect uuid
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid" with body:
      """json
      {
        "serviceType": "cargo"
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

  Scenario: As an admin I cannot update a flight
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "cargo"
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

  Scenario: As a cabin crew I cannot update a flight
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "cargo"
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

  Scenario: As an unauthorized user I cannot update a flight
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88" with body:
      """json
      {
        "serviceType": "cargo"
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
