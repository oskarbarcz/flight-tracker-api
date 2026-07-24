Feature: List rotations assigned to the current user

  Scenario: As a pilot I see my ready, in-progress and finished rotations but not drafts
    Given I am signed in as "Michael Doe"
    When I send a "GET" request to "/api/v1/user/me/rotations"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "962ca6ae-a765-46f1-9505-d1d870698959",
          "name": "FRA-JFK-FRA 2025-02-01",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "pilotId": "629be07f-5e65-429a-9d69-d34b99185f50",
          "status": "in_progress",
          "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "updatedBy": null,
          "createdAt": "2025-02-01T00:00:00.000Z",
          "updatedAt": null,
          "legs": [
            {
              "id": "57515593-6dba-4d0d-92a2-27fb355dbe21",
              "flightNumber": "LH100",
              "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "offBlockTime": "2025-02-01T12:00:00.000Z",
              "onBlockTime": "2025-02-01T20:00:00.000Z",
              "blockTime": 480,
              "flight": null
            },
            {
              "id": "aff6dfc2-ea15-4e02-a287-f130a4ddf6fb",
              "flightNumber": "LH101",
              "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "offBlockTime": "2025-02-01T22:00:00.000Z",
              "onBlockTime": "2025-02-02T06:00:00.000Z",
              "blockTime": 480,
              "flight": null
            }
          ]
        },
        {
          "id": "9ab79d41-3db0-4068-98d6-5ec08641e899",
          "name": "FRA-JFK-FRA 2025-02-02",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "pilotId": "629be07f-5e65-429a-9d69-d34b99185f50",
          "status": "finished",
          "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "updatedBy": null,
          "createdAt": "2025-02-02T00:00:00.000Z",
          "updatedAt": null,
          "legs": [
            {
              "id": "9ebeab51-fe4d-4215-836e-56596f988d7a",
              "flightNumber": "LH200",
              "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "offBlockTime": "2025-02-02T12:00:00.000Z",
              "onBlockTime": "2025-02-02T20:00:00.000Z",
              "blockTime": 480,
              "flight": null
            },
            {
              "id": "34b79875-00a8-485c-8fe3-309a9114003b",
              "flightNumber": "LH201",
              "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "offBlockTime": "2025-02-02T22:00:00.000Z",
              "onBlockTime": "2025-02-03T06:00:00.000Z",
              "blockTime": 480,
              "flight": null
            }
          ]
        },
        {
          "id": "2f4ac9bd-14ac-4af0-96a9-ec7666a3c808",
          "name": "FRA-JFK-FRA 2025-02-03",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "pilotId": "629be07f-5e65-429a-9d69-d34b99185f50",
          "status": "ready",
          "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "updatedBy": null,
          "createdAt": "2025-02-03T00:00:00.000Z",
          "updatedAt": null,
          "legs": [
            {
              "id": "92c8e486-0bb5-4876-b894-75f0ca30ce61",
              "flightNumber": "LH300",
              "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "offBlockTime": "2025-02-03T12:00:00.000Z",
              "onBlockTime": "2025-02-03T20:00:00.000Z",
              "blockTime": 480,
              "flight": null
            },
            {
              "id": "1ccf9810-e3cc-4dca-90d8-323351c4fe64",
              "flightNumber": "LH301",
              "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "offBlockTime": "2025-02-03T22:00:00.000Z",
              "onBlockTime": "2025-02-04T06:00:00.000Z",
              "blockTime": 480,
              "flight": null
            }
          ]
        }
      ]
      """

  Scenario: As a different pilot I see only my own assigned rotations
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/rotations"
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

  Scenario: As an admin with no assigned rotations my list is empty
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/rotations"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As an unauthorized user I cannot list my assigned rotations
    When I send a "GET" request to "/api/v1/user/me/rotations"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: Filtering by a state returns only my rotations in that state
    Given I am signed in as "Michael Doe"
    When I send a "GET" request to "/api/v1/user/me/rotations?status=in_progress"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "962ca6ae-a765-46f1-9505-d1d870698959",
          "name": "FRA-JFK-FRA 2025-02-01",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "pilotId": "629be07f-5e65-429a-9d69-d34b99185f50",
          "status": "in_progress",
          "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "updatedBy": null,
          "createdAt": "2025-02-01T00:00:00.000Z",
          "updatedAt": null,
          "legs": [
            {
              "id": "57515593-6dba-4d0d-92a2-27fb355dbe21",
              "flightNumber": "LH100",
              "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "offBlockTime": "2025-02-01T12:00:00.000Z",
              "onBlockTime": "2025-02-01T20:00:00.000Z",
              "blockTime": 480,
              "flight": null
            },
            {
              "id": "aff6dfc2-ea15-4e02-a287-f130a4ddf6fb",
              "flightNumber": "LH101",
              "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
              "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
              "offBlockTime": "2025-02-01T22:00:00.000Z",
              "onBlockTime": "2025-02-02T06:00:00.000Z",
              "blockTime": 480,
              "flight": null
            }
          ]
        }
      ]
      """

  Scenario: Filtering by draft returns an empty list because drafts are never exposed
    Given I am signed in as "Michael Doe"
    When I send a "GET" request to "/api/v1/user/me/rotations?status=draft"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: Filtering by an unrecognised state is rejected
    Given I am signed in as "Michael Doe"
    When I send a "GET" request to "/api/v1/user/me/rotations?status=boarding"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "status": ["status must be one of the following values: draft, ready, in_progress, finished"]
        }
      }
      """
