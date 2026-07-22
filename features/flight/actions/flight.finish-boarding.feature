Feature: Finish flight boarding

  Scenario: As an admin I can finish boarding in flight that is checked in
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can finish boarding in flight that is checked in
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I can finish boarding in flight that is checked in
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "05986dd3-ff01-4112-ad35-ecd85db05c77"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9,
        "fuel": {
          "block": 11.9,
          "taxi": 0.3,
          "trip": 9.6,
          "alternate": 0.9,
          "reserve": 0.6,
          "contingencyType": "5% of trip",
          "contingencyAmount": 0.5,
          "mel": 0,
          "atc": 0,
          "wxx": 0,
          "extra": 0,
          "tankering": 0
        }
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "05986dd3-ff01-4112-ad35-ecd85db05c77",
        "flightNumber": "AA4909",
        "callsign": "AAL4909",
        "atcCallsign": "AAL09J",
        "isEtops": false,
        "status": "boarding_finished",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "estimated": {
            "arrivalTime": "2025-01-01T15:50:00.000Z",
            "onBlockTime": "2025-01-01T16:08:00.000Z",
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
            "passengers": 370,
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
            "passengers": 366,
            "payload": 28.3,
            "cargo": 8.9,
            "zeroFuelWeight": 202.9,
            "blockFuel": 11.9,
            "fuel": {
              "block": 11.9,
              "taxi": 0.3,
              "trip": 9.6,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5% of trip",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          }
        },
        "aircraft": {
          "id": "a2f425e0-2db0-4d8f-8c4c-b3a95d51eb24",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N721AN",
          "selcal": "AB-CG",
          "livery": "Polished (2019)",
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
        "hasFlightPath": true,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": 1797
        }
      }
      """
    When I send a "GET" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "f8fe29e2-335e-488e-9fea-b5c4647578ed",
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
          "id": "08f2640d-a382-491a-9226-c6ed5cdbfd60",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "8297db05-76e4-416e-9f6f-fed2716296ea",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "9d2f1728-0882-4c65-b912-6d193f87a643",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T12:00:00.000Z"
        },
        {
          "id": "9762e7f2-5cb6-48a1-bee2-077c6ed4452c",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T12:40:00.000Z"
        },
        {
          "id": "63268531-1365-4322-bf99-e7509f53db1d",
          "scope": "user",
          "type": "flight.live-position-received",
          "payload": {},
          "actor": null,
          "createdAt": "2025-01-01T12:55:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.boarding-finished" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot finish boarding with a final fuel breakdown whose block differs from the block fuel
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9,
        "fuel": {
          "block": 12.5,
          "taxi": 0.3,
          "trip": 9.6,
          "alternate": 0.9,
          "reserve": 0.6,
          "contingencyType": "5% of trip",
          "contingencyAmount": 0.5,
          "mel": 0,
          "atc": 0,
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

  Scenario: As a cabin crew I cannot finish boarding in flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot finish boarding for flight, because flight has not started boarding.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot finish boarding when flight has not started boarding yet
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot finish boarding for flight, because flight has not started boarding.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot finish boarding with invalid payload
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2
        },
        "passengers": 366,
        "payload": 28.3,
        "blockFuel": 11.9
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
          "cargo": ["cargo must be a number conforming to the specified constraints", "cargo should not be empty"],
          "zeroFuelWeight": [
            "zeroFuelWeight must be a number conforming to the specified constraints",
            "zeroFuelWeight should not be empty"
          ]
        }
      }
      """

  Scenario: As a cabin crew I cannot finish boarding in flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9
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

  Scenario: As a cabin crew I cannot finish boarding in flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9
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

  Scenario: As an unauthorized user I cannot finish boarding in flight
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 366,
        "payload": 28.3,
        "cargo": 8.9,
        "zeroFuelWeight": 202.9,
        "blockFuel": 11.9
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
