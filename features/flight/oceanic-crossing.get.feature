Feature: Read the oceanic crossing a flight was planned against

  Scenario: As anyone I can read the tracks a flight was planned against, both directions as published
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/oceanic-crossing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "routing": "track_geometry",
        "trackId": "E",
        "direction": "west",
        "tracks": [
          {
            "identifier": "V",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "NICSO 48N050W 50N040W 53N030W 54N020W DOGAL BEXET",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "NICSO",
                "latitude": 47.5,
                "longitude": -52
              },
              {
                "ident": "4850N",
                "latitude": 48,
                "longitude": -50
              },
              {
                "ident": "5040N",
                "latitude": 50,
                "longitude": -40
              },
              {
                "ident": "5330N",
                "latitude": 53,
                "longitude": -30
              },
              {
                "ident": "5420N",
                "latitude": 54,
                "longitude": -20
              },
              {
                "ident": "DOGAL",
                "latitude": 54,
                "longitude": -15
              },
              {
                "ident": "BEXET",
                "latitude": 54,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "W",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "PORTI 47N050W 49N040W 52N030W 53N020W MALOT GISTI",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "PORTI",
                "latitude": 46.5,
                "longitude": -52
              },
              {
                "ident": "4750N",
                "latitude": 47,
                "longitude": -50
              },
              {
                "ident": "4940N",
                "latitude": 49,
                "longitude": -40
              },
              {
                "ident": "5230N",
                "latitude": 52,
                "longitude": -30
              },
              {
                "ident": "5320N",
                "latitude": 53,
                "longitude": -20
              },
              {
                "ident": "MALOT",
                "latitude": 53,
                "longitude": -15
              },
              {
                "ident": "GISTI",
                "latitude": 53,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "X",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "SUPRY 46N050W 48N040W 51N030W 52N020W LIMRI XETBO",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "SUPRY",
                "latitude": 45.5,
                "longitude": -52
              },
              {
                "ident": "4650N",
                "latitude": 46,
                "longitude": -50
              },
              {
                "ident": "4840N",
                "latitude": 48,
                "longitude": -40
              },
              {
                "ident": "5130N",
                "latitude": 51,
                "longitude": -30
              },
              {
                "ident": "5220N",
                "latitude": 52,
                "longitude": -20
              },
              {
                "ident": "LIMRI",
                "latitude": 52,
                "longitude": -15
              },
              {
                "ident": "XETBO",
                "latitude": 52,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "Y",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "RAFIN 45N050W 47N040W 50N030W 51N020W DINIM ELSOX",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "RAFIN",
                "latitude": 44.883333,
                "longitude": -51.804722
              },
              {
                "ident": "4550N",
                "latitude": 45,
                "longitude": -50
              },
              {
                "ident": "4740N",
                "latitude": 47,
                "longitude": -40
              },
              {
                "ident": "5030N",
                "latitude": 50,
                "longitude": -30
              },
              {
                "ident": "5120N",
                "latitude": 51,
                "longitude": -20
              },
              {
                "ident": "DINIM",
                "latitude": 51,
                "longitude": -15
              },
              {
                "ident": "ELSOX",
                "latitude": 51,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "Z",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "SOORY 43N050W 46N040W 49N030W 50N020W SOMAX ATSUR",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "SOORY",
                "latitude": 38.5,
                "longitude": -60.267583
              },
              {
                "ident": "4350N",
                "latitude": 43,
                "longitude": -50
              },
              {
                "ident": "4640N",
                "latitude": 46,
                "longitude": -40
              },
              {
                "ident": "4930N",
                "latitude": 49,
                "longitude": -30
              },
              {
                "ident": "5020N",
                "latitude": 50,
                "longitude": -20
              },
              {
                "ident": "SOMAX",
                "latitude": 50,
                "longitude": -15
              },
              {
                "ident": "ATSUR",
                "latitude": 50,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "A",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "SUNOT 58N020W 57N030W 5530N04000W 54N050W NEEKO",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "SUNOT",
                "latitude": 57,
                "longitude": -15
              },
              {
                "ident": "5820N",
                "latitude": 58,
                "longitude": -20
              },
              {
                "ident": "5730N",
                "latitude": 57,
                "longitude": -30
              },
              {
                "ident": "H5540",
                "latitude": 55.5,
                "longitude": -40
              },
              {
                "ident": "5450N",
                "latitude": 54,
                "longitude": -50
              },
              {
                "ident": "NEEKO",
                "latitude": 52.4,
                "longitude": -55.833333
              }
            ]
          },
          {
            "identifier": "B",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "PIKIL 57N020W 5630N03000W 55N040W 5330N05000W PELTU",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "PIKIL",
                "latitude": 56,
                "longitude": -15
              },
              {
                "ident": "5720N",
                "latitude": 57,
                "longitude": -20
              },
              {
                "ident": "H5630",
                "latitude": 56.5,
                "longitude": -30
              },
              {
                "ident": "5540N",
                "latitude": 55,
                "longitude": -40
              },
              {
                "ident": "H5350",
                "latitude": 53.5,
                "longitude": -50
              },
              {
                "ident": "PELTU",
                "latitude": 52.1,
                "longitude": -55.166667
              }
            ]
          },
          {
            "identifier": "C",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "RESNO 56N020W 56N030W 5430N04000W 53N050W RIKAL",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "RESNO",
                "latitude": 55,
                "longitude": -15
              },
              {
                "ident": "5620N",
                "latitude": 56,
                "longitude": -20
              },
              {
                "ident": "5630N",
                "latitude": 56,
                "longitude": -30
              },
              {
                "ident": "H5440",
                "latitude": 54.5,
                "longitude": -40
              },
              {
                "ident": "5350N",
                "latitude": 53,
                "longitude": -50
              },
              {
                "ident": "RIKAL",
                "latitude": 51.8,
                "longitude": -54.533333
              }
            ]
          },
          {
            "identifier": "D",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "DOGAL 55N020W 55N030W 54N040W 5230N05000W SAXAN",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "DOGAL",
                "latitude": 54,
                "longitude": -15
              },
              {
                "ident": "5520N",
                "latitude": 55,
                "longitude": -20
              },
              {
                "ident": "5530N",
                "latitude": 55,
                "longitude": -30
              },
              {
                "ident": "5440N",
                "latitude": 54,
                "longitude": -40
              },
              {
                "ident": "H5250",
                "latitude": 52.5,
                "longitude": -50
              },
              {
                "ident": "SAXAN",
                "latitude": 51.483333,
                "longitude": -53.85
              }
            ]
          },
          {
            "identifier": "E",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "MALOT 54N020W 5430N03000W 5330N04000W 52N050W TUDEP",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "MALOT",
                "latitude": 53,
                "longitude": -15
              },
              {
                "ident": "5420N",
                "latitude": 54,
                "longitude": -20
              },
              {
                "ident": "H5430",
                "latitude": 54.5,
                "longitude": -30
              },
              {
                "ident": "H5340",
                "latitude": 53.5,
                "longitude": -40
              },
              {
                "ident": "5250N",
                "latitude": 52,
                "longitude": -50
              },
              {
                "ident": "TUDEP",
                "latitude": 51.166667,
                "longitude": -53.233333
              }
            ]
          },
          {
            "identifier": "F",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "LIMRI 53N020W 54N030W 53N040W 5130N05000W UMESI",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "LIMRI",
                "latitude": 52,
                "longitude": -15
              },
              {
                "ident": "5320N",
                "latitude": 53,
                "longitude": -20
              },
              {
                "ident": "5430N",
                "latitude": 54,
                "longitude": -30
              },
              {
                "ident": "5340N",
                "latitude": 53,
                "longitude": -40
              },
              {
                "ident": "H5150",
                "latitude": 51.5,
                "longitude": -50
              },
              {
                "ident": "UMESI",
                "latitude": 50.833333,
                "longitude": -52.6
              }
            ]
          },
          {
            "identifier": "G",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "DINIM 52N020W 5330N03000W 5230N04000W 51N050W ALLRY",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "DINIM",
                "latitude": 51,
                "longitude": -15
              },
              {
                "ident": "5220N",
                "latitude": 52,
                "longitude": -20
              },
              {
                "ident": "H5330",
                "latitude": 53.5,
                "longitude": -30
              },
              {
                "ident": "H5240",
                "latitude": 52.5,
                "longitude": -40
              },
              {
                "ident": "5150N",
                "latitude": 51,
                "longitude": -50
              },
              {
                "ident": "ALLRY",
                "latitude": 50.5,
                "longitude": -52
              }
            ]
          }
        ]
      }
      """

  Scenario: As operations I read the same crossing as anyone else
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/oceanic-crossing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "routing": "track_geometry",
        "trackId": "E",
        "direction": "west",
        "tracks": [
          {
            "identifier": "V",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "NICSO 48N050W 50N040W 53N030W 54N020W DOGAL BEXET",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "NICSO",
                "latitude": 47.5,
                "longitude": -52
              },
              {
                "ident": "4850N",
                "latitude": 48,
                "longitude": -50
              },
              {
                "ident": "5040N",
                "latitude": 50,
                "longitude": -40
              },
              {
                "ident": "5330N",
                "latitude": 53,
                "longitude": -30
              },
              {
                "ident": "5420N",
                "latitude": 54,
                "longitude": -20
              },
              {
                "ident": "DOGAL",
                "latitude": 54,
                "longitude": -15
              },
              {
                "ident": "BEXET",
                "latitude": 54,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "W",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "PORTI 47N050W 49N040W 52N030W 53N020W MALOT GISTI",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "PORTI",
                "latitude": 46.5,
                "longitude": -52
              },
              {
                "ident": "4750N",
                "latitude": 47,
                "longitude": -50
              },
              {
                "ident": "4940N",
                "latitude": 49,
                "longitude": -40
              },
              {
                "ident": "5230N",
                "latitude": 52,
                "longitude": -30
              },
              {
                "ident": "5320N",
                "latitude": 53,
                "longitude": -20
              },
              {
                "ident": "MALOT",
                "latitude": 53,
                "longitude": -15
              },
              {
                "ident": "GISTI",
                "latitude": 53,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "X",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "SUPRY 46N050W 48N040W 51N030W 52N020W LIMRI XETBO",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "SUPRY",
                "latitude": 45.5,
                "longitude": -52
              },
              {
                "ident": "4650N",
                "latitude": 46,
                "longitude": -50
              },
              {
                "ident": "4840N",
                "latitude": 48,
                "longitude": -40
              },
              {
                "ident": "5130N",
                "latitude": 51,
                "longitude": -30
              },
              {
                "ident": "5220N",
                "latitude": 52,
                "longitude": -20
              },
              {
                "ident": "LIMRI",
                "latitude": 52,
                "longitude": -15
              },
              {
                "ident": "XETBO",
                "latitude": 52,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "Y",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "RAFIN 45N050W 47N040W 50N030W 51N020W DINIM ELSOX",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "RAFIN",
                "latitude": 44.883333,
                "longitude": -51.804722
              },
              {
                "ident": "4550N",
                "latitude": 45,
                "longitude": -50
              },
              {
                "ident": "4740N",
                "latitude": 47,
                "longitude": -40
              },
              {
                "ident": "5030N",
                "latitude": 50,
                "longitude": -30
              },
              {
                "ident": "5120N",
                "latitude": 51,
                "longitude": -20
              },
              {
                "ident": "DINIM",
                "latitude": 51,
                "longitude": -15
              },
              {
                "ident": "ELSOX",
                "latitude": 51,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "Z",
            "direction": "east",
            "tmi": "247",
            "issuingOca": "CZQX",
            "route": "SOORY 43N050W 46N040W 49N030W 50N020W SOMAX ATSUR",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-04T01:00:00.000Z",
            "validTo": "2026-09-04T08:00:00.000Z",
            "fixes": [
              {
                "ident": "SOORY",
                "latitude": 38.5,
                "longitude": -60.267583
              },
              {
                "ident": "4350N",
                "latitude": 43,
                "longitude": -50
              },
              {
                "ident": "4640N",
                "latitude": 46,
                "longitude": -40
              },
              {
                "ident": "4930N",
                "latitude": 49,
                "longitude": -30
              },
              {
                "ident": "5020N",
                "latitude": 50,
                "longitude": -20
              },
              {
                "ident": "SOMAX",
                "latitude": 50,
                "longitude": -15
              },
              {
                "ident": "ATSUR",
                "latitude": 50,
                "longitude": -14
              }
            ]
          },
          {
            "identifier": "A",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "SUNOT 58N020W 57N030W 5530N04000W 54N050W NEEKO",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "SUNOT",
                "latitude": 57,
                "longitude": -15
              },
              {
                "ident": "5820N",
                "latitude": 58,
                "longitude": -20
              },
              {
                "ident": "5730N",
                "latitude": 57,
                "longitude": -30
              },
              {
                "ident": "H5540",
                "latitude": 55.5,
                "longitude": -40
              },
              {
                "ident": "5450N",
                "latitude": 54,
                "longitude": -50
              },
              {
                "ident": "NEEKO",
                "latitude": 52.4,
                "longitude": -55.833333
              }
            ]
          },
          {
            "identifier": "B",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "PIKIL 57N020W 5630N03000W 55N040W 5330N05000W PELTU",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "PIKIL",
                "latitude": 56,
                "longitude": -15
              },
              {
                "ident": "5720N",
                "latitude": 57,
                "longitude": -20
              },
              {
                "ident": "H5630",
                "latitude": 56.5,
                "longitude": -30
              },
              {
                "ident": "5540N",
                "latitude": 55,
                "longitude": -40
              },
              {
                "ident": "H5350",
                "latitude": 53.5,
                "longitude": -50
              },
              {
                "ident": "PELTU",
                "latitude": 52.1,
                "longitude": -55.166667
              }
            ]
          },
          {
            "identifier": "C",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "RESNO 56N020W 56N030W 5430N04000W 53N050W RIKAL",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "RESNO",
                "latitude": 55,
                "longitude": -15
              },
              {
                "ident": "5620N",
                "latitude": 56,
                "longitude": -20
              },
              {
                "ident": "5630N",
                "latitude": 56,
                "longitude": -30
              },
              {
                "ident": "H5440",
                "latitude": 54.5,
                "longitude": -40
              },
              {
                "ident": "5350N",
                "latitude": 53,
                "longitude": -50
              },
              {
                "ident": "RIKAL",
                "latitude": 51.8,
                "longitude": -54.533333
              }
            ]
          },
          {
            "identifier": "D",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "DOGAL 55N020W 55N030W 54N040W 5230N05000W SAXAN",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "DOGAL",
                "latitude": 54,
                "longitude": -15
              },
              {
                "ident": "5520N",
                "latitude": 55,
                "longitude": -20
              },
              {
                "ident": "5530N",
                "latitude": 55,
                "longitude": -30
              },
              {
                "ident": "5440N",
                "latitude": 54,
                "longitude": -40
              },
              {
                "ident": "H5250",
                "latitude": 52.5,
                "longitude": -50
              },
              {
                "ident": "SAXAN",
                "latitude": 51.483333,
                "longitude": -53.85
              }
            ]
          },
          {
            "identifier": "E",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "MALOT 54N020W 5430N03000W 5330N04000W 52N050W TUDEP",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "MALOT",
                "latitude": 53,
                "longitude": -15
              },
              {
                "ident": "5420N",
                "latitude": 54,
                "longitude": -20
              },
              {
                "ident": "H5430",
                "latitude": 54.5,
                "longitude": -30
              },
              {
                "ident": "H5340",
                "latitude": 53.5,
                "longitude": -40
              },
              {
                "ident": "5250N",
                "latitude": 52,
                "longitude": -50
              },
              {
                "ident": "TUDEP",
                "latitude": 51.166667,
                "longitude": -53.233333
              }
            ]
          },
          {
            "identifier": "F",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "LIMRI 53N020W 54N030W 53N040W 5130N05000W UMESI",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "LIMRI",
                "latitude": 52,
                "longitude": -15
              },
              {
                "ident": "5320N",
                "latitude": 53,
                "longitude": -20
              },
              {
                "ident": "5430N",
                "latitude": 54,
                "longitude": -30
              },
              {
                "ident": "5340N",
                "latitude": 53,
                "longitude": -40
              },
              {
                "ident": "H5150",
                "latitude": 51.5,
                "longitude": -50
              },
              {
                "ident": "UMESI",
                "latitude": 50.833333,
                "longitude": -52.6
              }
            ]
          },
          {
            "identifier": "G",
            "direction": "west",
            "tmi": "246",
            "issuingOca": "EGGX",
            "route": "DINIM 52N020W 5330N03000W 5230N04000W 51N050W ALLRY",
            "levels": [
              340,
              350,
              360,
              370,
              380,
              390,
              400
            ],
            "validFrom": "2026-09-03T11:30:00.000Z",
            "validTo": "2026-09-03T19:00:00.000Z",
            "fixes": [
              {
                "ident": "DINIM",
                "latitude": 51,
                "longitude": -15
              },
              {
                "ident": "5220N",
                "latitude": 52,
                "longitude": -20
              },
              {
                "ident": "H5330",
                "latitude": 53.5,
                "longitude": -30
              },
              {
                "ident": "H5240",
                "latitude": 52.5,
                "longitude": -40
              },
              {
                "ident": "5150N",
                "latitude": 51,
                "longitude": -50
              },
              {
                "ident": "ALLRY",
                "latitude": 50.5,
                "longitude": -52
              }
            ]
          }
        ]
      }
      """

  Scenario: As anyone a flight whose plan published no tracks reports none and a random routing
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/oceanic-crossing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "routing": "random",
        "trackId": null,
        "direction": null,
        "tracks": []
      }
      """

  Scenario: As anyone I cannot read the crossing of a flight that does not exist
    When I send a "GET" request to "/api/v1/flight/11111111-1111-4111-8111-111111111111/oceanic-crossing"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
