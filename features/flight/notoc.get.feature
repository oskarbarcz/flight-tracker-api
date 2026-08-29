Feature: Get flight notification to captain

  Scenario: As operations I can read a notification carrying dangerous goods
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380/notoc"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380",
        "stage": "preliminary",
        "issuedAt": "2025-06-02T07:40:00.000Z",
        "acknowledgedById": null,
        "acknowledgedAt": null,
        "document": {
          "summary": {
            "cargoKg": 14900,
            "baggageKg": 0,
            "deadloadKg": 14900,
            "beyondCount": 0,
            "palletCount": 3,
            "compartments": [
              {
                "deck": "lower",
                "dryIceKg": 900,
                "weightKg": 3946,
                "compartment": 1
              },
              {
                "deck": "lower",
                "dryIceKg": 0,
                "weightKg": 782,
                "compartment": 3
              },
              {
                "deck": "main",
                "dryIceKg": 0,
                "weightKg": 10172,
                "compartment": 6
              }
            ],
            "looseLotCount": 0,
            "containerCount": 4,
            "tightestConnectionMinutes": null
          },
          "coldChain": [
            {
              "awb": "172-62001166",
              "risk": "low",
              "regime": "COL",
              "advisory": true,
              "description": "Vaccine doses, 2-8C",
              "explanation": "An active container with 88.5 h margin on a 100 h endurance.",
              "marginHours": 88.5
            }
          ],
          "statement": "Dangerous goods loaded as listed below.",
          "specialLoads": [
            {
              "awb": "172-62001100",
              "shc": ["AVI", "HEA"],
              "grossKg": 4000,
              "position": "6AL",
              "compartment": 6,
              "description": "Live horses in air stalls",
              "heaviestPiece": {
                "kg": 620,
                "widthCm": 110,
                "heightCm": 230,
                "lengthCm": 300
              },
              "unloadingAirport": "JFK"
            },
            {
              "awb": "172-62001111",
              "shc": ["HEA", "BIG"],
              "grossKg": 4200,
              "position": "6BL",
              "compartment": 6,
              "description": "Main landing gear leg, AOG",
              "heaviestPiece": {
                "kg": 1600,
                "widthCm": 130,
                "heightCm": 150,
                "lengthCm": 340
              },
              "unloadingAirport": "JFK"
            },
            {
              "awb": "172-62001122",
              "shc": ["HUM", "HEA"],
              "grossKg": 1072,
              "position": "6CL",
              "compartment": 6,
              "description": "Human remains in coffin",
              "heaviestPiece": {
                "kg": 260,
                "widthCm": 70,
                "heightCm": 60,
                "lengthCm": 220
              },
              "unloadingAirport": "JFK"
            },
            {
              "awb": "172-62001166",
              "shc": ["PIL"],
              "grossKg": 700,
              "position": "31L",
              "compartment": 3,
              "description": "Vaccine doses, 2-8C",
              "heaviestPiece": null,
              "unloadingAirport": "JFK"
            }
          ],
          "dangerousGoods": [
            {
              "awb": "172-62001133",
              "drill": {
                "ercCode": "3L",
                "inherentRisk": "Flammable liquid or solid; vapours may form an explosive mixture.",
                "additionalRisks": ["No significant risk beyond the drill itself."],
                "spillAndFireProcedure": "Contain the spill and keep every ignition source away. Fight the fire with water spray, foam, dry chemical or carbon dioxide.",
                "riskToAircraftAndOccupants": "Rapid fire spread and dense smoke; heat may weaken structure and burn anyone in reach."
              },
              "packages": 78,
              "position": "11L",
              "unNumber": "1263",
              "compartment": 1,
              "hazardClass": "3",
              "packingGroup": "II",
              "netPerPackage": "5 L",
              "subsidiaryRisk": null,
              "unloadingAirport": "JFK",
              "cargoAircraftOnly": false,
              "properShippingName": "Paint"
            },
            {
              "awb": "172-62001144",
              "drill": {
                "ercCode": "9F",
                "inherentRisk": "A hazard that no other class covers, such as heat, an anaesthetic vapour, a magnetic field or harm to the environment.",
                "additionalRisks": ["Flammable."],
                "spillAndFireProcedure": "Ventilate and keep clear of the spill. Fight the fire with the agent suited to the surrounding material.",
                "riskToAircraftAndOccupants": "Depends on the substance; may affect instruments, air quality or the health of anyone exposed."
              },
              "packages": 140,
              "position": "11R",
              "unNumber": "3480",
              "compartment": 1,
              "hazardClass": "9",
              "packingGroup": "II",
              "netPerPackage": "10 kg",
              "subsidiaryRisk": null,
              "unloadingAirport": "JFK",
              "cargoAircraftOnly": true,
              "properShippingName": "Lithium ion batteries"
            },
            {
              "awb": "172-62001155",
              "drill": {
                "ercCode": "9A",
                "inherentRisk": "A hazard that no other class covers, such as heat, an anaesthetic vapour, a magnetic field or harm to the environment.",
                "additionalRisks": ["Anaesthetic or narcotic vapour."],
                "spillAndFireProcedure": "Ventilate and keep clear of the spill. Fight the fire with the agent suited to the surrounding material.",
                "riskToAircraftAndOccupants": "Depends on the substance; may affect instruments, air quality or the health of anyone exposed."
              },
              "packages": 41,
              "position": "12L",
              "unNumber": "1845",
              "compartment": 1,
              "hazardClass": "9",
              "packingGroup": null,
              "netPerPackage": "22 kg",
              "subsidiaryRisk": null,
              "unloadingAirport": "JFK",
              "cargoAircraftOnly": false,
              "properShippingName": "Carbon dioxide, solid"
            }
          ]
        },
        "changes": null
      }
      """

  Scenario: As the captain of the flight I can read its notification
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380/notoc"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380",
        "stage": "preliminary",
        "issuedAt": "2025-06-02T07:40:00.000Z",
        "acknowledgedById": null,
        "acknowledgedAt": null,
        "document": {
          "summary": {
            "cargoKg": 14900,
            "baggageKg": 0,
            "deadloadKg": 14900,
            "beyondCount": 0,
            "palletCount": 3,
            "compartments": [
              {
                "deck": "lower",
                "dryIceKg": 900,
                "weightKg": 3946,
                "compartment": 1
              },
              {
                "deck": "lower",
                "dryIceKg": 0,
                "weightKg": 782,
                "compartment": 3
              },
              {
                "deck": "main",
                "dryIceKg": 0,
                "weightKg": 10172,
                "compartment": 6
              }
            ],
            "looseLotCount": 0,
            "containerCount": 4,
            "tightestConnectionMinutes": null
          },
          "coldChain": [
            {
              "awb": "172-62001166",
              "risk": "low",
              "regime": "COL",
              "advisory": true,
              "description": "Vaccine doses, 2-8C",
              "explanation": "An active container with 88.5 h margin on a 100 h endurance.",
              "marginHours": 88.5
            }
          ],
          "statement": "Dangerous goods loaded as listed below.",
          "specialLoads": [
            {
              "awb": "172-62001100",
              "shc": ["AVI", "HEA"],
              "grossKg": 4000,
              "position": "6AL",
              "compartment": 6,
              "description": "Live horses in air stalls",
              "heaviestPiece": {
                "kg": 620,
                "widthCm": 110,
                "heightCm": 230,
                "lengthCm": 300
              },
              "unloadingAirport": "JFK"
            },
            {
              "awb": "172-62001111",
              "shc": ["HEA", "BIG"],
              "grossKg": 4200,
              "position": "6BL",
              "compartment": 6,
              "description": "Main landing gear leg, AOG",
              "heaviestPiece": {
                "kg": 1600,
                "widthCm": 130,
                "heightCm": 150,
                "lengthCm": 340
              },
              "unloadingAirport": "JFK"
            },
            {
              "awb": "172-62001122",
              "shc": ["HUM", "HEA"],
              "grossKg": 1072,
              "position": "6CL",
              "compartment": 6,
              "description": "Human remains in coffin",
              "heaviestPiece": {
                "kg": 260,
                "widthCm": 70,
                "heightCm": 60,
                "lengthCm": 220
              },
              "unloadingAirport": "JFK"
            },
            {
              "awb": "172-62001166",
              "shc": ["PIL"],
              "grossKg": 700,
              "position": "31L",
              "compartment": 3,
              "description": "Vaccine doses, 2-8C",
              "heaviestPiece": null,
              "unloadingAirport": "JFK"
            }
          ],
          "dangerousGoods": [
            {
              "awb": "172-62001133",
              "drill": {
                "ercCode": "3L",
                "inherentRisk": "Flammable liquid or solid; vapours may form an explosive mixture.",
                "additionalRisks": ["No significant risk beyond the drill itself."],
                "spillAndFireProcedure": "Contain the spill and keep every ignition source away. Fight the fire with water spray, foam, dry chemical or carbon dioxide.",
                "riskToAircraftAndOccupants": "Rapid fire spread and dense smoke; heat may weaken structure and burn anyone in reach."
              },
              "packages": 78,
              "position": "11L",
              "unNumber": "1263",
              "compartment": 1,
              "hazardClass": "3",
              "packingGroup": "II",
              "netPerPackage": "5 L",
              "subsidiaryRisk": null,
              "unloadingAirport": "JFK",
              "cargoAircraftOnly": false,
              "properShippingName": "Paint"
            },
            {
              "awb": "172-62001144",
              "drill": {
                "ercCode": "9F",
                "inherentRisk": "A hazard that no other class covers, such as heat, an anaesthetic vapour, a magnetic field or harm to the environment.",
                "additionalRisks": ["Flammable."],
                "spillAndFireProcedure": "Ventilate and keep clear of the spill. Fight the fire with the agent suited to the surrounding material.",
                "riskToAircraftAndOccupants": "Depends on the substance; may affect instruments, air quality or the health of anyone exposed."
              },
              "packages": 140,
              "position": "11R",
              "unNumber": "3480",
              "compartment": 1,
              "hazardClass": "9",
              "packingGroup": "II",
              "netPerPackage": "10 kg",
              "subsidiaryRisk": null,
              "unloadingAirport": "JFK",
              "cargoAircraftOnly": true,
              "properShippingName": "Lithium ion batteries"
            },
            {
              "awb": "172-62001155",
              "drill": {
                "ercCode": "9A",
                "inherentRisk": "A hazard that no other class covers, such as heat, an anaesthetic vapour, a magnetic field or harm to the environment.",
                "additionalRisks": ["Anaesthetic or narcotic vapour."],
                "spillAndFireProcedure": "Ventilate and keep clear of the spill. Fight the fire with the agent suited to the surrounding material.",
                "riskToAircraftAndOccupants": "Depends on the substance; may affect instruments, air quality or the health of anyone exposed."
              },
              "packages": 41,
              "position": "12L",
              "unNumber": "1845",
              "compartment": 1,
              "hazardClass": "9",
              "packingGroup": null,
              "netPerPackage": "22 kg",
              "subsidiaryRisk": null,
              "unloadingAirport": "JFK",
              "cargoAircraftOnly": false,
              "properShippingName": "Carbon dioxide, solid"
            }
          ]
        },
        "changes": null
      }
      """

  Scenario: A flight carrying nothing hazardous says so rather than carrying no notification
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/d2601432-e8cb-4018-8cee-f24aaaa29ca5/notoc"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "d2601432-e8cb-4018-8cee-f24aaaa29ca5",
        "stage": "preliminary",
        "issuedAt": "2025-06-02T07:30:00.000Z",
        "acknowledgedById": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "acknowledgedAt": "2025-06-02T08:00:00.000Z",
        "document": {
          "summary": {
            "cargoKg": 5500,
            "baggageKg": 0,
            "deadloadKg": 5500,
            "beyondCount": 0,
            "palletCount": 0,
            "compartments": [
              {
                "deck": "lower",
                "dryIceKg": 0,
                "weightKg": 5500,
                "compartment": 1
              }
            ],
            "looseLotCount": 0,
            "containerCount": 4,
            "tightestConnectionMinutes": null
          },
          "coldChain": [],
          "statement": "No dangerous goods loaded.",
          "specialLoads": [
            {
              "awb": "001-48203735",
              "shc": ["PIL"],
              "grossKg": 900,
              "position": "12L",
              "compartment": 1,
              "description": "Sterile medical devices",
              "heaviestPiece": null,
              "unloadingAirport": "JFK"
            },
            {
              "awb": "001-48203746",
              "shc": ["HEA"],
              "grossKg": 1454,
              "position": "12R",
              "compartment": 1,
              "description": "Turbofan blade set, AOG",
              "heaviestPiece": {
                "kg": 900,
                "widthCm": 110,
                "heightCm": 95,
                "lengthCm": 240
              },
              "unloadingAirport": "JFK"
            }
          ],
          "dangerousGoods": []
        },
        "changes": null
      }
      """

  Scenario: The notification issued at release is unchanged by what boarding does to the load
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
    When I send a "GET" request to "/api/v1/flight/d2601432-e8cb-4018-8cee-f24aaaa29ca5/notoc?stage=preliminary"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "d2601432-e8cb-4018-8cee-f24aaaa29ca5",
        "stage": "preliminary",
        "issuedAt": "2025-06-02T07:30:00.000Z",
        "acknowledgedById": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "acknowledgedAt": "2025-06-02T08:00:00.000Z",
        "document": {
          "summary": {
            "cargoKg": 5500,
            "baggageKg": 0,
            "deadloadKg": 5500,
            "beyondCount": 0,
            "palletCount": 0,
            "compartments": [
              {
                "deck": "lower",
                "dryIceKg": 0,
                "weightKg": 5500,
                "compartment": 1
              }
            ],
            "looseLotCount": 0,
            "containerCount": 4,
            "tightestConnectionMinutes": null
          },
          "coldChain": [],
          "statement": "No dangerous goods loaded.",
          "specialLoads": [
            {
              "awb": "001-48203735",
              "shc": ["PIL"],
              "grossKg": 900,
              "position": "12L",
              "compartment": 1,
              "description": "Sterile medical devices",
              "heaviestPiece": null,
              "unloadingAirport": "JFK"
            },
            {
              "awb": "001-48203746",
              "shc": ["HEA"],
              "grossKg": 1454,
              "position": "12R",
              "compartment": 1,
              "description": "Turbofan blade set, AOG",
              "heaviestPiece": {
                "kg": 900,
                "widthCm": 110,
                "heightCm": 95,
                "lengthCm": 240
              },
              "unloadingAirport": "JFK"
            }
          ],
          "dangerousGoods": []
        },
        "changes": null
      }
      """
    And I set database to initial state

  Scenario: A flight whose loadsheet has not been written reports no notification
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/notoc"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no notification to captain yet. It is issued from the preliminary loadsheet."
      }
      """

  Scenario: Reading an unknown stage is rejected
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380/notoc?stage=interim"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "stage": ["stage must be one of the following values: preliminary, final"]
        }
      }
      """

  Scenario: As an admin I cannot read a notification to captain
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380/notoc"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a pilot who does not command the flight I cannot read its notification
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/flight/2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380/notoc"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "error": "Forbidden",
        "message": "Cabin crew can only read the notification to captain of a flight they captain."
      }
      """

  Scenario: As an unauthorized user I cannot read a notification to captain
    When I send a "GET" request to "/api/v1/flight/2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380/notoc"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
