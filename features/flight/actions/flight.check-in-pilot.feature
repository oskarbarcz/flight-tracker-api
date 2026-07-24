Feature: Check in pilot for flight

  Scenario: As an admin I cannot check in pilot for flight
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
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

  Scenario: As operations I cannot check in pilot for flight
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
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

  Scenario: As a cabin crew I can check in pilot for flight
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "23952e79-6b38-49ed-a1db-bd4d9b3cedab"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
        "flightNumber": "AA4906",
        "callsign": "AAL4906",
        "atcCallsign": "AAL06J",
        "isEtops": false,
        "status": "checked_in",
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
          "final": null
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
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
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": 2391
        }
      }
      """
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "784319d9-a6be-41c4-ad5c-9c0f691faffb",
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
          "id": "f434d000-963a-4603-9e4d-92aed0195a89",
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
          "id": "85530a54-1d5a-4943-a9fb-9b5ef39f6fc5",
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
          "id": "@uuid",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-31270",
        "currentFlightId": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
        "homeAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportId": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
        "lastAirportUpdatedAt": "@date('within 1 minute from now')"
      }
      """
    When I send a "GET" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d/travel"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "userId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "type": "performing_flight",
          "status": "pending",
          "departureAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "destinationAirport": {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "name": "Philadelphia Intl",
            "iataCode": "PHL"
          },
          "distance": 243,
          "flightId": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
          "createdAt": "@date('within 1 minute from now')",
          "updatedAt": null
        },
        {
          "id": "@uuid",
          "userId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "type": "dead_head_automatic",
          "status": "finished",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "destinationAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "distance": 162,
          "flightId": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
          "createdAt": "@date('within 1 minute from now')",
          "updatedAt": null
        },
        {
          "id": "b92a34c1-3d77-4a6b-9d11-80c95ccc01db",
          "userId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "type": "performing_flight",
          "status": "pending",
          "departureAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "destinationAirport": {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "name": "Philadelphia Intl",
            "iataCode": "PHL"
          },
          "distance": 243,
          "flightId": "04be266c-df78-4bec-9f50-281cc02ce7f2",
          "createdAt": "2025-01-01T09:00:00.000Z",
          "updatedAt": null
        }
      ]
      """
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/aircraft/a10c21e3-3ac1-4265-9d12-da9baefa2d98/reposition"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "type": "performing_flight",
          "status": "pending",
          "departureAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "destinationAirport": {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "name": "Philadelphia Intl",
            "iataCode": "PHL"
          },
          "distance": 243,
          "flightId": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
          "createdAt": "@date('within 1 minute from now')",
          "updatedAt": null
        },
        {
          "id": "@uuid",
          "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "type": "dead_head_automatic",
          "status": "finished",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "destinationAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "distance": 162,
          "flightId": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
          "createdAt": "@date('within 1 minute from now')",
          "updatedAt": null
        },
        {
          "id": "4072bdb0-5a63-4d02-abc5-40d5d18a7abc",
          "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "type": "performing_flight",
          "status": "pending",
          "departureAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "destinationAirport": {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "name": "Philadelphia Intl",
            "iataCode": "PHL"
          },
          "distance": 243,
          "flightId": "04be266c-df78-4bec-9f50-281cc02ce7f2",
          "createdAt": "2025-01-01T09:00:00.000Z",
          "updatedAt": null
        }
      ]
      """
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/aircraft/a10c21e3-3ac1-4265-9d12-da9baefa2d98"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "airframe": {
          "type": "B77W",
          "name": "Boeing 777-300ER",
          "cruiseSpeed": { "value": 0.84, "unit": "mach" },
          "serviceCeiling": 43000,
          "performanceCode": "D",
          "weightCategory": "heavy"
        },
        "livery": "Team USA (2023)",
        "registration": "N78881",
        "selcal": "KY-JO",
        "currentState": "checked_in",
        "etopsThresholdMinutes": 180,
        "baseAirport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "iataCode": "JFK",
          "name": "New York JFK",
          "city": "New York",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
          "iataCode": "BOS",
          "name": "Boston Logan Intl",
          "city": "Boston",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": "@date('within 1 minute from now')",
        "lastParkingPosition": null
      }
      """
    And I should receive a live flight event of type "flight.pilot-checked-in" within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/aircraft"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "registration": "N78881",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": {
              "value": 0.84,
              "unit": "mach"
            },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          },
          "flight": {
            "id": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
            "flightNumber": "AA4906",
            "departureAirport": {
              "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
              "iataCode": "BOS"
            },
            "arrivalAirport": {
              "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
              "iataCode": "PHL"
            }
          }
        },
        {
          "id": "ed7ed4bb-95ff-4e79-9331-11212ef727ec",
          "registration": "D-AIMG",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": {
              "value": 0.8,
              "unit": "mach"
            },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Retro 1970s (2022)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "flight": {
            "id": "1e9f4176-188f-41a5-a9d1-25a96579f46d",
            "flightNumber": "LH102",
            "departureAirport": {
              "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
              "iataCode": "JFK"
            },
            "arrivalAirport": {
              "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
              "iataCode": "FRA"
            }
          }
        },
        {
          "id": "a9b9205d-53b1-4eec-bb24-548a12159997",
          "registration": "D-AIMF",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": {
              "value": 0.8,
              "unit": "mach"
            },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "New Livery (2018)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "flight": {
            "id": "d4a25ef2-39cf-484c-af00-a548999e8699",
            "flightNumber": "LH43",
            "departureAirport": {
              "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
              "iataCode": "JFK"
            },
            "arrivalAirport": {
              "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
              "iataCode": "FRA"
            }
          }
        },
        {
          "id": "6c48d613-6582-49de-afbb-89fdc7cac0b7",
          "registration": "N718AN",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": {
              "value": 0.84,
              "unit": "mach"
            },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Oneworld (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          },
          "flight": {
            "id": "23da8bc9-a21b-4678-b2e9-1151d3bd15ab",
            "flightNumber": "AA4905",
            "departureAirport": {
              "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
              "iataCode": "BOS"
            },
            "arrivalAirport": {
              "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
              "iataCode": "PHL"
            }
          }
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot check in pilot for flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot check in for flight, because flight is not ready.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot check in pilot when flight is not ready
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot check in for flight, because flight is not ready.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot check in pilot for flight with incorrect schedule payload
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/check-in" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "offBlockTime": "some-non-existing-date",
        "testTime": "2022-02-02T15:35:00.000Z"
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
          "onBlockTime": ["onBlockTime must be a Date instance", "onBlockTime should not be empty"],
          "takeoffTime": ["takeoffTime must be a Date instance", "takeoffTime should not be empty"],
          "offBlockTime": ["offBlockTime must be a Date instance"],
          "testTime": ["property testTime should not exist"]
        }
      }
      """

  Scenario: As a cabin crew I cannot check in pilot for flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/141a2f56-708d-4cc9-b967-64dc0c2b20c4/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
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

  Scenario: As a cabin crew I cannot check in pilot for flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/incorrect-uuid/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
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

  Scenario: As an unauthorized user I cannot check in pilot for flight
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
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
