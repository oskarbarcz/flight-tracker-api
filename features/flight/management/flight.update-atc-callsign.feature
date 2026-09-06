Feature: Update flight ATC callsign

  Scenario: As an admin I cannot update the ATC callsign
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
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

  Scenario: As operations I can set the ATC callsign
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05",
        "flightNumber": "LH450",
        "callsign": "DLH450",
        "atcCallsign": "DLH5PJ",
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T21:00:00.000Z",
            "onBlockTime": "2025-01-01T21:10:00.000Z",
            "takeoffTime": "2025-01-01T12:15:00.000Z",
            "offBlockTime": "2025-01-01T12:00:00.000Z"
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "iataType": "339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
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
          },
          "cabinLayout": null
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
            "city": {
              "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
              "name": "Frankfurt"
            },
            "name": "Frankfurt Rhein/Main",
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "timezone": "Europe/Berlin",
            "type": "departure",
            "continent": "europe",
            "dataQuality": "low",
            "location": { "longitude": 8.57397, "latitude": 50.04693 },
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
            "type": "destination",
            "continent": "north_america",
            "dataQuality": "low",
            "location": { "longitude": -73.7781, "latitude": 40.6413 },
            "shape": "@coordinates"
          },
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
            "type": "destination_alternate",
            "continent": "north_america",
            "dataQuality": "low",
            "location": { "longitude": -71.01663, "latitude": 42.36454 },
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
            "type": "destination_alternate",
            "continent": "north_america",
            "dataQuality": "low",
            "location": { "longitude": -75.24349, "latitude": 39.87113 },
            "shape": "@coordinates"
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": {
              "id": "e5c4da3c-30af-4a50-be48-832cdb854cd7",
              "name": "St. Johns"
            },
            "name": "St. Johns Intl",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "timezone": "America/St_Johns",
            "continent": "north_america",
            "dataQuality": "low",
            "type": "etops_entry",
            "location": { "longitude": -52.751945, "latitude": 47.61861 },
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "departureRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "hasNotoc": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "private",
        "serviceType": "passenger",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": null
      }
      """
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "operations",
          "type": "flight.atc-callsign-changed",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.atc-callsign-changed" within 2000ms
    And I set database to initial state

  Scenario: As cabin crew I can set the ATC callsign
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05",
        "flightNumber": "LH450",
        "callsign": "DLH450",
        "atcCallsign": "DLH5PJ",
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T21:00:00.000Z",
            "onBlockTime": "2025-01-01T21:10:00.000Z",
            "takeoffTime": "2025-01-01T12:15:00.000Z",
            "offBlockTime": "2025-01-01T12:00:00.000Z"
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "iataType": "339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
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
          },
          "cabinLayout": null
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
            "city": {
              "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
              "name": "Frankfurt"
            },
            "name": "Frankfurt Rhein/Main",
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "timezone": "Europe/Berlin",
            "type": "departure",
            "continent": "europe",
            "dataQuality": "low",
            "location": { "longitude": 8.57397, "latitude": 50.04693 },
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
            "type": "destination",
            "continent": "north_america",
            "dataQuality": "low",
            "location": { "longitude": -73.7781, "latitude": 40.6413 },
            "shape": "@coordinates"
          },
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
            "type": "destination_alternate",
            "continent": "north_america",
            "dataQuality": "low",
            "location": { "longitude": -71.01663, "latitude": 42.36454 },
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
            "type": "destination_alternate",
            "continent": "north_america",
            "dataQuality": "low",
            "location": { "longitude": -75.24349, "latitude": 39.87113 },
            "shape": "@coordinates"
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": {
              "id": "e5c4da3c-30af-4a50-be48-832cdb854cd7",
              "name": "St. Johns"
            },
            "name": "St. Johns Intl",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "timezone": "America/St_Johns",
            "continent": "north_america",
            "dataQuality": "low",
            "type": "etops_entry",
            "location": { "longitude": -52.751945, "latitude": 47.61861 },
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "departureRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "hasNotoc": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "private",
        "serviceType": "passenger",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": null
      }
      """
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.atc-callsign-changed",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.atc-callsign-changed" within 2000ms
    And I set database to initial state

  Scenario: As operations I can clear the ATC callsign imported from the flight plan
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/atc-callsign" with body:
      """json
      { "atcCallsign": null }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
        "flightNumber": "AA4907",
        "callsign": "AAL4907",
        "atcCallsign": null,
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
          },
          "cabinLayout": null
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
        "pilot": null,
        "hasNotoc": true
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot update the ATC callsign after takeoff (in cruise)
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update ATC callsign after takeoff.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot update the ATC callsign after the flight was closed
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/23da8bc9-a21b-4678-b2e9-1151d3bd15ab/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update ATC callsign after takeoff.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot update the ATC callsign of non-existing flight
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/58c83720-fb20-4c84-b727-ba6dda14f8d1/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
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

  Scenario: As operations I cannot set an empty ATC callsign
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/atc-callsign" with body:
      """json
      { "atcCallsign": "" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "atcCallsign": ["atcCallsign should not be empty"]
        }
      }
      """

  Scenario: As operations I cannot omit the ATC callsign
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/atc-callsign" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "atcCallsign": ["atcCallsign should not be empty", "atcCallsign must be a string"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot update the ATC callsign
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/atc-callsign" with body:
      """json
      { "atcCallsign": "DLH5PJ" }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
