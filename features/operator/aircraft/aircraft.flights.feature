Feature: Aircraft flight history

  Scenario: As an admin I can get the flight history for an aircraft
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/flights"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "9"
    And the response body should contain:
      """json
      [
        {
          "flightNumber": "LH880",
          "status": "in_cruise",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "arrivalAirport": {
            "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
            "name": "Paris Charles de Gaulle",
            "iataCode": "CDG"
          },
          "actualTimesheet": {
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T09:55:00.000Z",
            "offBlockTime": "2025-01-01T09:35:00.000Z"
          }
        },
        {
          "flightNumber": "LH102",
          "status": "in_cruise",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "arrivalAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "actualTimesheet": {
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:25:00.000Z",
            "offBlockTime": "2025-01-01T13:10:00.000Z"
          }
        },
        {
          "flightNumber": "LH103",
          "status": "taxiing_in",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "arrivalAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "actualTimesheet": {
            "arrivalTime": "2025-01-01T15:40:00.000Z",
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:25:00.000Z",
            "offBlockTime": "2025-01-01T13:10:00.000Z"
          }
        },
        {
          "flightNumber": "LH40",
          "status": "closed",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "arrivalAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "actualTimesheet": {
            "arrivalTime": "2025-01-02T02:30:00.000Z",
            "onBlockTime": "2025-01-02T02:45:00.000Z",
            "takeoffTime": "2025-01-01T18:00:00.000Z",
            "offBlockTime": "2025-01-01T17:45:00.000Z"
          }
        },
        {
          "flightNumber": "LH41",
          "status": "created",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "arrivalAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "actualTimesheet": null
        },
        {
          "flightNumber": "LH42",
          "status": "ready",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "arrivalAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "actualTimesheet": null
        },
        {
          "flightNumber": "LH43",
          "status": "offboarding_finished",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "arrivalAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "actualTimesheet": {
            "arrivalTime": "2025-01-03T11:30:00.000Z",
            "onBlockTime": "2025-01-03T11:45:00.000Z",
            "takeoffTime": "2025-01-03T04:20:00.000Z",
            "offBlockTime": "2025-01-03T04:00:00.000Z"
          }
        },
        {
          "flightNumber": "LH450",
          "status": "created",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "arrivalAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "actualTimesheet": null
        },
        {
          "flightNumber": "LH81",
          "status": "ready",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "arrivalAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "actualTimesheet": null
        }
      ]
      """

  Scenario: As operations I can get the flight history for an aircraft
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/flights"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "9"

  Scenario: As a cabin crew I can get the flight history for an aircraft
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/flights"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "9"

  Scenario: Aircraft with no flights returns an empty history
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/flights"
    Then the response status should be 200
    And the response header "X-Total-Count" should be "0"
    And the response body should contain:
      """json
      []
      """

  Scenario: Cannot get flight history for aircraft that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/0e37fd75-141d-4f01-b040-bcde2f7be839/flights"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Cannot get flight history for operator that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/0e37fd75-141d-4f01-b040-bcde2f7be839/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/flights"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Operator with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Cannot get flight history for an aircraft that belongs to another operator
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/flights"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: Cannot get flight history with incorrect aircraft ID
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/incorrect-uuid/flights"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot get the flight history for an aircraft
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/flights"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
