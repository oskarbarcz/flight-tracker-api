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
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then I should receive flight event history within 2000ms
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
        "atcCallsign": "AAL12J",
        "isEtops": false,
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
          },
          "predicted": {
            "arrivalTime": "2025-01-01T15:55:00.000Z",
            "onBlockTime": "2025-01-01T16:12:00.000Z",
            "takeoffTime": null,
            "offBlockTime": null
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
          "airframe": {
            "type": "B77W",
            "name": "B777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
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
            "type": "departure",
            "shape": "@coordinates"
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
            "type": "destination",
            "shape": "@coordinates"
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
            "type": "destination_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureGateId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": true,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "source": "manual",
        "tracking": "public",
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
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7032f11d-51b2-43ba-9cf1-ae1f144f0707",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "9822a1b2-9715-40a5-94cb-d8b616637457",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "88651e15-57d0-468f-9231-bd2e1edcff66",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "3d802611-728b-41cd-a4d1-f9fc91aaca18",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T12:00:00.000Z"
        },
        {
          "id": "d2794a43-60e2-4abe-9803-ce75dfa2a37b",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T12:40:00.000Z"
        },
        {
          "id": "2dba1cb5-d25c-4ade-9d46-e30eb8ecb24a",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:05:00.000Z"
        },
        {
          "id": "d03bb44f-88d8-42cd-aa29-342eda6ebbf3",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:10:00.000Z"
        },
        {
          "id": "0108b08b-9c45-49ba-a3cb-a3ae172ce92c",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:25:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "operations",
          "type": "flight.diversion-reported",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.diversion-reported" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I can report flight diversion
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then I should receive flight event history within 2000ms
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
        "atcCallsign": "AAL12J",
        "isEtops": false,
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
          },
          "predicted": {
            "arrivalTime": "2025-01-01T15:55:00.000Z",
            "onBlockTime": "2025-01-01T16:12:00.000Z",
            "takeoffTime": null,
            "offBlockTime": null
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
          "airframe": {
            "type": "B77W",
            "name": "B777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
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
            "type": "departure",
            "shape": "@coordinates"
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
            "type": "destination",
            "shape": "@coordinates"
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
            "type": "destination_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureGateId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": true,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "source": "manual",
        "tracking": "public",
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
    And I should receive a live flight event of type "flight.diversion-reported" within 2000ms
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
        "message": "Flight with given id does not exist.",
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
