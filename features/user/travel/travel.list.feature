Feature: List user travel history

  Scenario: As a cabin crew I can list my own travel history
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/user/725f5df2-0c78-4fe8-89a2-52566c89cf7f/travel"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "3d3a4355-fc36-492e-be46-6183559359d1",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
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
          "flightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "createdAt": "2025-01-03T09:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "9df8f9c1-8ffa-43f6-a8e5-66f249f6b6cb",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "type": "performing_flight",
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
          "flightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "createdAt": "2025-01-02T12:00:00.000Z",
          "updatedAt": "2025-01-02T18:00:00.000Z"
        },
        {
          "id": "bd05cae0-dd40-4456-a4cd-9e5f0a95f868",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
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
          "flightId": null,
          "createdAt": "2025-01-02T11:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "4f997097-32f2-4ed1-834a-0c71d7efc113",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "type": "dead_head_manual",
          "status": "finished",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "destinationAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "distance": 3342,
          "flightId": null,
          "createdAt": "2025-01-02T10:00:00.000Z",
          "updatedAt": null
        }
      ]
      """

  Scenario: As operations I can list cabin crew travel history
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/725f5df2-0c78-4fe8-89a2-52566c89cf7f/travel"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "3d3a4355-fc36-492e-be46-6183559359d1",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
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
          "flightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "createdAt": "2025-01-03T09:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "9df8f9c1-8ffa-43f6-a8e5-66f249f6b6cb",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "type": "performing_flight",
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
          "flightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "createdAt": "2025-01-02T12:00:00.000Z",
          "updatedAt": "2025-01-02T18:00:00.000Z"
        },
        {
          "id": "bd05cae0-dd40-4456-a4cd-9e5f0a95f868",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
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
          "flightId": null,
          "createdAt": "2025-01-02T11:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "4f997097-32f2-4ed1-834a-0c71d7efc113",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "type": "dead_head_manual",
          "status": "finished",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "destinationAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "distance": 3342,
          "flightId": null,
          "createdAt": "2025-01-02T10:00:00.000Z",
          "updatedAt": null
        }
      ]
      """

  Scenario: As an admin I can list cabin crew travel history
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/725f5df2-0c78-4fe8-89a2-52566c89cf7f/travel"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "3d3a4355-fc36-492e-be46-6183559359d1",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
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
          "flightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "createdAt": "2025-01-03T09:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "9df8f9c1-8ffa-43f6-a8e5-66f249f6b6cb",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "type": "performing_flight",
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
          "flightId": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
          "createdAt": "2025-01-02T12:00:00.000Z",
          "updatedAt": "2025-01-02T18:00:00.000Z"
        },
        {
          "id": "bd05cae0-dd40-4456-a4cd-9e5f0a95f868",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
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
          "flightId": null,
          "createdAt": "2025-01-02T11:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "4f997097-32f2-4ed1-834a-0c71d7efc113",
          "userId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "type": "dead_head_manual",
          "status": "finished",
          "departureAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "destinationAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "distance": 3342,
          "flightId": null,
          "createdAt": "2025-01-02T10:00:00.000Z",
          "updatedAt": null
        }
      ]
      """

  Scenario: As a cabin crew with no travel I get an empty history
    Given I am signed in as "Michael Doe"
    When I send a "GET" request to "/api/v1/user/629be07f-5e65-429a-9d69-d34b99185f50/travel"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As a cabin crew I cannot list another user travel history
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf/travel"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "User is not allowed to access another user travel.",
        "error": "Forbidden"
      }
      """

  Scenario: As an unauthorized user I cannot list travel history
    When I send a "GET" request to "/api/v1/user/725f5df2-0c78-4fe8-89a2-52566c89cf7f/travel"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
