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
          },
          "cabinLayout": null
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
        "hasNotoc": true,
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

  Scenario: As operations I load the hold when I mark a widebody as ready
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64",
        "holdVariant": "b77w-ld3",
        "cargoKg": 18000,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": "@any",
        "bulkLotCount": "@any",
        "shipmentCount": "@any",
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I load a bulk-only narrowbody as loose lots with no container
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86",
        "holdVariant": "b738-bulk",
        "cargoKg": 1800,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": [
          {
            "kind": "bulk_lot",
            "uldCode": null,
            "uldType": null,
            "positionDesignator": null,
            "compartment": "@any",
            "deck": "lower",
            "tareKg": 0,
            "grossKg": 1800,
            "volumeM3": "@any",
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": "@any"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I load containers into a narrowbody fitted with a cargo loading system
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/2c7a5d0b-3e89-4f62-8b14-6d9f0a2c3e75/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/2c7a5d0b-3e89-4f62-8b14-6d9f0a2c3e75/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "2c7a5d0b-3e89-4f62-8b14-6d9f0a2c3e75",
        "holdVariant": "a320-cls",
        "cargoKg": 2500,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": "@any",
        "bulkLotCount": "@any",
        "shipmentCount": "@any",
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I load the main deck of a freighter
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97",
        "holdVariant": "b74f-nose",
        "cargoKg": 62000,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": "@any",
        "bulkLotCount": "@any",
        "shipmentCount": "@any",
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I load a flight whose aircraft type has no curated hold data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/5f0d8a3e-6b12-4c95-9e47-9a2c3d5f6b08/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/5f0d8a3e-6b12-4c95-9e47-9a2c3d5f6b08/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "5f0d8a3e-6b12-4c95-9e47-9a2c3d5f6b08",
        "holdVariant": null,
        "cargoKg": 8000,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": [],
        "segregationAdvisories": [],
        "units": [
          {
            "kind": "bulk_lot",
            "uldCode": null,
            "uldType": null,
            "positionDesignator": null,
            "compartment": null,
            "deck": null,
            "tareKg": 0,
            "grossKg": 8000,
            "volumeM3": "@any",
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": "@any"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot mark as ready more cargo than the hold can carry
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/7b2f0c50-8d34-4eb7-9a69-1c4e5f7b8d2a/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot load 10000 kg of cargo into a hold that carries 7700 kg."
      }
      """
    When I send a "GET" request to "/api/v1/flight/7b2f0c50-8d34-4eb7-9a69-1c4e5f7b8d2a/cargo-manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no cargo manifest yet. It is generated when the flight is released to the pilot."
      }
      """

  Scenario: As operations I load no cargo-aircraft-only shipment onto a flight carrying passengers
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b",
        "holdVariant": "a320-cls",
        "cargoKg": 2500,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": "@any",
        "bulkLotCount": "@any",
        "shipmentCount": "@any",
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": 0,
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I release a flight whose cold chain is at risk, the assessment being advisory
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97",
        "holdVariant": "b74f-nose",
        "cargoKg": 62000,
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": "@any",
        "bulkLotCount": "@any",
        "shipmentCount": "@any",
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I containerise the baggage of a flight whose payload accounts for it
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b",
        "holdVariant": "a320-cls",
        "cargoKg": 2500,
        "baggageKg": 2775,
        "bagCount": 133,
        "baggageSource": "reconciled",
        "containerCount": "@any",
        "bulkLotCount": "@any",
        "shipmentCount": "@any",
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": 0,
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot release a flight whose cargo and baggage do not fit the hold
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/f1a4d7c8-3b62-4e59-9d0a-6c8b2e5f7a41/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "@any"
      }
      """
    When I send a "GET" request to "/api/v1/flight/f1a4d7c8-3b62-4e59-9d0a-6c8b2e5f7a41/cargo-manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no cargo manifest yet. It is generated when the flight is released to the pilot."
      }
      """
    And I set database to initial state

  Scenario: As operations I derive the baggage of a flight whose payload cannot account for it
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c9c526f4-7b97-4454-b1e4-28b5ea57851f",
        "holdVariant": "a321-bulk",
        "cargoKg": 4200,
        "baggageKg": 2772,
        "bagCount": 154,
        "baggageSource": "derived",
        "containerCount": 0,
        "bulkLotCount": 2,
        "shipmentCount": 2,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": 0,
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I carry no baggage on a flight with no passengers
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86",
        "holdVariant": "b738-bulk",
        "cargoKg": 1800,
        "baggageKg": 0,
        "bagCount": 0,
        "baggageSource": null,
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I issue the notification to captain when I release a flight
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/notoc"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64",
        "stage": "preliminary",
        "issuedAt": "@date('within 1 minute from now')",
        "acknowledgedById": null,
        "acknowledgedAt": null,
        "document": {
          "statement": "@any",
          "dangerousGoods": "@any",
          "specialLoads": "@any",
          "coldChain": "@any",
          "summary": {
            "compartments": "@any",
            "containerCount": "@any",
            "palletCount": "@any",
            "looseLotCount": "@any",
            "cargoKg": 18000,
            "baggageKg": 0,
            "deadloadKg": 18000,
            "beyondCount": "@any",
            "tightestConnectionMinutes": "@any"
          }
        },
        "changes": null
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
