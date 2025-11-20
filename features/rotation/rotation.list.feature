Feature: List rotations

  Scenario: As admin I can list rotations
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/rotation"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
          "name": "2025-01",
          "pilot": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe",
            "pilotLicenseId": "UK-31270"
          },
          "flights": [
            {
              "id": "48760636-9520-4863-b32f-f3618556feb7",
              "flightNumber": "LH 40"
            },
            {
              "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
              "flightNumber": "LH 41"
            }
          ],
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "4cb9b5a8-7cac-4526-a0f7-f158fd14e9d1",
          "name": "2025-02",
          "pilot": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe",
            "pilotLicenseId": "UK-34560"
          },
          "flights": [
            {
              "id": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
              "flightNumber": "LH 42"
            }
          ],
          "createdAt": "2025-01-02T00:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "c2e12afb-a712-45aa-9ba5-fec71868e59a",
          "name": "2025-03",
          "pilot": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe",
            "pilotLicenseId": "UK-98540"
          },
          "flights": [
            {
              "id": "d4a25ef2-39cf-484c-af00-a548999e8699",
              "flightNumber": "LH 43"
            }
          ],
          "createdAt": "2025-01-03T00:00:00.000Z",
          "updatedAt": null
        }
      ]
      """

  Scenario: As operations I can list rotations
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/rotation"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
          "name": "2025-01",
          "pilot": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe",
            "pilotLicenseId": "UK-31270"
          },
          "flights": [
            {
              "id": "48760636-9520-4863-b32f-f3618556feb7",
              "flightNumber": "LH 40"
            },
            {
              "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
              "flightNumber": "LH 41"
            }
          ],
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "4cb9b5a8-7cac-4526-a0f7-f158fd14e9d1",
          "name": "2025-02",
          "pilot": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe",
            "pilotLicenseId": "UK-34560"
          },
          "flights": [
            {
              "id": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
              "flightNumber": "LH 42"
            }
          ],
          "createdAt": "2025-01-02T00:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "c2e12afb-a712-45aa-9ba5-fec71868e59a",
          "name": "2025-03",
          "pilot": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe",
            "pilotLicenseId": "UK-98540"
          },
          "flights": [
            {
              "id": "d4a25ef2-39cf-484c-af00-a548999e8699",
              "flightNumber": "LH 43"
            }
          ],
          "createdAt": "2025-01-03T00:00:00.000Z",
          "updatedAt": null
        }
      ]
      """

  Scenario: As cabin crew I can list rotations
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/rotation"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "bd8f2d64-a647-42da-be63-c6589915e6c9",
          "name": "2025-01",
          "pilot": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe",
            "pilotLicenseId": "UK-31270"
          },
          "flights": [
            {
              "id": "48760636-9520-4863-b32f-f3618556feb7",
              "flightNumber": "LH 40"
            },
            {
              "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
              "flightNumber": "LH 41"
            }
          ],
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "4cb9b5a8-7cac-4526-a0f7-f158fd14e9d1",
          "name": "2025-02",
          "pilot": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe",
            "pilotLicenseId": "UK-34560"
          },
          "flights": [
            {
              "id": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7",
              "flightNumber": "LH 42"
            }
          ],
          "createdAt": "2025-01-02T00:00:00.000Z",
          "updatedAt": null
        },
        {
          "id": "c2e12afb-a712-45aa-9ba5-fec71868e59a",
          "name": "2025-03",
          "pilot": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe",
            "pilotLicenseId": "UK-98540"
          },
          "flights": [
            {
              "id": "d4a25ef2-39cf-484c-af00-a548999e8699",
              "flightNumber": "LH 43"
            }
          ],
          "createdAt": "2025-01-03T00:00:00.000Z",
          "updatedAt": null
        }
      ]
      """

  Scenario: As an unauthorized user I cannot list rotations
    When I send a "GET" request to "/api/v1/rotation"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
