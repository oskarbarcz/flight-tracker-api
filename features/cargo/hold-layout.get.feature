Feature: Get aircraft hold layout by type

  Scenario: As operations I can get a bulk-loaded narrowbody hold, which declares no positions
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold/B738"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "B738",
        "variants": [
          {
            "id": "b738-bulk",
            "isDefault": true,
            "decks": [
              {
                "deck": "lower",
                "compartments": [
                  {
                    "number": 1,
                    "name": "forward",
                    "loading": "loose",
                    "maxWeightKg": 1995,
                    "volumeM3": 11.4,
                    "heated": false,
                    "ventilated": false,
                    "doorSide": "right",
                    "positions": []
                  },
                  {
                    "number": 2,
                    "name": "forward",
                    "loading": "loose",
                    "maxWeightKg": 1750,
                    "volumeM3": 10.0,
                    "heated": false,
                    "ventilated": false,
                    "doorSide": "right",
                    "positions": []
                  },
                  {
                    "number": 3,
                    "name": "aft",
                    "loading": "loose",
                    "maxWeightKg": 2205,
                    "volumeM3": 12.6,
                    "heated": true,
                    "ventilated": true,
                    "doorSide": "right",
                    "positions": []
                  },
                  {
                    "number": 4,
                    "name": "aft",
                    "loading": "loose",
                    "maxWeightKg": 1750,
                    "volumeM3": 10.0,
                    "heated": true,
                    "ventilated": true,
                    "doorSide": "right",
                    "positions": []
                  }
                ]
              }
            ]
          }
        ]
      }
      """

  Scenario: As a cabin crew member I can see that a narrowbody offers a container-capable variant, defaulting to bulk
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/cargo-hold/A320"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "A320",
        "variants": [
          { "id": "a320-bulk", "isDefault": true, "decks": "@any" },
          { "id": "a320-cls", "isDefault": false, "decks": "@any" }
        ]
      }
      """

  Scenario: As operations I can get the container positions of a container-capable narrowbody
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold/A320"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "A320",
        "variants": [
          { "id": "a320-bulk", "isDefault": true, "decks": "@any" },
          {
            "id": "a320-cls",
            "isDefault": false,
            "decks": [
              {
                "deck": "lower",
                "compartments": [
                  {
                    "number": 1,
                    "name": "forward",
                    "loading": "uld",
                    "maxWeightKg": 3402,
                    "volumeM3": 13.3,
                    "heated": false,
                    "ventilated": false,
                    "doorSide": "right",
                    "positions": [
                      {
                        "designator": "11P",
                        "compartment": 1,
                        "side": "full",
                        "acceptedBases": ["K"],
                        "acceptedContours": ["H"],
                        "maxWeightKg": 1134
                      },
                      {
                        "designator": "12P",
                        "compartment": 1,
                        "side": "full",
                        "acceptedBases": ["K"],
                        "acceptedContours": ["H"],
                        "maxWeightKg": 1134
                      },
                      {
                        "designator": "13P",
                        "compartment": 1,
                        "side": "full",
                        "acceptedBases": ["K"],
                        "acceptedContours": ["H"],
                        "maxWeightKg": 1134
                      }
                    ]
                  },
                  { "number": 3, "name": "aft", "loading": "uld", "maxWeightKg": 4536, "volumeM3": 12.0, "heated": true, "ventilated": true, "doorSide": "right", "positions": "@any" },
                  { "number": 4, "name": "aft", "loading": "loose", "maxWeightKg": 1400, "volumeM3": 8.0, "heated": true, "ventilated": true, "doorSide": "right", "positions": [] },
                  { "number": 5, "name": "bulk", "loading": "loose", "maxWeightKg": 717, "volumeM3": 4.1, "heated": true, "ventilated": true, "doorSide": "right", "positions": [] }
                ]
              }
            ]
          }
        ]
      }
      """

  Scenario: As operations I can see that a widebody offers two containerised variants and no bulk-only one
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold/B77W"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "B77W",
        "variants": [
          { "id": "b77w-ld3", "isDefault": true, "decks": "@any" },
          { "id": "b77w-mixed", "isDefault": false, "decks": "@any" }
        ]
      }
      """

  Scenario: As operations I can get a freighter hold, which has a main deck as well as a lower one
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold/B77F"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "B77F",
        "variants": [
          {
            "id": "b77f-side",
            "isDefault": true,
            "decks": [
              { "deck": "main", "compartments": "@any" },
              { "deck": "lower", "compartments": "@any" }
            ]
          }
        ]
      }
      """

  Scenario: Get the hold layout of a type carrying no curated data returns 404
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold/C172"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "No hold configuration is known for airframe type C172."
      }
      """

  Scenario: Get the hold layout of an unknown type returns 404
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold/ZZZZ"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "No hold configuration is known for airframe type ZZZZ."
      }
      """

  Scenario: As an unauthorized user I cannot get a hold layout
    When I send a "GET" request to "/api/v1/cargo-hold/B738"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
