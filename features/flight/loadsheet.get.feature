Feature: Read the loadsheets of a flight

  Scenario: As anyone I can read the whole loadsheet history of a flight
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "kind": "preliminary",
          "revision": 1,
          "issuedById": null,
          "issuedAt": "2025-01-01T00:00:00.000Z",
          "flightCrew": {
            "pilots": 2,
            "reliefPilots": 0,
            "cabinCrew": 6
          },
          "passengers": 296,
          "passengersByCabin": null,
          "passengerMass": null,
          "cargo": 8.5,
          "payload": 40.3,
          "zeroFuelWeight": 208.9,
          "blockFuel": 12.7,
          "fuel": {
            "block": 12.7,
            "taxi": 0.3,
            "trip": 10.4,
            "alternate": 0.9,
            "reserve": 0.6,
            "contingencyType": "5%",
            "contingencyAmount": 0.5,
            "mel": 0,
            "atc": 0,
            "wxx": 0,
            "extra": 0,
            "tankering": 0
          }
        },
        {
          "id": "@uuid",
          "kind": "final",
          "revision": 1,
          "issuedById": null,
          "issuedAt": "2025-01-01T00:00:00.000Z",
          "flightCrew": {
            "pilots": 2,
            "reliefPilots": 0,
            "cabinCrew": 6
          },
          "passengers": 294,
          "passengersByCabin": null,
          "passengerMass": null,
          "cargo": 8.2,
          "payload": 39.1,
          "zeroFuelWeight": 207.7,
          "blockFuel": 12.5,
          "fuel": null
        }
      ]
      """

  Scenario: As anyone I can read only the preliminary revisions of a flight
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/loadsheet?type=preliminary"
    Then the response status should be 200
    And the response body property "0" should contain:
      """json
      {
        "id": "@uuid",
        "kind": "preliminary",
        "revision": 1,
        "issuedById": null,
        "issuedAt": "2025-01-01T00:00:00.000Z",
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 1,
          "cabinCrew": 12
        },
        "passengers": 330,
        "passengersByCabin": null,
        "passengerMass": 80,
        "cargo": 6.5,
        "payload": 32.9,
        "zeroFuelWeight": 201.491,
        "blockFuel": 71.636,
        "fuel": {
          "block": 71.636,
          "taxi": 0.8,
          "trip": 60.7,
          "alternate": 4.2,
          "reserve": 2.9,
          "contingencyType": "5%",
          "contingencyAmount": 3,
          "mel": 0,
          "atc": 0,
          "wxx": 0,
          "extra": 0,
          "tankering": 0
        }
      }
      """
    And the response body property "1" should contain:
      """json
      {
        "id": "@uuid",
        "kind": "preliminary",
        "revision": 2,
        "issuedById": null,
        "issuedAt": "2025-01-01T00:00:00.000Z",
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 1,
          "cabinCrew": 12
        },
        "passengers": 348,
        "passengersByCabin": null,
        "passengerMass": 80,
        "cargo": 8.004,
        "payload": 35.844,
        "zeroFuelWeight": 204.435,
        "blockFuel": 71.636,
        "fuel": {
          "block": 71.636,
          "taxi": 0.8,
          "trip": 60.7,
          "alternate": 4.2,
          "reserve": 2.9,
          "contingencyType": "5%",
          "contingencyAmount": 3,
          "mel": 0,
          "atc": 0,
          "wxx": 0,
          "extra": 0,
          "tankering": 0
        }
      }
      """

  Scenario: As anyone the final loadsheet is reported as a list of one
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet?type=final"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "kind": "final",
          "revision": 1,
          "issuedById": null,
          "issuedAt": "2025-01-01T00:00:00.000Z",
          "flightCrew": {
            "pilots": 2,
            "reliefPilots": 0,
            "cabinCrew": 6
          },
          "passengers": 294,
          "passengersByCabin": null,
          "passengerMass": null,
          "cargo": 8.2,
          "payload": 39.1,
          "zeroFuelWeight": 207.7,
          "blockFuel": 12.5,
          "fuel": null
        }
      ]
      """

  Scenario: As anyone a flight planned with no loadsheet reports an empty list
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/loadsheet"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As anyone a flight that never carried a final loadsheet reports an empty list
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/loadsheet?type=final"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As operations I read the same loadsheets as anyone else
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet?type=final"
    Then the response status should be 200
    And the response body property "0" should contain:
      """json
      {
        "id": "@uuid",
        "kind": "final",
        "revision": 1,
        "issuedById": null,
        "issuedAt": "2025-01-01T00:00:00.000Z",
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 6
        },
        "passengers": 294,
        "passengersByCabin": null,
        "passengerMass": null,
        "cargo": 8.2,
        "payload": 39.1,
        "zeroFuelWeight": 207.7,
        "blockFuel": 12.5,
        "fuel": null
      }
      """

  Scenario: As anyone I cannot ask for a kind of loadsheet that does not exist
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet?type=nonsense"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "type": ["type must be one of the following values: preliminary, final"]
        }
      }
      """

  Scenario: As anyone I cannot read the loadsheets of a flight that does not exist
    When I send a "GET" request to "/api/v1/flight/11111111-1111-4111-8111-111111111111/loadsheet"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As anyone I cannot read the loadsheets of a malformed flight identifier
    When I send a "GET" request to "/api/v1/flight/not-a-flight/loadsheet"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
