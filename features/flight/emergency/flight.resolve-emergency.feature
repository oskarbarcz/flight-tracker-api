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
            "type": "departure"
          },
          {
            "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
            "icaoCode": "LFPG",
            "iataCode": "CFG",
            "city": "Paris",
            "name": "Paris Charles de Gaulle",
            "country": "France",
            "timezone": "Europe/Paris",
            "continent": "europe",
            "location": { "longitude": 8.570556, "latitude": 50.033333 },
            "type": "destination"
          }
        ],
        "rotationId": null,
        "source": "manual",
        "tracking": "public",
        "departureGateId": null,
        "departureRunwayId": "6bbf43a4-9242-4f04-b195-6a7bcd1f14c4",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": true,
        "createdAt": "2025-01-01T06:00:00.000Z"
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
            "type": "departure"
          },
          {
            "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
            "icaoCode": "LFPG",
            "iataCode": "CFG",
            "city": "Paris",
            "name": "Paris Charles de Gaulle",
            "country": "France",
            "timezone": "Europe/Paris",
            "continent": "europe",
            "location": { "longitude": 8.570556, "latitude": 50.033333 },
            "type": "destination"
          }
        ],
        "rotationId": null,
        "source": "manual",
        "tracking": "public",
        "departureGateId": null,
        "departureRunwayId": "6bbf43a4-9242-4f04-b195-6a7bcd1f14c4",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "createdAt": "2025-01-01T06:00:00.000Z"
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
    And I set database to initial state

  Scenario: As a cabin crew I cannot resolve an emergency that does not exist
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency/11111111-1111-4111-8111-111111111111"
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
