Feature: Update flight preliminary loadsheet

  Scenario: As an admin I cannot update flight preliminary loadsheet
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I can update flight preliminary loadsheet
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "e91e13a9-09d8-48bf-8453-283cef467b88"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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
              "cabinCrew": 5
            },
            "passengers": 360,
            "payload": 38.5,
            "cargo": 7.5,
            "zeroFuelWeight": 197.9,
            "blockFuel": 12.7
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
            "city": {
              "id": "19364a7d-3982-43e5-9630-9ce7c3a44e98",
              "name": "Boston"
            },
            "name": "Boston Logan Intl",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
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
            "city": {
              "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
              "name": "Philadelphia"
            },
            "name": "Philadelphia Intl",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
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
            "city": {
              "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
              "name": "New York"
            },
            "name": "New York JFK",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
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
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.preliminary-loadsheet-updated" within 2000ms
    And I set database to initial state

  Scenario: As operations I can enter a fuel breakdown manually in the preliminary loadsheet
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7,
        "fuel": {
          "block": 12.7,
          "taxi": 0.4,
          "trip": 9.9,
          "alternate": 1,
          "reserve": 0.7,
          "contingencyType": "5% of trip",
          "contingencyAmount": 0.5,
          "mel": 0,
          "atc": 0.2,
          "wxx": 0,
          "extra": 0,
          "tankering": 0,
          "etops": 0,
          "minTakeoff": 12.4,
          "planTakeoff": 12.4,
          "planLanding": 2.3,
          "averageFuelFlow": 5.9,
          "maxTanks": 145
        }
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
              "cabinCrew": 5
            },
            "passengers": 360,
            "payload": 38.5,
            "cargo": 7.5,
            "zeroFuelWeight": 197.9,
            "blockFuel": 12.7,
            "fuel": {
              "block": 12.7,
              "taxi": 0.4,
              "trip": 9.9,
              "alternate": 1,
              "reserve": 0.7,
              "contingencyType": "5% of trip",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0.2,
              "wxx": 0,
              "extra": 0,
              "tankering": 0,
              "etops": 0,
              "minTakeoff": 12.4,
              "planTakeoff": 12.4,
              "planLanding": 2.3,
              "averageFuelFlow": 5.9,
              "maxTanks": 145
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
            "city": {
              "id": "19364a7d-3982-43e5-9630-9ce7c3a44e98",
              "name": "Boston"
            },
            "name": "Boston Logan Intl",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
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
            "city": {
              "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
              "name": "Philadelphia"
            },
            "name": "Philadelphia Intl",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
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
            "city": {
              "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
              "name": "New York"
            },
            "name": "New York JFK",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
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
    And I set database to initial state

  Scenario: As operations I cannot enter a fuel breakdown whose block differs from the block fuel
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7,
        "fuel": {
          "block": 11.9,
          "taxi": 0.4,
          "trip": 9.9,
          "alternate": 1,
          "reserve": 0.7,
          "contingencyType": "5% of trip",
          "contingencyAmount": 0.5,
          "mel": 0,
          "atc": 0.2,
          "wxx": 0,
          "extra": 0,
          "tankering": 0
        }
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Fuel breakdown block must equal the loadsheet block fuel.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot plan more passengers than the cabin has seats
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 221,
        "payload": 23.206,
        "cargo": 4.2,
        "zeroFuelWeight": 91.606,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 221 passengers in a cabin of 220 seats."
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot plan a cabin breakdown that misses the total
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "passengersByCabin": {
          "business": 18,
          "economy": 130
        },
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Passenger breakdown must sum to the total passenger count."
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot plan more passengers into a cabin than it holds
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "passengersByCabin": {
          "business": 40,
          "economy": 110
        },
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 40 passengers in cabin \"business\", which has 36 seats."
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot plan a cabin the aircraft does not have
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "passengersByCabin": {
          "first": 10,
          "business": 20,
          "economy": 120
        },
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cabin \"first\" does not exist in the cabin of this flight."
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update flight preliminary loadsheet
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I cannot update preliminary loadsheet of flight with status other than created
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot update preliminary loadsheet, because flight was marked as ready."
      }
      """

  Scenario: As operations I cannot update flight preliminary loadsheet with incorrect payload
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "zeroFuelWeight": 197.9,
        "fuelBurn": 38.5
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
          "payload": [
            "payload must be a number conforming to the specified constraints",
            "payload should not be empty"
          ],
          "cargo": ["cargo must be a number conforming to the specified constraints", "cargo should not be empty"],
          "blockFuel": [
            "blockFuel must be a number conforming to the specified constraints",
            "blockFuel should not be empty"
          ],
          "fuelBurn": ["property fuelBurn should not exist"]
        }
      }
      """

  Scenario: As operations I generate the manifests when I write the preliminary loadsheet
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 150,
        "passengersByCabin": {
          "business": 20,
          "economy": 130
        },
        "payload": 17.5,
        "cargo": 2.5,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
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
    When I send a "GET" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/notoc?stage=preliminary"
    Then the response status should be 200
    And I set database to initial state

  Scenario: As operations I regenerate the manifests when I write the loadsheet again
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 150,
        "passengersByCabin": {
          "business": 20,
          "economy": 130
        },
        "payload": 17.5,
        "cargo": 2.5,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "PATCH" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 150,
        "passengersByCabin": {
          "business": 20,
          "economy": 130
        },
        "payload": 16.5,
        "cargo": 1.5,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b",
        "holdVariant": "a320-cls",
        "cargoKg": 1500,
        "baggageKg": "@any",
        "bagCount": "@any",
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

  Scenario: As operations I cannot plan a cabin count that is not a whole number of zero or more
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "passengersByCabin": {
          "business": -4,
          "economy": 154.5
        },
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
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
          "passengersByCabin": ["each value of passengersByCabin must be a whole number of zero or more"]
        }
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot plan a payload smaller than the cargo it carries
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 4,
        "cargo": 7,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Payload of 4000 kg cannot carry 19600 kg of cargo and passengers."
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot plan a payload that cannot carry its passengers
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 5,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Payload of 5000 kg cannot carry 16800 kg of cargo and passengers."
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot update preliminary loadsheet of flight that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I cannot update scheduled timesheet of flight with incorrect uuid
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As an unauthorized user I cannot report arrival
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I seat the passengers when I write the preliminary loadsheet
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 5,
          "reliefPilots": 0
        },
        "passengers": 150,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 88.2,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 5,
          "reliefPilots": 0
        },
        "passengers": 220,
        "payload": 23.12,
        "cargo": 4.2,
        "zeroFuelWeight": 91.52,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/8e5f9f40-34f3-4813-99db-b732ba2b815e/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 5,
          "reliefPilots": 0
        },
        "passengers": 150,
        "passengersByCabin": {
          "economy": 120,
          "business": 30
        },
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 88.2,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/c51c6b82-c74a-4f8f-9d6b-f768124446c5/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 4,
          "reliefPilots": 0
        },
        "passengers": 100,
        "payload": 14.2,
        "cargo": 1.4,
        "zeroFuelWeight": 72.4,
        "blockFuel": 14.8
      }
      """
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

  Scenario: As operations I write the loadsheet of a flight whose aircraft has no cabin layout
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 6,
          "reliefPilots": 0
        },
        "passengers": 296,
        "payload": 40.3,
        "cargo": 8.5,
        "zeroFuelWeight": 208.9,
        "blockFuel": 12.7,
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
        }
      }
      """
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

  Scenario: As operations I load the hold when I write the loadsheet of a widebody
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 18,
        "cargo": 18,
        "zeroFuelWeight": 86.4,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 1.8,
        "cargo": 1.8,
        "zeroFuelWeight": 70.2,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/2c7a5d0b-3e89-4f62-8b14-6d9f0a2c3e75/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 2.5,
        "cargo": 2.5,
        "zeroFuelWeight": 70.9,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 62,
        "cargo": 62,
        "zeroFuelWeight": 130.4,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/5f0d8a3e-6b12-4c95-9e47-9a2c3d5f6b08/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 8,
        "cargo": 8,
        "zeroFuelWeight": 76.4,
        "blockFuel": 21.4
      }
      """
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

  Scenario: As operations I cannot plan more cargo than the hold can carry
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/7b2f0c50-8d34-4eb7-9a69-1c4e5f7b8d2a/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 10,
        "cargo": 10,
        "zeroFuelWeight": 78.4,
        "blockFuel": 21.4
      }
      """
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
        "message": "Flight has no cargo manifest yet. It is generated from the preliminary loadsheet."
      }
      """

  Scenario: As operations I load no cargo-aircraft-only shipment onto a flight carrying passengers
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 4,
          "reliefPilots": 0
        },
        "passengers": 150,
        "passengersByCabin": {
          "economy": 130,
          "business": 20
        },
        "payload": 17.5,
        "cargo": 2.5,
        "zeroFuelWeight": 85.9,
        "blockFuel": 21.4
      }
      """
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

  Scenario: As operations I write the loadsheet of a flight whose cold chain is at risk, the assessment being advisory
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 62,
        "cargo": 62,
        "zeroFuelWeight": 130.4,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 4,
          "reliefPilots": 0
        },
        "passengers": 150,
        "passengersByCabin": {
          "economy": 130,
          "business": 20
        },
        "payload": 17.5,
        "cargo": 2.5,
        "zeroFuelWeight": 85.9,
        "blockFuel": 21.4
      }
      """
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

  Scenario: As operations I cannot plan a load the hold cannot take
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/f1a4d7c8-3b62-4e59-9d0a-6c8b2e5f7a41/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 4,
          "reliefPilots": 0
        },
        "passengers": 188,
        "payload": 25.8,
        "cargo": 7,
        "zeroFuelWeight": 94.2,
        "blockFuel": 21.4
      }
      """
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
        "message": "Flight has no cargo manifest yet. It is generated from the preliminary loadsheet."
      }
      """
    And I set database to initial state

  Scenario: As operations I derive the baggage of a flight whose payload cannot account for it
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 5,
          "reliefPilots": 0
        },
        "passengers": 220,
        "payload": 23.12,
        "cargo": 4.2,
        "zeroFuelWeight": 91.52,
        "blockFuel": 21.4
      }
      """
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
    When I send a "PATCH" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 1.8,
        "cargo": 1.8,
        "zeroFuelWeight": 70.2,
        "blockFuel": 21.4
      }
      """
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

  Scenario: As operations I issue the notification to captain when I write the loadsheet of a flight
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 18,
        "cargo": 18,
        "zeroFuelWeight": 86.4,
        "blockFuel": 21.4
      }
      """
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
