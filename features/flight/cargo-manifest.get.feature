Feature: Read the cargo manifest of a flight

  Scenario: As operations I can read a generated cargo manifest
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86",
        "holdVariant": "b738-bulk",
        "cargoKg": 1800,
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "units": [
          {
            "kind": "bulk_lot",
            "uldCode": null,
            "uldType": null,
            "positionDesignator": null,
            "compartment": "@any",
            "deck": "lower",
            "tareKg": 0,
            "grossKg": 1800,
            "volumeM3": "@any",
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "shipments": [
              {
                "awb": "@any",
                "commodity": "@any",
                "description": "@any",
                "pieces": "@any",
                "grossKg": 1800,
                "volumeM3": "@any",
                "shc": "@any",
                "shipper": "@any",
                "consignee": "@any",
                "origin": "@any",
                "destination": "@any",
                "transferRole": "@any",
                "onwardCarrier": "@any",
                "onwardFlightNumber": "@any",
                "connectionMinutes": "@any",
                "connectionAtRisk": "@any",
                "dangerousGoods": "@any",
                "status": "loaded"
              }
            ]
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As the captain of the flight I can read its cargo manifest
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/mark-as-ready"
    Then the response status should be 204
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/check-in" with body:
      """json
      {
        "arrivalTime": "2025-06-02T17:35:00.000Z",
        "onBlockTime": "2025-06-02T17:45:00.000Z",
        "takeoffTime": "2025-06-02T09:25:00.000Z",
        "offBlockTime": "2025-06-02T09:05:00.000Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86",
        "holdVariant": "b738-bulk",
        "cargoKg": 1800,
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: Filtering the manifest to loaded shipments returns them all
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest?status=loaded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86",
        "holdVariant": "b738-bulk",
        "cargoKg": 1800,
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: Filtering the manifest to offloaded shipments returns none before boarding
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest?status=offloaded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86",
        "holdVariant": "b738-bulk",
        "cargoKg": 1800,
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 0,
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: Filtering the manifest by an unknown status is rejected
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest?status=missing"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "status": ["status must be one of the following values: loaded, offloaded"]
        }
      }
      """

  Scenario: A flight that has not been released reports no cargo manifest
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no cargo manifest yet. It is generated when the flight is released to the pilot."
      }
      """

  Scenario: As cabin crew who do not command the flight I cannot read its cargo manifest
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "error": "Forbidden",
        "message": "Cabin crew can only read the cargo manifest of a flight they captain."
      }
      """

  Scenario: As an unauthorized user I cannot read a cargo manifest
    When I send a "GET" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/cargo-manifest"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
