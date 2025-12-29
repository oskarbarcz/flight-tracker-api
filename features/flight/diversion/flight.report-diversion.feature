Feature: Report a flight diversion

  Scenario: As an admin I cannot report flight diversion
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      }
      """

  Scenario: As an operations I can report flight diversion
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d",
        "flightNumber": "AA4912",
        "callsign": "AAL4912",
        "status": "in_cruise",
        "timesheet": {
          "actual": {
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:25:00.000Z",
            "offBlockTime": "2025-01-01T13:10:00.000Z"
          },
          "estimated": {
            "arrivalTime": "2025-01-01T15:50:00.000Z",
            "onBlockTime": "2025-01-01T16:08:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "scheduled": {
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          }
        },
        "loadsheets": {
          "final": {
            "cargo": 8.9,
            "payload": 28.3,
            "blockFuel": 11.9,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 366,
            "zeroFuelWeight": 202.9
          },
          "preliminary": {
            "cargo": 8.5,
            "payload": 40.3,
            "blockFuel": 12.7,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 370,
            "zeroFuelWeight": 208.9
          }
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "icaoCode": "B773",
          "shortName": "Boeing 777",
          "fullName": "Boeing 777-300ER",
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
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
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
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
            "location": {
              "latitude": 39.87113,
              "longitude": -75.24349
            },
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
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "destination_alternate"
          }
        ],
        "isFlightDiverted": true,
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          }
        },
        "decisionTime": "@date('within 1 minute from now')",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00.000Z"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can report flight diversion
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d",
        "flightNumber": "AA4912",
        "callsign": "AAL4912",
        "status": "in_cruise",
        "timesheet": {
          "actual": {
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:25:00.000Z",
            "offBlockTime": "2025-01-01T13:10:00.000Z"
          },
          "estimated": {
            "arrivalTime": "2025-01-01T15:50:00.000Z",
            "onBlockTime": "2025-01-01T16:08:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "scheduled": {
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          }
        },
        "loadsheets": {
          "final": {
            "cargo": 8.9,
            "payload": 28.3,
            "blockFuel": 11.9,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 366,
            "zeroFuelWeight": 202.9
          },
          "preliminary": {
            "cargo": 8.5,
            "payload": 40.3,
            "blockFuel": 12.7,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 6,
              "reliefPilots": 0
            },
            "passengers": 370,
            "zeroFuelWeight": 208.9
          }
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "icaoCode": "B773",
          "shortName": "Boeing 777",
          "fullName": "Boeing 777-300ER",
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
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
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
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
            "location": {
              "latitude": 39.87113,
              "longitude": -75.24349
            },
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
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "destination_alternate"
          }
        ],
        "isFlightDiverted": true,
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          }
        },
        "decisionTime": "@date('within 1 minute from now')",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00.000Z"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot report flight diversion when flight has incorrect status
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Diversion can be reported to flights in Taxiing Out or In Cruise status only",
        "error": "Bad Request"
      }
      """

  Scenario: As a cabin crew I cannot divert already diverted flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Active diversion already exists for this flight",
        "error": "Conflict"
      }
      """

  Scenario: As a cabin crew I cannot report diversion for non-existing flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2eb60569-eb00-424e-ab29-6ba10224495c/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "message": "Flight was not found",
        "error": "Not Found"
      }
      """

  Scenario: As an unauthorized user I cannot report flight diversion
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
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
