Feature: Reposition an aircraft

  Scenario: As operations I can reposition an aircraft to a different airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "aircraftId": "7d27a031-5abb-415f-bde5-1aa563ad394e",
          "type": "dead_head_manual",
          "status": "finished",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "destinationAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "distance": 3342,
          "flightId": null,
          "createdAt": "@date('within 1 minute from now')",
          "updatedAt": null
        },
        {
          "id": "7b000000-0000-4000-8000-0000000000a1",
          "aircraftId": "7d27a031-5abb-415f-bde5-1aa563ad394e",
          "type": "performing_flight",
          "status": "pending",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "destinationAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "distance": 3342,
          "flightId": null,
          "createdAt": "2025-01-02T15:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "7b000000-0000-4000-8000-000000000003",
          "aircraftId": "7d27a031-5abb-415f-bde5-1aa563ad394e",
          "type": "performing_flight",
          "status": "finished",
          "departureAirport": {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "name": "Philadelphia Intl",
            "iataCode": "PHL"
          },
          "destinationAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "distance": 80,
          "flightId": null,
          "createdAt": "2025-01-02T12:00:00.000Z",
          "updatedAt": "2025-01-02T14:00:00.000Z"
        },
        {
          "id": "7b000000-0000-4000-8000-000000000002",
          "aircraftId": "7d27a031-5abb-415f-bde5-1aa563ad394e",
          "type": "dead_head_automatic",
          "status": "finished",
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
          "flightId": null,
          "createdAt": "2025-01-01T11:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "7b000000-0000-4000-8000-000000000001",
          "aircraftId": "7d27a031-5abb-415f-bde5-1aa563ad394e",
          "type": "dead_head_manual",
          "status": "finished",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "destinationAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "distance": 3000,
          "flightId": null,
          "createdAt": "2025-01-01T10:00:00.000Z",
          "updatedAt": null
        }
      ]
      """
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7d27a031-5abb-415f-bde5-1aa563ad394e",
        "airframe": {
          "type": "A321",
          "name": "A321-200",
          "cruiseSpeed": { "value": 0.78, "unit": "mach" },
          "serviceCeiling": 39000,
          "performanceCode": "C",
          "weightCategory": "medium"
        },
        "livery": "Sunshine (2024)",
        "registration": "D-AIDA",
        "selcal": "SK-PK",
        "currentState": "idle",
        "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "lastAirportUpdatedAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot reposition an aircraft to the airport it is already at
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition" with body:
      """json
      {
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Reposition destination must differ from the current airport.",
        "error": "Bad Request"
      }
      """

  Scenario: As operations I cannot reposition an aircraft that has no current airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/reposition" with body:
      """json
      {
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Aircraft has no current airport to reposition from.",
        "error": "Bad Request"
      }
      """

  Scenario: As a cabin crew I cannot reposition an aircraft
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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

  Scenario: As an unauthorized user I cannot reposition an aircraft
    When I send a "POST" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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
