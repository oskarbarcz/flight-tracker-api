Feature: List rotations

  Scenario: Listing an operator's rotations returns all of them
    Given I am signed in as "operations"
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
              "departure": {
                "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
                "iataCode": "BOS",
                "icaoCode": "KBOS",
                "name": "Boston Logan Intl"
              },
              "arrival": {
                "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
                "iataCode": "PHL",
                "icaoCode": "KPHL",
                "name": "Philadelphia Intl"
              },
              "offBlockTime": "2025-01-01T13:00:00.000Z",
              "onBlockTime": "2025-01-01T14:30:00.000Z",
              "blockTime": 90,
              "flight": {
                "id": "b3899775-278e-4496-add1-21385a13d93e",
                "flightNumber": "AA4908",
                "status": "checked_in"
              }
            },
            {
              "id": "4a406198-f4a9-4859-bd30-b2b431f1b9ed",
              "flightNumber": "AA4910",
              "departure": {
                "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
                "iataCode": "PHL",
                "icaoCode": "KPHL",
                "name": "Philadelphia Intl"
              },
              "arrival": {
                "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
                "iataCode": "BOS",
                "icaoCode": "KBOS",
                "name": "Boston Logan Intl"
              },
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
              "departure": {
                "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
                "iataCode": "BOS",
                "icaoCode": "KBOS",
                "name": "Boston Logan Intl"
              },
              "arrival": {
                "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
                "iataCode": "PHL",
                "icaoCode": "KPHL",
                "name": "Philadelphia Intl"
              },
              "offBlockTime": "2025-01-01T08:00:00.000Z",
              "onBlockTime": "2025-01-01T09:30:00.000Z",
              "blockTime": 90,
              "flight": { "id": "23da8bc9-a21b-4678-b2e9-1151d3bd15ab", "flightNumber": "AA4905", "status": "closed" }
            },
            {
              "id": "7d55710c-a39b-48bd-9ab0-ef8c6034f613",
              "flightNumber": "AA4917",
              "departure": {
                "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
                "iataCode": "PHL",
                "icaoCode": "KPHL",
                "name": "Philadelphia Intl"
              },
              "arrival": {
                "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
                "iataCode": "BOS",
                "icaoCode": "KBOS",
                "name": "Boston Logan Intl"
              },
              "offBlockTime": "2025-01-01T11:00:00.000Z",
              "onBlockTime": "2025-01-01T12:30:00.000Z",
              "blockTime": 90,
              "flight": { "id": "d085c107-308d-48e6-9c93-beca6552a8a3", "flightNumber": "AA4917", "status": "closed" }
            }
          ]
        }
      ]
      """

  Scenario: Filtering by state returns only rotations in that state
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/rotation?status=in_progress"
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
              "departure": {
                "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
                "iataCode": "BOS",
                "icaoCode": "KBOS",
                "name": "Boston Logan Intl"
              },
              "arrival": {
                "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
                "iataCode": "PHL",
                "icaoCode": "KPHL",
                "name": "Philadelphia Intl"
              },
              "offBlockTime": "2025-01-01T13:00:00.000Z",
              "onBlockTime": "2025-01-01T14:30:00.000Z",
              "blockTime": 90,
              "flight": {
                "id": "b3899775-278e-4496-add1-21385a13d93e",
                "flightNumber": "AA4908",
                "status": "checked_in"
              }
            },
            {
              "id": "4a406198-f4a9-4859-bd30-b2b431f1b9ed",
              "flightNumber": "AA4910",
              "departure": {
                "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
                "iataCode": "PHL",
                "icaoCode": "KPHL",
                "name": "Philadelphia Intl"
              },
              "arrival": {
                "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
                "iataCode": "BOS",
                "icaoCode": "KBOS",
                "name": "Boston Logan Intl"
              },
              "offBlockTime": "2025-01-01T16:00:00.000Z",
              "onBlockTime": "2025-01-01T17:30:00.000Z",
              "blockTime": 90,
              "flight": null
            }
          ]
        }
      ]
      """

  Scenario: Filtering by a state with no rotations returns an empty list
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/rotation?status=draft"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: Filtering by an unrecognised state is rejected
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/rotation?status=boarding"
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
