Feature: Mark flight as ready

  Scenario: As an admin I cannot mark flight as ready
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can mark flight as ready
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "e91e13a9-09d8-48bf-8453-283cef467b88"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
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
        "status": "ready",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 6
            },
            "passengers": 296,
            "payload": 40.3,
            "cargo": 8.5,
            "zeroFuelWeight": 208.9,
            "blockFuel": 12.7,
            "fuel": {
              "block": 12.7,
              "taxi": 0.3,
              "trip": 10.4,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          },
          "final": {
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 6
            },
            "passengers": 294,
            "payload": 39.1,
            "cargo": 8.2,
            "zeroFuelWeight": 207.7,
            "blockFuel": 12.5
          }
        },
        "aircraft": {
          "id": "ed247c36-58f0-43ff-81fd-ffae548a73e2",
          "airframe": {
            "type": "B77W",
            "iataType": "77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
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
            "dataQuality": "low",
            "location": {
              "longitude": -71.01663,
              "latitude": 42.36454
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
            "type": "destination",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "longitude": -75.24349,
              "latitude": 39.87113
            },
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
            "dataQuality": "low",
            "location": {
              "longitude": -73.7781,
              "latitude": 40.6413
            },
            "type": "destination_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "serviceType": "passenger",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": null
      }
      """
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a1d43d93-0958-45bc-aa5e-3b1c4a081d74",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.released",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.released" within 2000ms
    And I set database to initial state

  Scenario: As operations I seat the passengers when I mark a flight as ready
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "a5fffa17-7803-4e85-8291-d1dc9276bd46",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And every entry of the response body list "passengers" should have a "name"
    And every entry of the response body list "passengers" should have a "pnr"
    And every entry of the response body list "passengers" should have a "cabin"
    And I set database to initial state

  Scenario: As operations I fill every seat when the loadsheet matches the cabin
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c9c526f4-7b97-4454-b1e4-28b5ea57851f",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 220,
        "passengersByCabin": { "business": 36, "economy": 184 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And between 1 and 90 entries of the response body list "passengers" should have a "ssr"
    And every "ssr" of the response body list "passengers" should be one of "INFT,WCHR,WCHS,WCHC,UMNR,BLND,DEAF,MAAS,PETC"
    And I set database to initial state

  Scenario: As operations I seat the cabin breakdown I planned
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/8e5f9f40-34f3-4813-99db-b732ba2b815e/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/8e5f9f40-34f3-4813-99db-b732ba2b815e/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "8e5f9f40-34f3-4813-99db-b732ba2b815e",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 30, "economy": 120 },
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I seat a flight against a cabin AeroLOPA has withdrawn
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/c51c6b82-c74a-4f8f-9d6b-f768124446c5/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c51c6b82-c74a-4f8f-9d6b-f768124446c5/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c51c6b82-c74a-4f8f-9d6b-f768124446c5",
        "cabinLayout": "fi-752-1",
        "cabinLayoutRevision": 1,
        "passengerCount": 100,
        "passengersByCabin": { "business": 12, "economy": 88 },
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot mark as ready more passengers than the cabin seats
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/56999cc9-b26d-4f3b-a51e-2b175809b0cd/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 221 passengers in a cabin of 220 seats."
      }
      """
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/56999cc9-b26d-4f3b-a51e-2b175809b0cd/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-02T17:35:00.000Z",
        "onBlockTime": "2025-01-02T17:45:00.000Z",
        "takeoffTime": "2025-01-02T09:25:00.000Z",
        "offBlockTime": "2025-01-02T09:05:00.000Z"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot check in for flight, because flight is not ready."
      }
      """
    And I set database to initial state

  Scenario: As operations I mark as ready a flight whose aircraft has no cabin layout
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft flying this flight has no cabin layout assigned, so the flight has no manifest."
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot mark flight as ready
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot mark flight as ready twice
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot mark flight as ready. Flight is not in created status.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot mark flight without loadsheet as ready
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot mark flight as ready. Preliminary loadsheet is mandatory.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot mark as ready flight that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/141a2f56-708d-4cc9-b967-64dc0c2b20c4/mark-as-ready"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot mark as ready flight with incorrect uuid
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/incorrect-uuid/mark-as-ready"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot mark flight as ready
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
