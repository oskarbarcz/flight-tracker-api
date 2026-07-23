Feature: Read rotations

  Scenario: As an admin I can get a draft rotation
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3e12423f-3add-4c0a-b594-07e0b32413e0",
        "name": "FRA-JFK-FRA 2025-01-01",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "draft",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null,
        "legs": [
          {
            "id": "34d72055-0f5c-4bd3-8e02-4db80131de48",
            "flightNumber": "LH450",
            "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "offBlockTime": "2025-01-01T12:00:00.000Z",
            "onBlockTime": "2025-01-01T20:00:00.000Z",
            "blockTime": 480,
            "flight": null
          },
          {
            "id": "916e6138-b189-4bb5-b23f-3f649e203bea",
            "flightNumber": "LH41",
            "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "offBlockTime": "2025-01-01T22:00:00.000Z",
            "onBlockTime": "2025-01-02T06:00:00.000Z",
            "blockTime": 480,
            "flight": null
          }
        ]
      }
      """

  Scenario: As a cabin crew I can get a ready rotation with an attached flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/rotation/de76f066-23a6-4a49-aa5e-e9d524f4efb8"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "de76f066-23a6-4a49-aa5e-e9d524f4efb8",
        "name": "FRA-JFK-FRA 2025-01-03",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "ready",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": null,
        "legs": [
          {
            "id": "9c347301-fa9e-4c26-aa29-0295415053c8",
            "flightNumber": "LH450",
            "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "offBlockTime": "2025-01-01T12:00:00.000Z",
            "onBlockTime": "2025-01-01T20:00:00.000Z",
            "blockTime": 480,
            "flight": { "id": "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05", "flightNumber": "LH450", "status": "created" }
          },
          {
            "id": "7037a573-2971-4fb6-8c34-8a98c9bc71c8",
            "flightNumber": "LH41",
            "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "offBlockTime": "2025-01-01T22:00:00.000Z",
            "onBlockTime": "2025-01-02T06:00:00.000Z",
            "blockTime": 480,
            "flight": null
          }
        ]
      }
      """

  Scenario: Anyone can list an operator rotations without authentication
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/rotation"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "d182d0f0-5b7d-4092-b6d9-0c3c11775a85",
          "name": "BOS-PHL-BOS 2025-01-01",
          "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "status": "in_progress",
          "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "updatedBy": null,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": null,
          "legs": [
            {
              "id": "69de1c35-96e1-4c0e-9b4c-c5777081f6e9",
              "flightNumber": "AA4908",
              "departure": { "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3", "iataCode": "BOS", "icaoCode": "KBOS", "name": "Boston Logan Intl" },
              "arrival": { "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554", "iataCode": "PHL", "icaoCode": "KPHL", "name": "Philadelphia Intl" },
              "offBlockTime": "2025-01-01T13:00:00.000Z",
              "onBlockTime": "2025-01-01T14:30:00.000Z",
              "blockTime": 90,
              "flight": { "id": "b3899775-278e-4496-add1-21385a13d93e", "flightNumber": "AA4908", "status": "checked_in" }
            },
            {
              "id": "4a406198-f4a9-4859-bd30-b2b431f1b9ed",
              "flightNumber": "AA4910",
              "departure": { "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554", "iataCode": "PHL", "icaoCode": "KPHL", "name": "Philadelphia Intl" },
              "arrival": { "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3", "iataCode": "BOS", "icaoCode": "KBOS", "name": "Boston Logan Intl" },
              "offBlockTime": "2025-01-01T16:00:00.000Z",
              "onBlockTime": "2025-01-01T17:30:00.000Z",
              "blockTime": 90,
              "flight": null
            }
          ]
        },
        {
          "id": "7f5f13b1-5f14-4418-af23-8128ff4f6410",
          "name": "BOS-PHL-BOS 2024-12-31",
          "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "status": "finished",
          "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "updatedBy": null,
          "createdAt": "2025-01-02T00:00:00.000Z",
          "updatedAt": null,
          "legs": [
            {
              "id": "2fff235c-17c3-4286-9682-2877fcf13eb5",
              "flightNumber": "AA4905",
              "departure": { "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3", "iataCode": "BOS", "icaoCode": "KBOS", "name": "Boston Logan Intl" },
              "arrival": { "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554", "iataCode": "PHL", "icaoCode": "KPHL", "name": "Philadelphia Intl" },
              "offBlockTime": "2025-01-01T08:00:00.000Z",
              "onBlockTime": "2025-01-01T09:30:00.000Z",
              "blockTime": 90,
              "flight": { "id": "23da8bc9-a21b-4678-b2e9-1151d3bd15ab", "flightNumber": "AA4905", "status": "closed" }
            },
            {
              "id": "7d55710c-a39b-48bd-9ab0-ef8c6034f613",
              "flightNumber": "AA4917",
              "departure": { "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554", "iataCode": "PHL", "icaoCode": "KPHL", "name": "Philadelphia Intl" },
              "arrival": { "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3", "iataCode": "BOS", "icaoCode": "KBOS", "name": "Boston Logan Intl" },
              "offBlockTime": "2025-01-01T11:00:00.000Z",
              "onBlockTime": "2025-01-01T12:30:00.000Z",
              "blockTime": 90,
              "flight": { "id": "d085c107-308d-48e6-9c93-beca6552a8a3", "flightNumber": "AA4917", "status": "closed" }
            }
          ]
        }
      ]
      """

  Scenario: Fetching an unknown rotation returns not found
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/rotation/11111111-1111-4111-8111-111111111111"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Rotation with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
