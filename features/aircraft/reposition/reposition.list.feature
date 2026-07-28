Feature: List aircraft reposition history

  Scenario: As operations I can list aircraft reposition history
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "fbea95e8-0fca-4326-af0a-d9ea352da337",
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
          "id": "2ef171c4-ab94-4628-bf89-194f2af84e0f",
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
          "id": "87ba25c3-4b50-4b92-b828-9d6d799b9acd",
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
          "id": "5a6ce555-8325-42a1-bef9-235a4af67fa1",
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

  Scenario: As a cabin crew I can list aircraft reposition history
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition"
    Then the response status should be 200

  Scenario: As operations I get an empty history for an aircraft with no repositions
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f/reposition"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As operations I cannot list reposition history for an aircraft that does not belong to the operator
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft with given ID not found."
      }
      """

  Scenario: As an unauthorized user I cannot list aircraft reposition history
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/reposition"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
