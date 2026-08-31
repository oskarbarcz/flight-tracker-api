Feature: Read the ETOPS briefing of a flight

  Scenario: As anyone I can read the whole briefing as one document
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/etops-briefing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "etops": {
          "ruleMinutes": 370,
          "ruleRadiusNm": 2694.83,
          "thresholdMinutes": 60,
          "thresholdRadiusNm": 437,
          "points": [
            {
              "kind": "entry",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
              "position": {
                "latitude": 51.7549,
                "longitude": -43.4583
              },
              "elapsedSeconds": 9720,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                }
              ]
            },
            {
              "kind": "equal_time",
              "ordinal": 1,
              "isCritical": true,
              "adequateAirportId": null,
              "position": {
                "latitude": 52.0967,
                "longitude": -33.4667
              },
              "elapsedSeconds": 11940,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                },
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 2
                }
              ]
            },
            {
              "kind": "exit",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "position": {
                "latitude": 52.9433,
                "longitude": -20.9317
              },
              "elapsedSeconds": 14160,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 1
                }
              ]
            }
          ],
          "airports": [
            {
              "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "suitabilityStart": "2025-01-06T00:52:00.000Z",
              "suitabilityEnd": "2025-01-06T04:10:00.000Z",
              "plannedRunway": "28",
              "forecastCeiling": 1500,
              "forecastVisibility": 9999,
              "transitionAltitude": 7000,
              "transitionLevel": 7500
            },
            {
              "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
              "suitabilityStart": "2025-01-05T23:01:00.000Z",
              "suitabilityEnd": "2025-01-06T02:52:00.000Z",
              "plannedRunway": "13",
              "forecastCeiling": 900,
              "forecastVisibility": 8050,
              "transitionAltitude": 18000,
              "transitionLevel": 18000
            }
          ]
        },
        "route": {
          "route": "TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY UN546 LAPEX NATA JANJO DCT HOIST",
          "fixes": [
            {
              "ordinal": 0,
              "ident": "EDDF",
              "latitude": 50.04693,
              "longitude": 8.57397,
              "altitude": 364,
              "elapsedSeconds": 0,
              "distanceNm": 0,
              "trackTrue": 0,
              "trackMag": 0,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 1,
              "ident": "TOBAK",
              "latitude": 50.10694,
              "longitude": 8.28333,
              "altitude": 12000,
              "elapsedSeconds": 900,
              "distanceNm": 21,
              "trackTrue": 283,
              "trackMag": 285,
              "viaAirway": "TOBAK1C",
              "stage": "CLB"
            },
            {
              "ordinal": 2,
              "ident": "TOC",
              "latitude": 50.63333,
              "longitude": 6.5,
              "altitude": 35000,
              "elapsedSeconds": 1800,
              "distanceNm": 88,
              "trackTrue": 289,
              "trackMag": 291,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 3,
              "ident": "LAPEX",
              "latitude": 53.51667,
              "longitude": -10,
              "altitude": 37000,
              "elapsedSeconds": 7200,
              "distanceNm": 620,
              "trackTrue": 295,
              "trackMag": 302,
              "viaAirway": "UN546",
              "stage": "CRZ"
            },
            {
              "ordinal": 4,
              "ident": "5620N",
              "latitude": 56,
              "longitude": -20,
              "altitude": 39000,
              "elapsedSeconds": 10800,
              "distanceNm": 405,
              "trackTrue": 288,
              "trackMag": 305,
              "viaAirway": "NATA",
              "stage": "CRZ"
            },
            {
              "ordinal": 5,
              "ident": "TOD",
              "latitude": 42.5,
              "longitude": -70.5,
              "altitude": 39000,
              "elapsedSeconds": 17400,
              "distanceNm": 1580,
              "trackTrue": 244,
              "trackMag": 258,
              "viaAirway": "DCT",
              "stage": "CRZ"
            },
            {
              "ordinal": 6,
              "ident": "KJFK",
              "latitude": 40.6413,
              "longitude": -73.7781,
              "altitude": 13,
              "elapsedSeconds": 19800,
              "distanceNm": 49,
              "trackTrue": 262,
              "trackMag": 275,
              "viaAirway": "ROBER1",
              "stage": "DSC"
            }
          ]
        },
        "oceanicCrossing": {
          "routing": "track",
          "trackId": "A",
          "direction": "west",
          "tracks": [
            {
              "identifier": "X",
              "direction": "east",
              "tmi": "241",
              "issuingOca": "CZQX",
              "route": "RESNO 5540N 5450N DOGAL",
              "levels": [
                320,
                330,
                340,
                350
              ],
              "validFrom": "2025-01-05T23:00:00.000Z",
              "validTo": "2025-01-06T06:30:00.000Z",
              "fixes": [
                {
                  "ident": "RESNO",
                  "latitude": 55,
                  "longitude": -15
                },
                {
                  "ident": "DOGAL",
                  "latitude": 54.5,
                  "longitude": -50
                }
              ]
            },
            {
              "identifier": "A",
              "direction": "west",
              "tmi": "241",
              "issuingOca": "EGGX",
              "route": "MALOT 5620N 5730N 5740N 5650N JANJO",
              "levels": [
                340,
                350,
                360,
                370,
                380,
                390,
                400
              ],
              "validFrom": "2025-01-05T11:00:00.000Z",
              "validTo": "2025-01-05T18:30:00.000Z",
              "fixes": [
                {
                  "ident": "MALOT",
                  "latitude": 54,
                  "longitude": -15
                },
                {
                  "ident": "5620N",
                  "latitude": 56,
                  "longitude": -20
                },
                {
                  "ident": "JANJO",
                  "latitude": 55.5,
                  "longitude": -53
                }
              ]
            }
          ]
        }
      }
      """

  Scenario: As operations I read the same briefing as anyone else
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/etops-briefing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "etops": {
          "ruleMinutes": 370,
          "ruleRadiusNm": 2694.83,
          "thresholdMinutes": 60,
          "thresholdRadiusNm": 437,
          "points": [
            {
              "kind": "entry",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
              "position": {
                "latitude": 51.7549,
                "longitude": -43.4583
              },
              "elapsedSeconds": 9720,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                }
              ]
            },
            {
              "kind": "equal_time",
              "ordinal": 1,
              "isCritical": true,
              "adequateAirportId": null,
              "position": {
                "latitude": 52.0967,
                "longitude": -33.4667
              },
              "elapsedSeconds": 11940,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                },
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 2
                }
              ]
            },
            {
              "kind": "exit",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "position": {
                "latitude": 52.9433,
                "longitude": -20.9317
              },
              "elapsedSeconds": 14160,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 1
                }
              ]
            }
          ],
          "airports": [
            {
              "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "suitabilityStart": "2025-01-06T00:52:00.000Z",
              "suitabilityEnd": "2025-01-06T04:10:00.000Z",
              "plannedRunway": "28",
              "forecastCeiling": 1500,
              "forecastVisibility": 9999,
              "transitionAltitude": 7000,
              "transitionLevel": 7500
            },
            {
              "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
              "suitabilityStart": "2025-01-05T23:01:00.000Z",
              "suitabilityEnd": "2025-01-06T02:52:00.000Z",
              "plannedRunway": "13",
              "forecastCeiling": 900,
              "forecastVisibility": 8050,
              "transitionAltitude": 18000,
              "transitionLevel": 18000
            }
          ]
        },
        "route": {
          "route": "TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY UN546 LAPEX NATA JANJO DCT HOIST",
          "fixes": [
            {
              "ordinal": 0,
              "ident": "EDDF",
              "latitude": 50.04693,
              "longitude": 8.57397,
              "altitude": 364,
              "elapsedSeconds": 0,
              "distanceNm": 0,
              "trackTrue": 0,
              "trackMag": 0,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 1,
              "ident": "TOBAK",
              "latitude": 50.10694,
              "longitude": 8.28333,
              "altitude": 12000,
              "elapsedSeconds": 900,
              "distanceNm": 21,
              "trackTrue": 283,
              "trackMag": 285,
              "viaAirway": "TOBAK1C",
              "stage": "CLB"
            },
            {
              "ordinal": 2,
              "ident": "TOC",
              "latitude": 50.63333,
              "longitude": 6.5,
              "altitude": 35000,
              "elapsedSeconds": 1800,
              "distanceNm": 88,
              "trackTrue": 289,
              "trackMag": 291,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 3,
              "ident": "LAPEX",
              "latitude": 53.51667,
              "longitude": -10,
              "altitude": 37000,
              "elapsedSeconds": 7200,
              "distanceNm": 620,
              "trackTrue": 295,
              "trackMag": 302,
              "viaAirway": "UN546",
              "stage": "CRZ"
            },
            {
              "ordinal": 4,
              "ident": "5620N",
              "latitude": 56,
              "longitude": -20,
              "altitude": 39000,
              "elapsedSeconds": 10800,
              "distanceNm": 405,
              "trackTrue": 288,
              "trackMag": 305,
              "viaAirway": "NATA",
              "stage": "CRZ"
            },
            {
              "ordinal": 5,
              "ident": "TOD",
              "latitude": 42.5,
              "longitude": -70.5,
              "altitude": 39000,
              "elapsedSeconds": 17400,
              "distanceNm": 1580,
              "trackTrue": 244,
              "trackMag": 258,
              "viaAirway": "DCT",
              "stage": "CRZ"
            },
            {
              "ordinal": 6,
              "ident": "KJFK",
              "latitude": 40.6413,
              "longitude": -73.7781,
              "altitude": 13,
              "elapsedSeconds": 19800,
              "distanceNm": 49,
              "trackTrue": 262,
              "trackMag": 275,
              "viaAirway": "ROBER1",
              "stage": "DSC"
            }
          ]
        },
        "oceanicCrossing": {
          "routing": "track",
          "trackId": "A",
          "direction": "west",
          "tracks": [
            {
              "identifier": "X",
              "direction": "east",
              "tmi": "241",
              "issuingOca": "CZQX",
              "route": "RESNO 5540N 5450N DOGAL",
              "levels": [
                320,
                330,
                340,
                350
              ],
              "validFrom": "2025-01-05T23:00:00.000Z",
              "validTo": "2025-01-06T06:30:00.000Z",
              "fixes": [
                {
                  "ident": "RESNO",
                  "latitude": 55,
                  "longitude": -15
                },
                {
                  "ident": "DOGAL",
                  "latitude": 54.5,
                  "longitude": -50
                }
              ]
            },
            {
              "identifier": "A",
              "direction": "west",
              "tmi": "241",
              "issuingOca": "EGGX",
              "route": "MALOT 5620N 5730N 5740N 5650N JANJO",
              "levels": [
                340,
                350,
                360,
                370,
                380,
                390,
                400
              ],
              "validFrom": "2025-01-05T11:00:00.000Z",
              "validTo": "2025-01-05T18:30:00.000Z",
              "fixes": [
                {
                  "ident": "MALOT",
                  "latitude": 54,
                  "longitude": -15
                },
                {
                  "ident": "5620N",
                  "latitude": 56,
                  "longitude": -20
                },
                {
                  "ident": "JANJO",
                  "latitude": 55.5,
                  "longitude": -53
                }
              ]
            }
          ]
        }
      }
      """

  Scenario: As a cabin crew I read the same briefing as anyone else
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/etops-briefing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "etops": {
          "ruleMinutes": 370,
          "ruleRadiusNm": 2694.83,
          "thresholdMinutes": 60,
          "thresholdRadiusNm": 437,
          "points": [
            {
              "kind": "entry",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
              "position": {
                "latitude": 51.7549,
                "longitude": -43.4583
              },
              "elapsedSeconds": 9720,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                }
              ]
            },
            {
              "kind": "equal_time",
              "ordinal": 1,
              "isCritical": true,
              "adequateAirportId": null,
              "position": {
                "latitude": 52.0967,
                "longitude": -33.4667
              },
              "elapsedSeconds": 11940,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                },
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 2
                }
              ]
            },
            {
              "kind": "exit",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "position": {
                "latitude": 52.9433,
                "longitude": -20.9317
              },
              "elapsedSeconds": 14160,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 1
                }
              ]
            }
          ],
          "airports": [
            {
              "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "suitabilityStart": "2025-01-06T00:52:00.000Z",
              "suitabilityEnd": "2025-01-06T04:10:00.000Z",
              "plannedRunway": "28",
              "forecastCeiling": 1500,
              "forecastVisibility": 9999,
              "transitionAltitude": 7000,
              "transitionLevel": 7500
            },
            {
              "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
              "suitabilityStart": "2025-01-05T23:01:00.000Z",
              "suitabilityEnd": "2025-01-06T02:52:00.000Z",
              "plannedRunway": "13",
              "forecastCeiling": 900,
              "forecastVisibility": 8050,
              "transitionAltitude": 18000,
              "transitionLevel": 18000
            }
          ]
        },
        "route": {
          "route": "TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY UN546 LAPEX NATA JANJO DCT HOIST",
          "fixes": [
            {
              "ordinal": 0,
              "ident": "EDDF",
              "latitude": 50.04693,
              "longitude": 8.57397,
              "altitude": 364,
              "elapsedSeconds": 0,
              "distanceNm": 0,
              "trackTrue": 0,
              "trackMag": 0,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 1,
              "ident": "TOBAK",
              "latitude": 50.10694,
              "longitude": 8.28333,
              "altitude": 12000,
              "elapsedSeconds": 900,
              "distanceNm": 21,
              "trackTrue": 283,
              "trackMag": 285,
              "viaAirway": "TOBAK1C",
              "stage": "CLB"
            },
            {
              "ordinal": 2,
              "ident": "TOC",
              "latitude": 50.63333,
              "longitude": 6.5,
              "altitude": 35000,
              "elapsedSeconds": 1800,
              "distanceNm": 88,
              "trackTrue": 289,
              "trackMag": 291,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 3,
              "ident": "LAPEX",
              "latitude": 53.51667,
              "longitude": -10,
              "altitude": 37000,
              "elapsedSeconds": 7200,
              "distanceNm": 620,
              "trackTrue": 295,
              "trackMag": 302,
              "viaAirway": "UN546",
              "stage": "CRZ"
            },
            {
              "ordinal": 4,
              "ident": "5620N",
              "latitude": 56,
              "longitude": -20,
              "altitude": 39000,
              "elapsedSeconds": 10800,
              "distanceNm": 405,
              "trackTrue": 288,
              "trackMag": 305,
              "viaAirway": "NATA",
              "stage": "CRZ"
            },
            {
              "ordinal": 5,
              "ident": "TOD",
              "latitude": 42.5,
              "longitude": -70.5,
              "altitude": 39000,
              "elapsedSeconds": 17400,
              "distanceNm": 1580,
              "trackTrue": 244,
              "trackMag": 258,
              "viaAirway": "DCT",
              "stage": "CRZ"
            },
            {
              "ordinal": 6,
              "ident": "KJFK",
              "latitude": 40.6413,
              "longitude": -73.7781,
              "altitude": 13,
              "elapsedSeconds": 19800,
              "distanceNm": 49,
              "trackTrue": 262,
              "trackMag": 275,
              "viaAirway": "ROBER1",
              "stage": "DSC"
            }
          ]
        },
        "oceanicCrossing": {
          "routing": "track",
          "trackId": "A",
          "direction": "west",
          "tracks": [
            {
              "identifier": "X",
              "direction": "east",
              "tmi": "241",
              "issuingOca": "CZQX",
              "route": "RESNO 5540N 5450N DOGAL",
              "levels": [
                320,
                330,
                340,
                350
              ],
              "validFrom": "2025-01-05T23:00:00.000Z",
              "validTo": "2025-01-06T06:30:00.000Z",
              "fixes": [
                {
                  "ident": "RESNO",
                  "latitude": 55,
                  "longitude": -15
                },
                {
                  "ident": "DOGAL",
                  "latitude": 54.5,
                  "longitude": -50
                }
              ]
            },
            {
              "identifier": "A",
              "direction": "west",
              "tmi": "241",
              "issuingOca": "EGGX",
              "route": "MALOT 5620N 5730N 5740N 5650N JANJO",
              "levels": [
                340,
                350,
                360,
                370,
                380,
                390,
                400
              ],
              "validFrom": "2025-01-05T11:00:00.000Z",
              "validTo": "2025-01-05T18:30:00.000Z",
              "fixes": [
                {
                  "ident": "MALOT",
                  "latitude": 54,
                  "longitude": -15
                },
                {
                  "ident": "5620N",
                  "latitude": 56,
                  "longitude": -20
                },
                {
                  "ident": "JANJO",
                  "latitude": 55.5,
                  "longitude": -53
                }
              ]
            }
          ]
        }
      }
      """

  Scenario: As an admin I read the same briefing as anyone else
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/etops-briefing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "etops": {
          "ruleMinutes": 370,
          "ruleRadiusNm": 2694.83,
          "thresholdMinutes": 60,
          "thresholdRadiusNm": 437,
          "points": [
            {
              "kind": "entry",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
              "position": {
                "latitude": 51.7549,
                "longitude": -43.4583
              },
              "elapsedSeconds": 9720,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                }
              ]
            },
            {
              "kind": "equal_time",
              "ordinal": 1,
              "isCritical": true,
              "adequateAirportId": null,
              "position": {
                "latitude": 52.0967,
                "longitude": -33.4667
              },
              "elapsedSeconds": 11940,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
                  "ordinal": 1
                },
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 2
                }
              ]
            },
            {
              "kind": "exit",
              "ordinal": 1,
              "isCritical": false,
              "adequateAirportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "position": {
                "latitude": 52.9433,
                "longitude": -20.9317
              },
              "elapsedSeconds": 14160,
              "condition": "DC",
              "diversionAirports": [
                {
                  "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
                  "ordinal": 1
                }
              ]
            }
          ],
          "airports": [
            {
              "airportId": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
              "suitabilityStart": "2025-01-06T00:52:00.000Z",
              "suitabilityEnd": "2025-01-06T04:10:00.000Z",
              "plannedRunway": "28",
              "forecastCeiling": 1500,
              "forecastVisibility": 9999,
              "transitionAltitude": 7000,
              "transitionLevel": 7500
            },
            {
              "airportId": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
              "suitabilityStart": "2025-01-05T23:01:00.000Z",
              "suitabilityEnd": "2025-01-06T02:52:00.000Z",
              "plannedRunway": "13",
              "forecastCeiling": 900,
              "forecastVisibility": 8050,
              "transitionAltitude": 18000,
              "transitionLevel": 18000
            }
          ]
        },
        "route": {
          "route": "TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY UN546 LAPEX NATA JANJO DCT HOIST",
          "fixes": [
            {
              "ordinal": 0,
              "ident": "EDDF",
              "latitude": 50.04693,
              "longitude": 8.57397,
              "altitude": 364,
              "elapsedSeconds": 0,
              "distanceNm": 0,
              "trackTrue": 0,
              "trackMag": 0,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 1,
              "ident": "TOBAK",
              "latitude": 50.10694,
              "longitude": 8.28333,
              "altitude": 12000,
              "elapsedSeconds": 900,
              "distanceNm": 21,
              "trackTrue": 283,
              "trackMag": 285,
              "viaAirway": "TOBAK1C",
              "stage": "CLB"
            },
            {
              "ordinal": 2,
              "ident": "TOC",
              "latitude": 50.63333,
              "longitude": 6.5,
              "altitude": 35000,
              "elapsedSeconds": 1800,
              "distanceNm": 88,
              "trackTrue": 289,
              "trackMag": 291,
              "viaAirway": "DCT",
              "stage": "CLB"
            },
            {
              "ordinal": 3,
              "ident": "LAPEX",
              "latitude": 53.51667,
              "longitude": -10,
              "altitude": 37000,
              "elapsedSeconds": 7200,
              "distanceNm": 620,
              "trackTrue": 295,
              "trackMag": 302,
              "viaAirway": "UN546",
              "stage": "CRZ"
            },
            {
              "ordinal": 4,
              "ident": "5620N",
              "latitude": 56,
              "longitude": -20,
              "altitude": 39000,
              "elapsedSeconds": 10800,
              "distanceNm": 405,
              "trackTrue": 288,
              "trackMag": 305,
              "viaAirway": "NATA",
              "stage": "CRZ"
            },
            {
              "ordinal": 5,
              "ident": "TOD",
              "latitude": 42.5,
              "longitude": -70.5,
              "altitude": 39000,
              "elapsedSeconds": 17400,
              "distanceNm": 1580,
              "trackTrue": 244,
              "trackMag": 258,
              "viaAirway": "DCT",
              "stage": "CRZ"
            },
            {
              "ordinal": 6,
              "ident": "KJFK",
              "latitude": 40.6413,
              "longitude": -73.7781,
              "altitude": 13,
              "elapsedSeconds": 19800,
              "distanceNm": 49,
              "trackTrue": 262,
              "trackMag": 275,
              "viaAirway": "ROBER1",
              "stage": "DSC"
            }
          ]
        },
        "oceanicCrossing": {
          "routing": "track",
          "trackId": "A",
          "direction": "west",
          "tracks": [
            {
              "identifier": "X",
              "direction": "east",
              "tmi": "241",
              "issuingOca": "CZQX",
              "route": "RESNO 5540N 5450N DOGAL",
              "levels": [
                320,
                330,
                340,
                350
              ],
              "validFrom": "2025-01-05T23:00:00.000Z",
              "validTo": "2025-01-06T06:30:00.000Z",
              "fixes": [
                {
                  "ident": "RESNO",
                  "latitude": 55,
                  "longitude": -15
                },
                {
                  "ident": "DOGAL",
                  "latitude": 54.5,
                  "longitude": -50
                }
              ]
            },
            {
              "identifier": "A",
              "direction": "west",
              "tmi": "241",
              "issuingOca": "EGGX",
              "route": "MALOT 5620N 5730N 5740N 5650N JANJO",
              "levels": [
                340,
                350,
                360,
                370,
                380,
                390,
                400
              ],
              "validFrom": "2025-01-05T11:00:00.000Z",
              "validTo": "2025-01-05T18:30:00.000Z",
              "fixes": [
                {
                  "ident": "MALOT",
                  "latitude": 54,
                  "longitude": -15
                },
                {
                  "ident": "5620N",
                  "latitude": 56,
                  "longitude": -20
                },
                {
                  "ident": "JANJO",
                  "latitude": 55.5,
                  "longitude": -53
                }
              ]
            }
          ]
        }
      }
      """

  Scenario: As anyone a flight with no imported plan has no briefing
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/etops-briefing"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist or no OFP for flight",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As anyone I cannot read the briefing of a flight that does not exist
    When I send a "GET" request to "/api/v1/flight/11111111-1111-4111-8111-111111111111/etops-briefing"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As anyone I cannot read the briefing of a malformed flight identifier
    When I send a "GET" request to "/api/v1/flight/not-a-flight/etops-briefing"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
