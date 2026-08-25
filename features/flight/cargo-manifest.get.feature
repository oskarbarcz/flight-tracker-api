Feature: Read the cargo manifest of a flight

  Scenario: As operations I can read a generated cargo manifest
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 1.8,
        "cargo": 1.8,
        "zeroFuelWeight": 70.2,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
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
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
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
            "bagCount": null,
            "priority": false,
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
                "coldChain": "@any",
                "status": "loaded",
                "offloadReason": null,
                "offloadedFrom": null
              }
            ]
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As the captain of the flight I can read its cargo manifest
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 1.8,
        "cargo": 1.8,
        "zeroFuelWeight": 70.2,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
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
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: Filtering the manifest to loaded shipments returns them all
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 1.8,
        "cargo": 1.8,
        "zeroFuelWeight": 70.2,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
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
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 1,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: Filtering the manifest to offloaded shipments returns none before boarding
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 1.8,
        "cargo": 1.8,
        "zeroFuelWeight": 70.2,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
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
        "baggageKg": "@any",
        "bagCount": "@any",
        "baggageSource": "@any",
        "containerCount": 0,
        "bulkLotCount": 1,
        "shipmentCount": 0,
        "worstColdChainRisk": "@any",
        "dangerousGoodsCount": "@any",
        "cargoAircraftOnlyCount": "@any",
        "transferCount": "@any",
        "tightestConnectionMinutes": "@any",
        "compartmentLoad": "@any",
        "segregationAdvisories": [],
        "units": "@any"
      }
      """
    And I set database to initial state

  Scenario: Filtering the manifest to offloaded shipments lists each with its reason and the position it left
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/d2601432-e8cb-4018-8cee-f24aaaa29ca5/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 0
        },
        "passengers": 0,
        "payload": 4,
        "cargo": 4,
        "zeroFuelWeight": 72.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/d2601432-e8cb-4018-8cee-f24aaaa29ca5/cargo-manifest?status=offloaded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "d2601432-e8cb-4018-8cee-f24aaaa29ca5",
        "holdVariant": "b77w-ld3",
        "cargoKg": 4000,
        "baggageKg": 0,
        "bagCount": 0,
        "baggageSource": null,
        "containerCount": 4,
        "bulkLotCount": 0,
        "shipmentCount": 1,
        "worstColdChainRisk": null,
        "dangerousGoodsCount": 0,
        "cargoAircraftOnlyCount": 0,
        "transferCount": 0,
        "tightestConnectionMinutes": null,
        "compartmentLoad": [
          {
            "compartment": 1,
            "deck": "lower",
            "weightKg": 4000,
            "dryIceKg": 0
          }
        ],
        "segregationAdvisories": [],
        "units": [
          {
            "kind": "uld",
            "uldCode": "AKE48201AA",
            "uldType": "AKE",
            "positionDesignator": null,
            "compartment": 1,
            "deck": "lower",
            "tareKg": 0,
            "grossKg": 0,
            "volumeM3": 0,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-48203713",
                "commodity": "printed-matter",
                "description": "Books, palletised",
                "pieces": 64,
                "grossKg": 1418,
                "volumeM3": 2.026,
                "shc": [],
                "shipper": "Bauer Verlag GmbH",
                "consignee": "Whitaker Distribution LLC",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": null,
                "coldChain": null,
                "status": "offloaded",
                "offloadReason": "payload_restriction",
                "offloadedFrom": "11L"
              }
            ]
          },
          {
            "kind": "uld",
            "uldCode": "AKE48202AA",
            "uldType": "AKE",
            "positionDesignator": "11R",
            "compartment": 1,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 1400,
            "volumeM3": 2.545,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": []
          },
          {
            "kind": "uld",
            "uldCode": "AKE48203AA",
            "uldType": "AKE",
            "positionDesignator": "12L",
            "compartment": 1,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 900,
            "volumeM3": 4.091,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": []
          },
          {
            "kind": "uld",
            "uldCode": "AKE48204AA",
            "uldType": "AKE",
            "positionDesignator": "12R",
            "compartment": 1,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 1454,
            "volumeM3": 2.423,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": []
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/flight/d2601432-e8cb-4018-8cee-f24aaaa29ca5/cargo-manifest?status=loaded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "d2601432-e8cb-4018-8cee-f24aaaa29ca5",
        "holdVariant": "b77w-ld3",
        "cargoKg": 4000,
        "baggageKg": 0,
        "bagCount": 0,
        "baggageSource": null,
        "containerCount": 4,
        "bulkLotCount": 0,
        "shipmentCount": 3,
        "worstColdChainRisk": null,
        "dangerousGoodsCount": 0,
        "cargoAircraftOnlyCount": 0,
        "transferCount": 0,
        "tightestConnectionMinutes": null,
        "compartmentLoad": [
          {
            "compartment": 1,
            "deck": "lower",
            "weightKg": 4000,
            "dryIceKg": 0
          }
        ],
        "segregationAdvisories": [],
        "units": [
          {
            "kind": "uld",
            "uldCode": "AKE48201AA",
            "uldType": "AKE",
            "positionDesignator": null,
            "compartment": 1,
            "deck": "lower",
            "tareKg": 0,
            "grossKg": 0,
            "volumeM3": 0,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": []
          },
          {
            "kind": "uld",
            "uldCode": "AKE48202AA",
            "uldType": "AKE",
            "positionDesignator": "11R",
            "compartment": 1,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 1400,
            "volumeM3": 2.545,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-48203724",
                "commodity": "coffee-beans",
                "description": "Speciality green coffee, bagged",
                "pieces": 35,
                "grossKg": 1400,
                "volumeM3": 2.545,
                "shc": ["EAT"],
                "shipper": "Rheinhafen Rohkaffee GmbH",
                "consignee": "Hudson Roasting Co.",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": null,
                "coldChain": null,
                "status": "loaded",
                "offloadReason": null,
                "offloadedFrom": null
              }
            ]
          },
          {
            "kind": "uld",
            "uldCode": "AKE48203AA",
            "uldType": "AKE",
            "positionDesignator": "12L",
            "compartment": 1,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 900,
            "volumeM3": 4.091,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-48203735",
                "commodity": "medical-devices",
                "description": "Sterile medical devices",
                "pieces": 56,
                "grossKg": 900,
                "volumeM3": 4.091,
                "shc": ["PIL"],
                "shipper": "Kirchner Medizintechnik GmbH",
                "consignee": "Bayside Hospital Supply Inc.",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": null,
                "coldChain": null,
                "status": "loaded",
                "offloadReason": null,
                "offloadedFrom": null
              }
            ]
          },
          {
            "kind": "uld",
            "uldCode": "AKE48204AA",
            "uldType": "AKE",
            "positionDesignator": "12R",
            "compartment": 1,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 1454,
            "volumeM3": 2.423,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-48203746",
                "commodity": "engine-fan-blades",
                "description": "Turbofan blade set, AOG",
                "pieces": 4,
                "grossKg": 1454,
                "volumeM3": 2.423,
                "shc": ["HEA"],
                "shipper": "Rhein-Main Aero Services GmbH",
                "consignee": "Kennedy Line Maintenance Inc.",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": null,
                "coldChain": null,
                "status": "loaded",
                "offloadReason": null,
                "offloadedFrom": null
              }
            ]
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: A compartment carrying an incompatible pair reports it, ignoring freight already offloaded
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/792e3698-b46d-4c1b-bc99-451596660760/cargo-manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "792e3698-b46d-4c1b-bc99-451596660760",
        "holdVariant": "b77w-ld3",
        "cargoKg": 1964,
        "baggageKg": 0,
        "bagCount": 0,
        "baggageSource": null,
        "containerCount": 3,
        "bulkLotCount": 0,
        "shipmentCount": 3,
        "worstColdChainRisk": null,
        "dangerousGoodsCount": 2,
        "cargoAircraftOnlyCount": 0,
        "transferCount": 0,
        "tightestConnectionMinutes": null,
        "compartmentLoad": [
          {
            "compartment": 3,
            "deck": "lower",
            "weightKg": 1964,
            "dryIceKg": 1400
          }
        ],
        "segregationAdvisories": [
          {
            "compartment": 3,
            "deck": "lower",
            "one": "ICE",
            "other": "AVIH"
          }
        ],
        "units": [
          {
            "kind": "uld",
            "uldCode": "AKE55101AA",
            "uldType": "AKE",
            "positionDesignator": "31L",
            "compartment": 3,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 400,
            "volumeM3": 2,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-55102202",
                "commodity": "pets-in-hold",
                "description": "Domestic pets in travel kennels",
                "pieces": 12,
                "grossKg": 400,
                "volumeM3": 2,
                "shc": ["AVIH"],
                "shipper": "Rhein-Main Pet Travel GmbH",
                "consignee": "Queens Animal Reception Inc.",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": null,
                "coldChain": null,
                "status": "loaded",
                "offloadReason": null,
                "offloadedFrom": null
              }
            ]
          },
          {
            "kind": "uld",
            "uldCode": "AKE55103AA",
            "uldType": "AKE",
            "positionDesignator": null,
            "compartment": 3,
            "deck": "lower",
            "tareKg": 0,
            "grossKg": 0,
            "volumeM3": 0,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-55102224",
                "commodity": "radiopharmaceuticals",
                "description": "Radiopharmaceutical doses, shielded",
                "pieces": 6,
                "grossKg": 120,
                "volumeM3": 0.1,
                "shc": ["PIL", "RRY"],
                "shipper": "Marburg Isotopes GmbH",
                "consignee": "Bayside Nuclear Medicine Inc.",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": {
                  "ercCode": "7L",
                  "unNumber": "2915",
                  "hazardClass": "7",
                  "packingGroup": null,
                  "netPerPackage": "1 TBq",
                  "subsidiaryRisk": null,
                  "cargoAircraftOnly": false,
                  "properShippingName": "Radioactive material, Type A package, non-special form"
                },
                "coldChain": null,
                "status": "offloaded",
                "offloadReason": "payload_restriction",
                "offloadedFrom": "32L"
              }
            ]
          },
          {
            "kind": "uld",
            "uldCode": "AKE55102AA",
            "uldType": "AKE",
            "positionDesignator": "31R",
            "compartment": 3,
            "deck": "lower",
            "tareKg": 82,
            "grossKg": 1400,
            "volumeM3": 2,
            "contentClass": "cargo",
            "beyondDestination": null,
            "sealed": false,
            "bagCount": null,
            "priority": false,
            "shipments": [
              {
                "awb": "001-55102213",
                "commodity": "dry-ice",
                "description": "Carbon dioxide, solid, as refrigerant",
                "pieces": 64,
                "grossKg": 1400,
                "volumeM3": 2,
                "shc": ["ICE"],
                "shipper": "Hessen Kaeltetechnik GmbH",
                "consignee": "Brooklyn Cold Logistics Inc.",
                "origin": "FRA",
                "destination": "JFK",
                "transferRole": "local",
                "onwardCarrier": null,
                "onwardFlightNumber": null,
                "connectionMinutes": null,
                "connectionAtRisk": false,
                "dangerousGoods": {
                  "ercCode": "9A",
                  "unNumber": "1845",
                  "sourceNote": "An asphyxiant rather than an anaesthetic; A is the nearest additional-risk letter the drill chart defines.",
                  "hazardClass": "9",
                  "packingGroup": null,
                  "netPerPackage": "22 kg",
                  "subsidiaryRisk": null,
                  "cargoAircraftOnly": false,
                  "properShippingName": "Carbon dioxide, solid"
                },
                "coldChain": null,
                "status": "loaded",
                "offloadReason": null,
                "offloadedFrom": null
              }
            ]
          }
        ]
      }
      """

  Scenario: A manifest the system generated reports no conflict
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "cabinCrew": 0,
          "reliefPilots": 0
        },
        "passengers": 0,
        "payload": 18,
        "cargo": 18,
        "zeroFuelWeight": 86.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64/cargo-manifest"
    Then the response status should be 200
    And the response body property "segregationAdvisories" should contain:
      """json
      []
      """
    And I set database to initial state

  Scenario: A flight whose aircraft type has no hold data reports no conflict
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/dc20c7ff-114e-42be-86cc-34fd90b71b35/cargo-manifest"
    Then the response status should be 200
    And the response body property "segregationAdvisories" should contain:
      """json
      []
      """

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

  Scenario: A flight whose loadsheet has not been written reports no cargo manifest
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/cargo-manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no cargo manifest yet. It is generated from the preliminary loadsheet."
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
