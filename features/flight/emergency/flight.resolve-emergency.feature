Feature: Resolve a flight emergency

  Scenario: As an admin I cannot resolve an emergency
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 403

  Scenario: As an operations I cannot resolve an emergency
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 403

  Scenario: As a cabin crew I can resolve an active emergency and re-declare a new one afterwards
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b",
        "flightNumber": "LH880",
        "callsign": "DLH880",
        "atcCallsign": "DLH880",
        "isEtops": false,
        "status": "in_cruise",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01T09:30:00.000Z",
            "takeoffTime": "2025-01-01T09:50:00.000Z",
            "arrivalTime": "2025-01-01T11:05:00.000Z",
            "onBlockTime": "2025-01-01T11:15:00.000Z"
          },
          "estimated": {
            "offBlockTime": "2025-01-01T09:30:00.000Z",
            "takeoffTime": "2025-01-01T09:50:00.000Z",
            "arrivalTime": "2025-01-01T11:00:00.000Z",
            "onBlockTime": "2025-01-01T11:10:00.000Z"
          },
          "actual": {
            "offBlockTime": "2025-01-01T09:35:00.000Z",
            "takeoffTime": "2025-01-01T09:55:00.000Z",
            "arrivalTime": null,
            "onBlockTime": null
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 4 },
            "passengers": 178,
            "payload": 18.2,
            "cargo": 1.5,
            "zeroFuelWeight": 75.4,
            "blockFuel": 9.8
          },
          "final": {
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 4 },
            "passengers": 176,
            "payload": 17.9,
            "cargo": 1.4,
            "zeroFuelWeight": 75.1,
            "blockFuel": 9.6
          }
        },
        "aircraft": {
          "id": "cfedcfae-6e80-4801-8a89-12b2430c908b",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "D-AIML",
          "selcal": "CE-FG",
          "livery": "Munich (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          }
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
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
            "location": { "longitude": 8.57397, "latitude": 50.04693 },
            "type": "departure",
            "shape": "@coordinates"
          },
          {
            "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
            "icaoCode": "LFPG",
            "iataCode": "CDG",
            "city": "Paris",
            "name": "Paris Charles de Gaulle",
            "country": "France",
            "timezone": "Europe/Paris",
            "continent": "europe",
            "location": { "longitude": 2.55412, "latitude": 49.00896 },
            "type": "destination",
            "shape": "@coordinates"
          }
        ],
        "rotationId": null,
        "source": "manual",
        "tracking": "public",
        "departureParkingPositionId": null,
        "departureRunwayId": "290a31a8-ba88-436c-b9ab-d8a5c57ea81f",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": true,
        "hasFlightPath": false,
        "createdAt": "2025-01-01T06:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": "@any"
        }
      }
      """
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a",
          "urgency": "panpan",
          "threatLevel": "medium",
          "category": "ata-24-electrical-power",
          "squawk": "7700",
          "intention": "divert",
          "lastKnownPosition": { "longitude": 6.789, "latitude": 49.512 },
          "soulsOnBoard": 182,
          "fuelEnduranceMinutes": 45,
          "dangerousGoodsOnBoard": ["class-9-miscellaneous"],
          "freeText": "Generator #1 offline, running on APU and remaining bus. Requesting priority handling, divert intended.",
          "declarationTime": "2025-01-01T10:15:00.000Z",
          "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "resolvedAt": "@date('within 1 minute from now')",
          "resolvedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" }
        }
      ]
      """
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b",
        "flightNumber": "LH880",
        "callsign": "DLH880",
        "atcCallsign": "DLH880",
        "isEtops": false,
        "status": "in_cruise",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01T09:30:00.000Z",
            "takeoffTime": "2025-01-01T09:50:00.000Z",
            "arrivalTime": "2025-01-01T11:05:00.000Z",
            "onBlockTime": "2025-01-01T11:15:00.000Z"
          },
          "estimated": {
            "offBlockTime": "2025-01-01T09:30:00.000Z",
            "takeoffTime": "2025-01-01T09:50:00.000Z",
            "arrivalTime": "2025-01-01T11:00:00.000Z",
            "onBlockTime": "2025-01-01T11:10:00.000Z"
          },
          "actual": {
            "offBlockTime": "2025-01-01T09:35:00.000Z",
            "takeoffTime": "2025-01-01T09:55:00.000Z",
            "arrivalTime": null,
            "onBlockTime": null
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 4 },
            "passengers": 178,
            "payload": 18.2,
            "cargo": 1.5,
            "zeroFuelWeight": 75.4,
            "blockFuel": 9.8
          },
          "final": {
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 4 },
            "passengers": 176,
            "payload": 17.9,
            "cargo": 1.4,
            "zeroFuelWeight": 75.1,
            "blockFuel": 9.6
          }
        },
        "aircraft": {
          "id": "cfedcfae-6e80-4801-8a89-12b2430c908b",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "D-AIML",
          "selcal": "CE-FG",
          "livery": "Munich (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          }
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
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
            "location": { "longitude": 8.57397, "latitude": 50.04693 },
            "type": "departure",
            "shape": "@coordinates"
          },
          {
            "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
            "icaoCode": "LFPG",
            "iataCode": "CDG",
            "city": "Paris",
            "name": "Paris Charles de Gaulle",
            "country": "France",
            "timezone": "Europe/Paris",
            "continent": "europe",
            "location": { "longitude": 2.55412, "latitude": 49.00896 },
            "type": "destination",
            "shape": "@coordinates"
          }
        ],
        "rotationId": null,
        "source": "manual",
        "tracking": "public",
        "departureParkingPositionId": null,
        "departureRunwayId": "290a31a8-ba88-436c-b9ab-d8a5c57ea81f",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "createdAt": "2025-01-01T06:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": "@any"
        }
      }
      """
    When I send a "POST" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "high",
        "category": "ata-72-engine",
        "squawk": "7700",
        "intention": "immediate-landing",
        "fuelEnduranceMinutes": 20,
        "dangerousGoodsOnBoard": [],
        "freeText": "Engine #2 surge after restart, requesting immediate landing."
      }
      """
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "2f1d6c47-4e0b-4a51-86c1-9be07f4a2c10",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T06:00:00.000Z"
        },
        {
          "id": "5a3e7811-2c4f-4a82-9c11-7b9e2d8c4f50",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T06:10:00.000Z"
        },
        {
          "id": "7e1f9b22-3d5a-4b81-9e2d-1c4f8a3e6b71",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T06:20:00.000Z"
        },
        {
          "id": "9c2a4d33-5e6b-4f72-9a3c-2d5e7b8c1f43",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T08:30:00.000Z"
        },
        {
          "id": "0d3b5e44-6f7c-4083-9b4d-3e6f8c9d2a54",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:00:00.000Z"
        },
        {
          "id": "1e4c6f55-708d-4194-9c5e-4f709d0e3b65",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:25:00.000Z"
        },
        {
          "id": "2f5d7066-819e-42a5-8d6f-50819e1f4c76",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:35:00.000Z"
        },
        {
          "id": "3a6e8177-92af-43b6-8e70-619a2f0d5d87",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T09:55:00.000Z"
        },
        {
          "id": "4b7f9288-a3b0-44c7-8f81-72ab3a1e6e98",
          "scope": "user",
          "type": "flight.emergency-declared",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T10:15:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.emergency-resolved",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.emergency-declared",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.emergency-resolved" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot resolve an emergency that does not exist
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/edbd22fe-860a-403d-ac8d-34657810be5e"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Emergency with given id was not declared for this flight."
      }
      """

  Scenario: As a cabin crew I cannot resolve an emergency twice
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 204
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Entity",
        "message": "This emergency has already been resolved."
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot resolve an emergency
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a"
    Then the response status should be 401
