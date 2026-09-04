Feature: Read the planned route of a flight

  Scenario: As anyone I can read the route a flight is planned to fly, airport to airport
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "route": "OBOK3W OBOKA Z29 TORNU DCT VELED DCT BREDA DCT GALSO Q63 ICTAM L179 SAWPE DCT OZZIL DCT ARPAK DCT FELCA DCT OFSOX DCT SLANY DCT MALOT DCT 54N020W 5430N03000W 5330N04000W 52N050W DCT TUDEP N526A TOPPS DCT ENE PARCH4",
        "atcRoute": "N0477F360 OBOK3W OBOKA Z29 TORNU DCT VELED DCT BREDA DCT GALSO Q63 ICTAM L179 SAWPE DCT OZZIL DCT ARPAK DCT FELCA DCT OFSOX DCT SLANY DCT MALOT/M082F370 DCT 54N020W 5430N03000W 5330N04000W 52N050W DCT TUDEP/N0464F400 N526A TOPPS DCT ENE PARCH4",
        "fixes": [
          {
            "ordinal": 0,
            "ident": "EDDF",
            "latitude": 50.033306,
            "longitude": 8.570456,
            "altitude": 363,
            "elapsedSeconds": 0,
            "distanceNm": 0,
            "trackTrue": null,
            "trackMag": null,
            "viaAirway": null,
            "stage": "CLB",
            "fuel": {
              "flow": null,
              "leg": null,
              "used": null,
              "minimumOnBoard": null,
              "plannedOnBoard": null
            },
            "oat": null,
            "isaDeviation": null,
            "tropopause": null,
            "mora": null,
            "fir": null,
            "wind": {
              "direction": null,
              "speed": null,
              "levels": []
            }
          },
          {
            "ordinal": 1,
            "ident": "DF999",
            "latitude": 50.027508,
            "longitude": 8.513286,
            "altitude": 2900,
            "elapsedSeconds": 163,
            "distanceNm": 2,
            "trackTrue": 261,
            "trackMag": 257,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14392,
              "leg": 685,
              "used": 685,
              "minimumOnBoard": 48031,
              "plannedOnBoard": 50170
            },
            "oat": 16,
            "isaDeviation": 7,
            "tropopause": 41700,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 259,
              "speed": 26,
              "levels": [
                {
                  "oat": 18,
                  "speed": 3,
                  "altitude": 0,
                  "direction": 220
                },
                {
                  "oat": 11,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 4,
                  "speed": 32,
                  "altitude": 10000,
                  "direction": 278
                },
                {
                  "oat": -2,
                  "speed": 39,
                  "altitude": 14000,
                  "direction": 290
                },
                {
                  "oat": -11,
                  "speed": 48,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -23,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 307
                },
                {
                  "oat": -38,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 314
                },
                {
                  "oat": -49,
                  "speed": 80,
                  "altitude": 34000,
                  "direction": 311
                },
                {
                  "oat": -61,
                  "speed": 89,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -58,
                  "speed": 53,
                  "altitude": 45000,
                  "direction": 309
                }
              ]
            }
          },
          {
            "ordinal": 2,
            "ident": "DF998",
            "latitude": 50.001272,
            "longitude": 8.480206,
            "altitude": 5300,
            "elapsedSeconds": 221,
            "distanceNm": 2,
            "trackTrue": 219,
            "trackMag": 215,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14373,
              "leg": 228,
              "used": 913,
              "minimumOnBoard": 47803,
              "plannedOnBoard": 49942
            },
            "oat": 11,
            "isaDeviation": 7,
            "tropopause": 42100,
            "mora": 2800,
            "fir": "EDGG",
            "wind": {
              "direction": 275,
              "speed": 32,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 3,
            "ident": "DF996",
            "latitude": 49.961917,
            "longitude": 8.471325,
            "altitude": 7300,
            "elapsedSeconds": 268,
            "distanceNm": 2,
            "trackTrue": 188,
            "trackMag": 185,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14439,
              "leg": 191,
              "used": 1104,
              "minimumOnBoard": 47612,
              "plannedOnBoard": 49751
            },
            "oat": 9,
            "isaDeviation": 9,
            "tropopause": 42100,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 277,
              "speed": 32,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 4,
            "ident": "DF172",
            "latitude": 49.914603,
            "longitude": 8.449433,
            "altitude": 9800,
            "elapsedSeconds": 325,
            "distanceNm": 3,
            "trackTrue": 196,
            "trackMag": 193,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14457,
              "leg": 238,
              "used": 1342,
              "minimumOnBoard": 47374,
              "plannedOnBoard": 49513
            },
            "oat": 5,
            "isaDeviation": 10,
            "tropopause": 42100,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 281,
              "speed": 34,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 5,
            "ident": "PABVI",
            "latitude": 49.884994,
            "longitude": 8.373053,
            "altitude": 11900,
            "elapsedSeconds": 391,
            "distanceNm": 3,
            "trackTrue": 238,
            "trackMag": 235,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14430,
              "leg": 250,
              "used": 1592,
              "minimumOnBoard": 47124,
              "plannedOnBoard": 49263
            },
            "oat": 1,
            "isaDeviation": 10,
            "tropopause": 42100,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 284,
              "speed": 37,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 6,
            "ident": "SIVDO",
            "latitude": 49.890575,
            "longitude": 8.265772,
            "altitude": 14200,
            "elapsedSeconds": 473,
            "distanceNm": 4,
            "trackTrue": 274,
            "trackMag": 271,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14439,
              "leg": 280,
              "used": 1872,
              "minimumOnBoard": 46844,
              "plannedOnBoard": 48983
            },
            "oat": -2,
            "isaDeviation": 11,
            "tropopause": 42100,
            "mora": 2700,
            "fir": "EDGG",
            "wind": {
              "direction": 289,
              "speed": 42,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 7,
            "ident": "KUPIP",
            "latitude": 49.940783,
            "longitude": 8.160283,
            "altitude": 16700,
            "elapsedSeconds": 559,
            "distanceNm": 5,
            "trackTrue": 306,
            "trackMag": 303,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14435,
              "leg": 304,
              "used": 2176,
              "minimumOnBoard": 46540,
              "plannedOnBoard": 48679
            },
            "oat": -6,
            "isaDeviation": 12,
            "tropopause": 42100,
            "mora": 2900,
            "fir": "EDGG",
            "wind": {
              "direction": 294,
              "speed": 46,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 276
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 8,
            "ident": "MASIR",
            "latitude": 50.254914,
            "longitude": 7.737928,
            "altitude": 20700,
            "elapsedSeconds": 707,
            "distanceNm": 25,
            "trackTrue": 319,
            "trackMag": 316,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14298,
              "leg": 486,
              "used": 2662,
              "minimumOnBoard": 46054,
              "plannedOnBoard": 48193
            },
            "oat": -15,
            "isaDeviation": 11,
            "tropopause": 42100,
            "mora": 4100,
            "fir": "EDGG",
            "wind": {
              "direction": 302,
              "speed": 48,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 276
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 9,
            "ident": "RAVKI",
            "latitude": 50.361664,
            "longitude": 7.664903,
            "altitude": 22700,
            "elapsedSeconds": 786,
            "distanceNm": 7,
            "trackTrue": 336,
            "trackMag": 333,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14191,
              "leg": 243,
              "used": 2905,
              "minimumOnBoard": 45811,
              "plannedOnBoard": 47950
            },
            "oat": -19,
            "isaDeviation": 11,
            "tropopause": 42200,
            "mora": 3800,
            "fir": "EDGG",
            "wind": {
              "direction": 307,
              "speed": 51,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 276
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 10,
            "ident": "DITAM",
            "latitude": 50.558111,
            "longitude": 7.529561,
            "altitude": 26100,
            "elapsedSeconds": 929,
            "distanceNm": 13,
            "trackTrue": 336,
            "trackMag": 333,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 13938,
              "leg": 413,
              "used": 3318,
              "minimumOnBoard": 45398,
              "plannedOnBoard": 47537
            },
            "oat": -28,
            "isaDeviation": 9,
            "tropopause": 41500,
            "mora": 3800,
            "fir": "EDUU",
            "wind": {
              "direction": 304,
              "speed": 67,
              "levels": [
                {
                  "oat": 17,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 241
                },
                {
                  "oat": 11,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 278
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 288
                },
                {
                  "oat": -2,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 290
                },
                {
                  "oat": -10,
                  "speed": 50,
                  "altitude": 18000,
                  "direction": 290
                },
                {
                  "oat": -23,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 299
                },
                {
                  "oat": -38,
                  "speed": 73,
                  "altitude": 30000,
                  "direction": 314
                },
                {
                  "oat": -49,
                  "speed": 84,
                  "altitude": 34000,
                  "direction": 306
                },
                {
                  "oat": -61,
                  "speed": 88,
                  "altitude": 39000,
                  "direction": 307
                },
                {
                  "oat": -58,
                  "speed": 54,
                  "altitude": 45000,
                  "direction": 303
                }
              ]
            }
          },
          {
            "ordinal": 11,
            "ident": "OBOKA",
            "latitude": 50.744864,
            "longitude": 7.338047,
            "altitude": 28600,
            "elapsedSeconds": 1044,
            "distanceNm": 13,
            "trackTrue": 327,
            "trackMag": 324,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 13678,
              "leg": 304,
              "used": 3622,
              "minimumOnBoard": 45094,
              "plannedOnBoard": 47233
            },
            "oat": -34,
            "isaDeviation": 8,
            "tropopause": 41800,
            "mora": 3400,
            "fir": "EDVV",
            "wind": {
              "direction": 305,
              "speed": 66,
              "levels": [
                {
                  "oat": 19,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 252
                },
                {
                  "oat": 11,
                  "speed": 30,
                  "altitude": 5000,
                  "direction": 277
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": -2,
                  "speed": 47,
                  "altitude": 14000,
                  "direction": 287
                },
                {
                  "oat": -10,
                  "speed": 52,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 60,
                  "altitude": 24000,
                  "direction": 297
                },
                {
                  "oat": -38,
                  "speed": 67,
                  "altitude": 30000,
                  "direction": 307
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -61,
                  "speed": 88,
                  "altitude": 39000,
                  "direction": 302
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 12,
            "ident": "ROCUH",
            "latitude": 50.866389,
            "longitude": 6.963889,
            "altitude": 31200,
            "elapsedSeconds": 1191,
            "distanceNm": 16,
            "trackTrue": 297,
            "trackMag": 294,
            "viaAirway": "Z29",
            "stage": "CLB",
            "fuel": {
              "flow": 13222,
              "leg": 315,
              "used": 3937,
              "minimumOnBoard": 44779,
              "plannedOnBoard": 46918
            },
            "oat": -41,
            "isaDeviation": 6,
            "tropopause": 41900,
            "mora": 3100,
            "fir": "EDVV",
            "wind": {
              "direction": 308,
              "speed": 71,
              "levels": [
                {
                  "oat": 19,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 252
                },
                {
                  "oat": 11,
                  "speed": 30,
                  "altitude": 5000,
                  "direction": 277
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": -2,
                  "speed": 47,
                  "altitude": 14000,
                  "direction": 287
                },
                {
                  "oat": -10,
                  "speed": 52,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 60,
                  "altitude": 24000,
                  "direction": 297
                },
                {
                  "oat": -38,
                  "speed": 67,
                  "altitude": 30000,
                  "direction": 307
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -61,
                  "speed": 88,
                  "altitude": 39000,
                  "direction": 302
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 13,
            "ident": "TOC",
            "latitude": 51.128729,
            "longitude": 6.136726,
            "altitude": 36000,
            "elapsedSeconds": 1497,
            "distanceNm": 35,
            "trackTrue": 297,
            "trackMag": 294,
            "viaAirway": "Z29",
            "stage": "CLB",
            "fuel": {
              "flow": 11878,
              "leg": 614,
              "used": 4551,
              "minimumOnBoard": 44165,
              "plannedOnBoard": 46304
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42500,
            "mora": 2500,
            "fir": "EDVV",
            "wind": {
              "direction": 301,
              "speed": 82,
              "levels": [
                {
                  "oat": 18,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 245
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 274
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 286
                },
                {
                  "oat": -10,
                  "speed": 54,
                  "altitude": 18000,
                  "direction": 288
                },
                {
                  "oat": -22,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 295
                },
                {
                  "oat": -37,
                  "speed": 61,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 303
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 301
                }
              ]
            }
          },
          {
            "ordinal": 14,
            "ident": "TINIK",
            "latitude": 51.14,
            "longitude": 6.100556,
            "altitude": 36000,
            "elapsedSeconds": 1515,
            "distanceNm": 2,
            "trackTrue": 296,
            "trackMag": 295,
            "viaAirway": "Z29",
            "stage": "CRZ",
            "fuel": {
              "flow": 5625,
              "leg": 28,
              "used": 4579,
              "minimumOnBoard": 44137,
              "plannedOnBoard": 46276
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42500,
            "mora": 2300,
            "fir": "EDVV",
            "wind": {
              "direction": 301,
              "speed": 81,
              "levels": [
                {
                  "oat": 19,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 245
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 274
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 286
                },
                {
                  "oat": -10,
                  "speed": 54,
                  "altitude": 18000,
                  "direction": 288
                },
                {
                  "oat": -22,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 295
                },
                {
                  "oat": -37,
                  "speed": 61,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 303
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 301
                }
              ]
            }
          },
          {
            "ordinal": 15,
            "ident": "TORNU",
            "latitude": 51.183333,
            "longitude": 5.833333,
            "altitude": 36000,
            "elapsedSeconds": 1605,
            "distanceNm": 10,
            "trackTrue": 284,
            "trackMag": 282,
            "viaAirway": "Z29",
            "stage": "CRZ",
            "fuel": {
              "flow": 5609,
              "leg": 140,
              "used": 4719,
              "minimumOnBoard": 43997,
              "plannedOnBoard": 46136
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42500,
            "mora": 2300,
            "fir": "EHAA",
            "wind": {
              "direction": 301,
              "speed": 81,
              "levels": [
                {
                  "oat": 19,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 245
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 274
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 286
                },
                {
                  "oat": -10,
                  "speed": 54,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 295
                },
                {
                  "oat": -37,
                  "speed": 61,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 303
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 301
                }
              ]
            }
          },
          {
            "ordinal": 16,
            "ident": "VELED",
            "latitude": 51.39,
            "longitude": 5.366944,
            "altitude": 36000,
            "elapsedSeconds": 1793,
            "distanceNm": 21,
            "trackTrue": 305,
            "trackMag": 302,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5593,
              "leg": 292,
              "used": 5011,
              "minimumOnBoard": 43705,
              "plannedOnBoard": 45844
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42600,
            "mora": 2100,
            "fir": "EHAA",
            "wind": {
              "direction": 295,
              "speed": 77,
              "levels": [
                {
                  "oat": 19,
                  "speed": 21,
                  "altitude": 0,
                  "direction": 244
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 283
                },
                {
                  "oat": -9,
                  "speed": 56,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 291
                },
                {
                  "oat": -37,
                  "speed": 59,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 73,
                  "altitude": 34000,
                  "direction": 296
                },
                {
                  "oat": -60,
                  "speed": 81,
                  "altitude": 39000,
                  "direction": 294
                },
                {
                  "oat": -60,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 299
                }
              ]
            }
          },
          {
            "ordinal": 17,
            "ident": "BREDA",
            "latitude": 51.560306,
            "longitude": 4.853333,
            "altitude": 36000,
            "elapsedSeconds": 1993,
            "distanceNm": 22,
            "trackTrue": 298,
            "trackMag": 295,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5605,
              "leg": 311,
              "used": 5322,
              "minimumOnBoard": 43394,
              "plannedOnBoard": 45533
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41800,
            "mora": 2100,
            "fir": "EHAA",
            "wind": {
              "direction": 296,
              "speed": 82,
              "levels": [
                {
                  "oat": 20,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 10,
                  "speed": 33,
                  "altitude": 5000,
                  "direction": 273
                },
                {
                  "oat": 5,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -2,
                  "speed": 50,
                  "altitude": 14000,
                  "direction": 281
                },
                {
                  "oat": -10,
                  "speed": 60,
                  "altitude": 18000,
                  "direction": 284
                },
                {
                  "oat": -22,
                  "speed": 64,
                  "altitude": 24000,
                  "direction": 290
                },
                {
                  "oat": -37,
                  "speed": 74,
                  "altitude": 30000,
                  "direction": 291
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 294
                },
                {
                  "oat": -60,
                  "speed": 59,
                  "altitude": 45000,
                  "direction": 296
                }
              ]
            }
          },
          {
            "ordinal": 18,
            "ident": "GALSO",
            "latitude": 51.732778,
            "longitude": 3.171944,
            "altitude": 36000,
            "elapsedSeconds": 2558,
            "distanceNm": 63,
            "trackTrue": 280,
            "trackMag": 277,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5554,
              "leg": 872,
              "used": 6194,
              "minimumOnBoard": 42522,
              "plannedOnBoard": 44661
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41500,
            "mora": 2100,
            "fir": "EHAA",
            "wind": {
              "direction": 292,
              "speed": 76,
              "levels": [
                {
                  "oat": 21,
                  "speed": 24,
                  "altitude": 0,
                  "direction": 252
                },
                {
                  "oat": 11,
                  "speed": 31,
                  "altitude": 5000,
                  "direction": 270
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 276
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 277
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 276
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 283
                },
                {
                  "oat": -37,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 293
                },
                {
                  "oat": -60,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 290
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 290
                }
              ]
            }
          },
          {
            "ordinal": 19,
            "ident": "AMRIV",
            "latitude": 51.688611,
            "longitude": 2.666944,
            "altitude": 36000,
            "elapsedSeconds": 2725,
            "distanceNm": 19,
            "trackTrue": 262,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5477,
              "leg": 254,
              "used": 6448,
              "minimumOnBoard": 42268,
              "plannedOnBoard": 44407
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41600,
            "mora": 2000,
            "fir": "EHAA",
            "wind": {
              "direction": 292,
              "speed": 75,
              "levels": [
                {
                  "oat": 21,
                  "speed": 24,
                  "altitude": 0,
                  "direction": 251
                },
                {
                  "oat": 11,
                  "speed": 31,
                  "altitude": 5000,
                  "direction": 270
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 276
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 277
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 276
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 283
                },
                {
                  "oat": -37,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 293
                },
                {
                  "oat": -60,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 290
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 290
                }
              ]
            }
          },
          {
            "ordinal": 20,
            "ident": "MOMIC",
            "latitude": 51.673611,
            "longitude": 2.5,
            "altitude": 36000,
            "elapsedSeconds": 2777,
            "distanceNm": 6,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5469,
              "leg": 79,
              "used": 6527,
              "minimumOnBoard": 42189,
              "plannedOnBoard": 44328
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41600,
            "mora": 2000,
            "fir": "EHAA",
            "wind": {
              "direction": 292,
              "speed": 75,
              "levels": [
                {
                  "oat": 21,
                  "speed": 24,
                  "altitude": 0,
                  "direction": 251
                },
                {
                  "oat": 11,
                  "speed": 31,
                  "altitude": 5000,
                  "direction": 270
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 276
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 277
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 276
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 283
                },
                {
                  "oat": -37,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 293
                },
                {
                  "oat": -60,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 290
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 290
                }
              ]
            }
          },
          {
            "ordinal": 21,
            "ident": "SUMUM",
            "latitude": 51.637292,
            "longitude": 2.107714,
            "altitude": 36000,
            "elapsedSeconds": 2910,
            "distanceNm": 15,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5489,
              "leg": 203,
              "used": 6730,
              "minimumOnBoard": 41986,
              "plannedOnBoard": 44125
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EHAA",
            "wind": {
              "direction": 285,
              "speed": 78,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 78,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 22,
            "ident": "BLIXY",
            "latitude": 51.625069,
            "longitude": 1.975428,
            "altitude": 36000,
            "elapsedSeconds": 2954,
            "distanceNm": 5,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5479,
              "leg": 67,
              "used": 6797,
              "minimumOnBoard": 41919,
              "plannedOnBoard": 44058
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 285,
              "speed": 77,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 78,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 23,
            "ident": "ARREK",
            "latitude": 51.611956,
            "longitude": 1.835353,
            "altitude": 36000,
            "elapsedSeconds": 2998,
            "distanceNm": 5,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5476,
              "leg": 67,
              "used": 6864,
              "minimumOnBoard": 41852,
              "plannedOnBoard": 43991
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 285,
              "speed": 77,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 78,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 24,
            "ident": "ERING",
            "latitude": 51.590681,
            "longitude": 1.611944,
            "altitude": 36000,
            "elapsedSeconds": 3069,
            "distanceNm": 8,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5473,
              "leg": 108,
              "used": 6972,
              "minimumOnBoard": 41744,
              "plannedOnBoard": 43883
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 285,
              "speed": 77,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 262
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 25,
            "ident": "KOPUL",
            "latitude": 51.542156,
            "longitude": 1.137178,
            "altitude": 36000,
            "elapsedSeconds": 3228,
            "distanceNm": 18,
            "trackTrue": 260,
            "trackMag": 259,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5454,
              "leg": 241,
              "used": 7213,
              "minimumOnBoard": 41503,
              "plannedOnBoard": 43642
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42800,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 287,
              "speed": 75,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 265
                },
                {
                  "oat": 11,
                  "speed": 36,
                  "altitude": 5000,
                  "direction": 261
                },
                {
                  "oat": 5,
                  "speed": 46,
                  "altitude": 10000,
                  "direction": 273
                },
                {
                  "oat": -1,
                  "speed": 56,
                  "altitude": 14000,
                  "direction": 274
                },
                {
                  "oat": -10,
                  "speed": 62,
                  "altitude": 18000,
                  "direction": 272
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 273
                },
                {
                  "oat": -36,
                  "speed": 69,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 74,
                  "altitude": 34000,
                  "direction": 289
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 62,
                  "altitude": 45000,
                  "direction": 283
                }
              ]
            }
          },
          {
            "ordinal": 26,
            "ident": "IDITU",
            "latitude": 51.540219,
            "longitude": 0.977042,
            "altitude": 36000,
            "elapsedSeconds": 3281,
            "distanceNm": 6,
            "trackTrue": 268,
            "trackMag": 267,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5451,
              "leg": 80,
              "used": 7293,
              "minimumOnBoard": 41423,
              "plannedOnBoard": 43562
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42800,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 287,
              "speed": 75,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 265
                },
                {
                  "oat": 11,
                  "speed": 36,
                  "altitude": 5000,
                  "direction": 261
                },
                {
                  "oat": 5,
                  "speed": 46,
                  "altitude": 10000,
                  "direction": 273
                },
                {
                  "oat": -1,
                  "speed": 56,
                  "altitude": 14000,
                  "direction": 274
                },
                {
                  "oat": -10,
                  "speed": 62,
                  "altitude": 18000,
                  "direction": 272
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 273
                },
                {
                  "oat": -36,
                  "speed": 69,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 74,
                  "altitude": 34000,
                  "direction": 289
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 62,
                  "altitude": 45000,
                  "direction": 283
                }
              ]
            }
          },
          {
            "ordinal": 27,
            "ident": "IPKUS",
            "latitude": 51.531231,
            "longitude": 0.388494,
            "altitude": 36000,
            "elapsedSeconds": 3478,
            "distanceNm": 22,
            "trackTrue": 268,
            "trackMag": 267,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5454,
              "leg": 298,
              "used": 7591,
              "minimumOnBoard": 41125,
              "plannedOnBoard": 43264
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42900,
            "mora": 2300,
            "fir": "EGTT",
            "wind": {
              "direction": 282,
              "speed": 76,
              "levels": [
                {
                  "oat": 21,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 254
                },
                {
                  "oat": 11,
                  "speed": 35,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 5,
                  "speed": 48,
                  "altitude": 10000,
                  "direction": 270
                },
                {
                  "oat": -1,
                  "speed": 59,
                  "altitude": 14000,
                  "direction": 270
                },
                {
                  "oat": -10,
                  "speed": 66,
                  "altitude": 18000,
                  "direction": 270
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 272
                },
                {
                  "oat": -36,
                  "speed": 65,
                  "altitude": 30000,
                  "direction": 280
                },
                {
                  "oat": -47,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 282
                },
                {
                  "oat": -60,
                  "speed": 76,
                  "altitude": 39000,
                  "direction": 280
                },
                {
                  "oat": -60,
                  "speed": 62,
                  "altitude": 45000,
                  "direction": 280
                }
              ]
            }
          },
          {
            "ordinal": 28,
            "ident": "ICTAM",
            "latitude": 51.527047,
            "longitude": -1.163367,
            "altitude": 36000,
            "elapsedSeconds": 4000,
            "distanceNm": 58,
            "trackTrue": 270,
            "trackMag": 269,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5445,
              "leg": 789,
              "used": 8380,
              "minimumOnBoard": 40336,
              "plannedOnBoard": 42475
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42900,
            "mora": 2600,
            "fir": "EGTT",
            "wind": {
              "direction": 276,
              "speed": 76,
              "levels": [
                {
                  "oat": 20,
                  "speed": 17,
                  "altitude": 0,
                  "direction": 248
                },
                {
                  "oat": 12,
                  "speed": 36,
                  "altitude": 5000,
                  "direction": 264
                },
                {
                  "oat": 5,
                  "speed": 49,
                  "altitude": 10000,
                  "direction": 267
                },
                {
                  "oat": -1,
                  "speed": 61,
                  "altitude": 14000,
                  "direction": 268
                },
                {
                  "oat": -10,
                  "speed": 66,
                  "altitude": 18000,
                  "direction": 267
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 267
                },
                {
                  "oat": -36,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 272
                },
                {
                  "oat": -47,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 276
                },
                {
                  "oat": -60,
                  "speed": 76,
                  "altitude": 39000,
                  "direction": 276
                },
                {
                  "oat": -61,
                  "speed": 63,
                  "altitude": 45000,
                  "direction": 276
                }
              ]
            }
          },
          {
            "ordinal": 29,
            "ident": "SAWPE",
            "latitude": 51.584631,
            "longitude": -1.654561,
            "altitude": 36000,
            "elapsedSeconds": 4171,
            "distanceNm": 19,
            "trackTrue": 280,
            "trackMag": 280,
            "viaAirway": "L179",
            "stage": "CRZ",
            "fuel": {
              "flow": 5440,
              "leg": 258,
              "used": 8638,
              "minimumOnBoard": 40078,
              "plannedOnBoard": 42217
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 43100,
            "mora": 2700,
            "fir": "EGTT",
            "wind": {
              "direction": 275,
              "speed": 77,
              "levels": [
                {
                  "oat": 20,
                  "speed": 16,
                  "altitude": 0,
                  "direction": 242
                },
                {
                  "oat": 12,
                  "speed": 38,
                  "altitude": 5000,
                  "direction": 264
                },
                {
                  "oat": 5,
                  "speed": 52,
                  "altitude": 10000,
                  "direction": 264
                },
                {
                  "oat": -1,
                  "speed": 63,
                  "altitude": 14000,
                  "direction": 264
                },
                {
                  "oat": -10,
                  "speed": 69,
                  "altitude": 18000,
                  "direction": 263
                },
                {
                  "oat": -21,
                  "speed": 64,
                  "altitude": 24000,
                  "direction": 264
                },
                {
                  "oat": -36,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 266
                },
                {
                  "oat": -47,
                  "speed": 77,
                  "altitude": 34000,
                  "direction": 274
                },
                {
                  "oat": -60,
                  "speed": 75,
                  "altitude": 39000,
                  "direction": 276
                },
                {
                  "oat": -61,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 274
                }
              ]
            }
          },
          {
            "ordinal": 30,
            "ident": "OZZIL",
            "latitude": 51.639261,
            "longitude": -2.430325,
            "altitude": 36000,
            "elapsedSeconds": 4432,
            "distanceNm": 29,
            "trackTrue": 276,
            "trackMag": 276,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5425,
              "leg": 393,
              "used": 9031,
              "minimumOnBoard": 39685,
              "plannedOnBoard": 41824
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 43100,
            "mora": 2800,
            "fir": "EGTT",
            "wind": {
              "direction": 274,
              "speed": 76,
              "levels": [
                {
                  "oat": 20,
                  "speed": 16,
                  "altitude": 0,
                  "direction": 242
                },
                {
                  "oat": 12,
                  "speed": 38,
                  "altitude": 5000,
                  "direction": 264
                },
                {
                  "oat": 5,
                  "speed": 52,
                  "altitude": 10000,
                  "direction": 264
                },
                {
                  "oat": -1,
                  "speed": 63,
                  "altitude": 14000,
                  "direction": 264
                },
                {
                  "oat": -10,
                  "speed": 69,
                  "altitude": 18000,
                  "direction": 263
                },
                {
                  "oat": -21,
                  "speed": 64,
                  "altitude": 24000,
                  "direction": 263
                },
                {
                  "oat": -36,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 266
                },
                {
                  "oat": -47,
                  "speed": 77,
                  "altitude": 34000,
                  "direction": 273
                },
                {
                  "oat": -60,
                  "speed": 75,
                  "altitude": 39000,
                  "direction": 276
                },
                {
                  "oat": -61,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 274
                }
              ]
            }
          },
          {
            "ordinal": 31,
            "ident": "ARPAK",
            "latitude": 51.8124,
            "longitude": -3.318189,
            "altitude": 36000,
            "elapsedSeconds": 4743,
            "distanceNm": 35,
            "trackTrue": 287,
            "trackMag": 287,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5385,
              "leg": 465,
              "used": 9496,
              "minimumOnBoard": 39220,
              "plannedOnBoard": 41359
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 43000,
            "mora": 3800,
            "fir": "EGTT",
            "wind": {
              "direction": 272,
              "speed": 73,
              "levels": [
                {
                  "oat": 19,
                  "speed": 14,
                  "altitude": 0,
                  "direction": 241
                },
                {
                  "oat": 12,
                  "speed": 39,
                  "altitude": 5000,
                  "direction": 261
                },
                {
                  "oat": 6,
                  "speed": 55,
                  "altitude": 10000,
                  "direction": 261
                },
                {
                  "oat": -1,
                  "speed": 66,
                  "altitude": 14000,
                  "direction": 263
                },
                {
                  "oat": -10,
                  "speed": 70,
                  "altitude": 18000,
                  "direction": 261
                },
                {
                  "oat": -20,
                  "speed": 67,
                  "altitude": 24000,
                  "direction": 261
                },
                {
                  "oat": -36,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 268
                },
                {
                  "oat": -47,
                  "speed": 72,
                  "altitude": 34000,
                  "direction": 271
                },
                {
                  "oat": -60,
                  "speed": 75,
                  "altitude": 39000,
                  "direction": 272
                },
                {
                  "oat": -61,
                  "speed": 68,
                  "altitude": 45000,
                  "direction": 271
                }
              ]
            }
          },
          {
            "ordinal": 32,
            "ident": "FELCA",
            "latitude": 51.825239,
            "longitude": -3.538781,
            "altitude": 36000,
            "elapsedSeconds": 4815,
            "distanceNm": 8,
            "trackTrue": 275,
            "trackMag": 275,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5404,
              "leg": 108,
              "used": 9604,
              "minimumOnBoard": 39112,
              "plannedOnBoard": 41251
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 42800,
            "mora": 4500,
            "fir": "EGTT",
            "wind": {
              "direction": 268,
              "speed": 79,
              "levels": [
                {
                  "oat": 18,
                  "speed": 13,
                  "altitude": 0,
                  "direction": 231
                },
                {
                  "oat": 11,
                  "speed": 38,
                  "altitude": 5000,
                  "direction": 257
                },
                {
                  "oat": 5,
                  "speed": 56,
                  "altitude": 10000,
                  "direction": 258
                },
                {
                  "oat": -1,
                  "speed": 67,
                  "altitude": 14000,
                  "direction": 260
                },
                {
                  "oat": -10,
                  "speed": 73,
                  "altitude": 18000,
                  "direction": 259
                },
                {
                  "oat": -20,
                  "speed": 72,
                  "altitude": 24000,
                  "direction": 260
                },
                {
                  "oat": -35,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 265
                },
                {
                  "oat": -47,
                  "speed": 82,
                  "altitude": 34000,
                  "direction": 270
                },
                {
                  "oat": -59,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 265
                },
                {
                  "oat": -60,
                  "speed": 68,
                  "altitude": 45000,
                  "direction": 268
                }
              ]
            }
          },
          {
            "ordinal": 33,
            "ident": "OFSOX",
            "latitude": 52.029217,
            "longitude": -5.19545,
            "altitude": 36000,
            "elapsedSeconds": 5382,
            "distanceNm": 63,
            "trackTrue": 281,
            "trackMag": 282,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5380,
              "leg": 847,
              "used": 10451,
              "minimumOnBoard": 38265,
              "plannedOnBoard": 40404
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 42700,
            "mora": 4800,
            "fir": "EGTT",
            "wind": {
              "direction": 262,
              "speed": 80,
              "levels": [
                {
                  "oat": 17,
                  "speed": 21,
                  "altitude": 0,
                  "direction": 226
                },
                {
                  "oat": 11,
                  "speed": 40,
                  "altitude": 5000,
                  "direction": 253
                },
                {
                  "oat": 5,
                  "speed": 57,
                  "altitude": 10000,
                  "direction": 254
                },
                {
                  "oat": -2,
                  "speed": 69,
                  "altitude": 14000,
                  "direction": 255
                },
                {
                  "oat": -10,
                  "speed": 75,
                  "altitude": 18000,
                  "direction": 255
                },
                {
                  "oat": -21,
                  "speed": 74,
                  "altitude": 24000,
                  "direction": 258
                },
                {
                  "oat": -35,
                  "speed": 79,
                  "altitude": 30000,
                  "direction": 264
                },
                {
                  "oat": -47,
                  "speed": 82,
                  "altitude": 34000,
                  "direction": 263
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 260
                },
                {
                  "oat": -61,
                  "speed": 71,
                  "altitude": 45000,
                  "direction": 265
                }
              ]
            }
          },
          {
            "ordinal": 34,
            "ident": "SLANY",
            "latitude": 52.158556,
            "longitude": -5.842131,
            "altitude": 36000,
            "elapsedSeconds": 5604,
            "distanceNm": 25,
            "trackTrue": 288,
            "trackMag": 289,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5332,
              "leg": 329,
              "used": 10780,
              "minimumOnBoard": 37936,
              "plannedOnBoard": 40075
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 42800,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 260,
              "speed": 78,
              "levels": [
                {
                  "oat": 16,
                  "speed": 26,
                  "altitude": 0,
                  "direction": 233
                },
                {
                  "oat": 11,
                  "speed": 44,
                  "altitude": 5000,
                  "direction": 249
                },
                {
                  "oat": 5,
                  "speed": 61,
                  "altitude": 10000,
                  "direction": 253
                },
                {
                  "oat": -1,
                  "speed": 72,
                  "altitude": 14000,
                  "direction": 254
                },
                {
                  "oat": -9,
                  "speed": 75,
                  "altitude": 18000,
                  "direction": 255
                },
                {
                  "oat": -21,
                  "speed": 79,
                  "altitude": 24000,
                  "direction": 255
                },
                {
                  "oat": -35,
                  "speed": 77,
                  "altitude": 30000,
                  "direction": 262
                },
                {
                  "oat": -47,
                  "speed": 80,
                  "altitude": 34000,
                  "direction": 262
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 257
                },
                {
                  "oat": -61,
                  "speed": 72,
                  "altitude": 45000,
                  "direction": 263
                }
              ]
            }
          },
          {
            "ordinal": 35,
            "ident": "MALOT",
            "latitude": 53,
            "longitude": -15,
            "altitude": 36000,
            "elapsedSeconds": 8764,
            "distanceNm": 338,
            "trackTrue": 282,
            "trackMag": 283,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5608,
              "leg": 4922,
              "used": 15702,
              "minimumOnBoard": 33014,
              "plannedOnBoard": 35153
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 41500,
            "mora": 5100,
            "fir": "EISN",
            "wind": {
              "direction": 254,
              "speed": 103,
              "levels": [
                {
                  "oat": 15,
                  "speed": 28,
                  "altitude": 0,
                  "direction": 260
                },
                {
                  "oat": 4,
                  "speed": 37,
                  "altitude": 5000,
                  "direction": 259
                },
                {
                  "oat": -1,
                  "speed": 47,
                  "altitude": 10000,
                  "direction": 256
                },
                {
                  "oat": -7,
                  "speed": 59,
                  "altitude": 14000,
                  "direction": 255
                },
                {
                  "oat": -14,
                  "speed": 76,
                  "altitude": 18000,
                  "direction": 249
                },
                {
                  "oat": -23,
                  "speed": 110,
                  "altitude": 24000,
                  "direction": 245
                },
                {
                  "oat": -35,
                  "speed": 127,
                  "altitude": 30000,
                  "direction": 249
                },
                {
                  "oat": -47,
                  "speed": 125,
                  "altitude": 34000,
                  "direction": 250
                },
                {
                  "oat": -57,
                  "speed": 121,
                  "altitude": 39000,
                  "direction": 254
                },
                {
                  "oat": -53,
                  "speed": 79,
                  "altitude": 45000,
                  "direction": 253
                }
              ]
            }
          },
          {
            "ordinal": 36,
            "ident": "54N020W",
            "latitude": 54,
            "longitude": -20,
            "altitude": 37000,
            "elapsedSeconds": 10498,
            "distanceNm": 188,
            "trackTrue": 290,
            "trackMag": 295,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 5505,
              "leg": 2685,
              "used": 18387,
              "minimumOnBoard": 30329,
              "plannedOnBoard": 32468
            },
            "oat": -49,
            "isaDeviation": 8,
            "tropopause": 35800,
            "mora": 2000,
            "fir": "EGGX",
            "wind": {
              "direction": 249,
              "speed": 114,
              "levels": [
                {
                  "oat": 13,
                  "speed": 37,
                  "altitude": 0,
                  "direction": 264
                },
                {
                  "oat": 2,
                  "speed": 44,
                  "altitude": 5000,
                  "direction": 271
                },
                {
                  "oat": -5,
                  "speed": 45,
                  "altitude": 10000,
                  "direction": 267
                },
                {
                  "oat": -11,
                  "speed": 45,
                  "altitude": 14000,
                  "direction": 260
                },
                {
                  "oat": -19,
                  "speed": 48,
                  "altitude": 18000,
                  "direction": 256
                },
                {
                  "oat": -32,
                  "speed": 66,
                  "altitude": 24000,
                  "direction": 250
                },
                {
                  "oat": -43,
                  "speed": 93,
                  "altitude": 30000,
                  "direction": 249
                },
                {
                  "oat": -45,
                  "speed": 104,
                  "altitude": 34000,
                  "direction": 249
                },
                {
                  "oat": -46,
                  "speed": 86,
                  "altitude": 39000,
                  "direction": 250
                },
                {
                  "oat": -49,
                  "speed": 63,
                  "altitude": 45000,
                  "direction": 251
                }
              ]
            }
          },
          {
            "ordinal": 37,
            "ident": "5430N03000W",
            "latitude": 54.5,
            "longitude": -30,
            "altitude": 37000,
            "elapsedSeconds": 13536,
            "distanceNm": 352,
            "trackTrue": 278,
            "trackMag": 286,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 5310,
              "leg": 4481,
              "used": 22868,
              "minimumOnBoard": 25848,
              "plannedOnBoard": 27987
            },
            "oat": -46,
            "isaDeviation": 11,
            "tropopause": 31400,
            "mora": 2000,
            "fir": "EGGX",
            "wind": {
              "direction": 255,
              "speed": 70,
              "levels": [
                {
                  "oat": 10,
                  "speed": 29,
                  "altitude": 0,
                  "direction": 288
                },
                {
                  "oat": 1,
                  "speed": 25,
                  "altitude": 5000,
                  "direction": 296
                },
                {
                  "oat": -5,
                  "speed": 31,
                  "altitude": 10000,
                  "direction": 294
                },
                {
                  "oat": -11,
                  "speed": 32,
                  "altitude": 14000,
                  "direction": 294
                },
                {
                  "oat": -20,
                  "speed": 34,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -34,
                  "speed": 37,
                  "altitude": 24000,
                  "direction": 298
                },
                {
                  "oat": -48,
                  "speed": 38,
                  "altitude": 30000,
                  "direction": 298
                },
                {
                  "oat": -53,
                  "speed": 39,
                  "altitude": 34000,
                  "direction": 282
                },
                {
                  "oat": -47,
                  "speed": 49,
                  "altitude": 39000,
                  "direction": 267
                },
                {
                  "oat": -48,
                  "speed": 44,
                  "altitude": 45000,
                  "direction": 261
                }
              ]
            }
          },
          {
            "ordinal": 38,
            "ident": "5330N04000W",
            "latitude": 53.5,
            "longitude": -40,
            "altitude": 37000,
            "elapsedSeconds": 16458,
            "distanceNm": 358,
            "trackTrue": 264,
            "trackMag": 276,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 5131,
              "leg": 4165,
              "used": 27033,
              "minimumOnBoard": 21683,
              "plannedOnBoard": 23822
            },
            "oat": -51,
            "isaDeviation": 6,
            "tropopause": 34100,
            "mora": 2000,
            "fir": "CZQX",
            "wind": {
              "direction": 285,
              "speed": 37,
              "levels": [
                {
                  "oat": 10,
                  "speed": 21,
                  "altitude": 0,
                  "direction": 259
                },
                {
                  "oat": 2,
                  "speed": 24,
                  "altitude": 5000,
                  "direction": 278
                },
                {
                  "oat": -2,
                  "speed": 23,
                  "altitude": 10000,
                  "direction": 285
                },
                {
                  "oat": -9,
                  "speed": 28,
                  "altitude": 14000,
                  "direction": 287
                },
                {
                  "oat": -17,
                  "speed": 31,
                  "altitude": 18000,
                  "direction": 292
                },
                {
                  "oat": -31,
                  "speed": 35,
                  "altitude": 24000,
                  "direction": 294
                },
                {
                  "oat": -45,
                  "speed": 39,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -54,
                  "speed": 50,
                  "altitude": 34000,
                  "direction": 324
                },
                {
                  "oat": -55,
                  "speed": 37,
                  "altitude": 39000,
                  "direction": 306
                },
                {
                  "oat": -52,
                  "speed": 33,
                  "altitude": 45000,
                  "direction": 274
                }
              ]
            }
          },
          {
            "ordinal": 39,
            "ident": "52N050W",
            "latitude": 52,
            "longitude": -50,
            "altitude": 37000,
            "elapsedSeconds": 19372,
            "distanceNm": 374,
            "trackTrue": 260,
            "trackMag": 275,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 4954,
              "leg": 4010,
              "used": 31043,
              "minimumOnBoard": 17673,
              "plannedOnBoard": 19812
            },
            "oat": -57,
            "isaDeviation": 0,
            "tropopause": 39000,
            "mora": 2000,
            "fir": "CZQX",
            "wind": {
              "direction": 338,
              "speed": 34,
              "levels": [
                {
                  "oat": 11,
                  "speed": 20,
                  "altitude": 0,
                  "direction": 243
                },
                {
                  "oat": 6,
                  "speed": 16,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 0,
                  "speed": 15,
                  "altitude": 10000,
                  "direction": 285
                },
                {
                  "oat": -6,
                  "speed": 18,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -15,
                  "speed": 19,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -28,
                  "speed": 15,
                  "altitude": 24000,
                  "direction": 303
                },
                {
                  "oat": -42,
                  "speed": 19,
                  "altitude": 30000,
                  "direction": 326
                },
                {
                  "oat": -51,
                  "speed": 21,
                  "altitude": 34000,
                  "direction": 336
                },
                {
                  "oat": -61,
                  "speed": 15,
                  "altitude": 39000,
                  "direction": 323
                },
                {
                  "oat": -56,
                  "speed": 21,
                  "altitude": 45000,
                  "direction": 289
                }
              ]
            }
          },
          {
            "ordinal": 40,
            "ident": "TUDEP",
            "latitude": 51.166667,
            "longitude": -53.233333,
            "altitude": 37000,
            "elapsedSeconds": 20388,
            "distanceNm": 131,
            "trackTrue": 248,
            "trackMag": 266,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 4877,
              "leg": 1376,
              "used": 32419,
              "minimumOnBoard": 16297,
              "plannedOnBoard": 18436
            },
            "oat": -58,
            "isaDeviation": -1,
            "tropopause": 40500,
            "mora": 2000,
            "fir": "CZQX",
            "wind": {
              "direction": 307,
              "speed": 9,
              "levels": [
                {
                  "oat": 12,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 223
                },
                {
                  "oat": 6,
                  "speed": 11,
                  "altitude": 5000,
                  "direction": 266
                },
                {
                  "oat": 0,
                  "speed": 9,
                  "altitude": 10000,
                  "direction": 270
                },
                {
                  "oat": -5,
                  "speed": 9,
                  "altitude": 14000,
                  "direction": 272
                },
                {
                  "oat": -14,
                  "speed": 11,
                  "altitude": 18000,
                  "direction": 273
                },
                {
                  "oat": -27,
                  "speed": 12,
                  "altitude": 24000,
                  "direction": 279
                },
                {
                  "oat": -42,
                  "speed": 7,
                  "altitude": 30000,
                  "direction": 291
                },
                {
                  "oat": -51,
                  "speed": 3,
                  "altitude": 34000,
                  "direction": 254
                },
                {
                  "oat": -61,
                  "speed": 6,
                  "altitude": 39000,
                  "direction": 252
                },
                {
                  "oat": -56,
                  "speed": 22,
                  "altitude": 45000,
                  "direction": 295
                }
              ]
            }
          },
          {
            "ordinal": 41,
            "ident": "TOPPS",
            "latitude": 45.340181,
            "longitude": -67.738642,
            "altitude": 40000,
            "elapsedSeconds": 25868,
            "distanceNm": 675,
            "trackTrue": 244,
            "trackMag": 262,
            "viaAirway": "N526A",
            "stage": "CRZ",
            "fuel": {
              "flow": 4515,
              "leg": 7005,
              "used": 39424,
              "minimumOnBoard": 9292,
              "plannedOnBoard": 11431
            },
            "oat": -58,
            "isaDeviation": -1,
            "tropopause": 39700,
            "mora": 4900,
            "fir": "KZBW",
            "wind": {
              "direction": 275,
              "speed": 26,
              "levels": [
                {
                  "oat": 15,
                  "speed": 3,
                  "altitude": 0,
                  "direction": 136
                },
                {
                  "oat": 11,
                  "speed": 12,
                  "altitude": 5000,
                  "direction": 205
                },
                {
                  "oat": 4,
                  "speed": 18,
                  "altitude": 10000,
                  "direction": 251
                },
                {
                  "oat": -2,
                  "speed": 22,
                  "altitude": 14000,
                  "direction": 262
                },
                {
                  "oat": -10,
                  "speed": 25,
                  "altitude": 18000,
                  "direction": 269
                },
                {
                  "oat": -23,
                  "speed": 29,
                  "altitude": 24000,
                  "direction": 274
                },
                {
                  "oat": -38,
                  "speed": 30,
                  "altitude": 30000,
                  "direction": 273
                },
                {
                  "oat": -49,
                  "speed": 29,
                  "altitude": 34000,
                  "direction": 283
                },
                {
                  "oat": -56,
                  "speed": 32,
                  "altitude": 39000,
                  "direction": 278
                },
                {
                  "oat": -55,
                  "speed": 40,
                  "altitude": 45000,
                  "direction": 293
                }
              ]
            }
          },
          {
            "ordinal": 42,
            "ident": "ENE",
            "latitude": 43.425672,
            "longitude": -70.613525,
            "altitude": 40000,
            "elapsedSeconds": 27238,
            "distanceNm": 169,
            "trackTrue": 228,
            "trackMag": 244,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 4459,
              "leg": 1697,
              "used": 41121,
              "minimumOnBoard": 7595,
              "plannedOnBoard": 9734
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 39300,
            "mora": 3100,
            "fir": "KZBW",
            "wind": {
              "direction": 292,
              "speed": 46,
              "levels": [
                {
                  "oat": 20,
                  "speed": 4,
                  "altitude": 0,
                  "direction": 77
                },
                {
                  "oat": 14,
                  "speed": 18,
                  "altitude": 5000,
                  "direction": 301
                },
                {
                  "oat": 6,
                  "speed": 23,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": 0,
                  "speed": 31,
                  "altitude": 14000,
                  "direction": 292
                },
                {
                  "oat": -8,
                  "speed": 35,
                  "altitude": 18000,
                  "direction": 292
                },
                {
                  "oat": -22,
                  "speed": 35,
                  "altitude": 24000,
                  "direction": 285
                },
                {
                  "oat": -38,
                  "speed": 43,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -47,
                  "speed": 53,
                  "altitude": 34000,
                  "direction": 295
                },
                {
                  "oat": -54,
                  "speed": 66,
                  "altitude": 39000,
                  "direction": 300
                },
                {
                  "oat": -55,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 43,
            "ident": "ASPEN",
            "latitude": 42.815986,
            "longitude": -70.911497,
            "altitude": 40000,
            "elapsedSeconds": 27536,
            "distanceNm": 39,
            "trackTrue": 199,
            "trackMag": 214,
            "viaAirway": "PARCH4",
            "stage": "CRZ",
            "fuel": {
              "flow": 4370,
              "leg": 362,
              "used": 41483,
              "minimumOnBoard": 7233,
              "plannedOnBoard": 9372
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 40300,
            "mora": 2500,
            "fir": "KZBW",
            "wind": {
              "direction": 300,
              "speed": 65,
              "levels": [
                {
                  "oat": 20,
                  "speed": 4,
                  "altitude": 0,
                  "direction": 77
                },
                {
                  "oat": 14,
                  "speed": 18,
                  "altitude": 5000,
                  "direction": 302
                },
                {
                  "oat": 6,
                  "speed": 23,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": 0,
                  "speed": 31,
                  "altitude": 14000,
                  "direction": 293
                },
                {
                  "oat": -8,
                  "speed": 35,
                  "altitude": 18000,
                  "direction": 292
                },
                {
                  "oat": -22,
                  "speed": 35,
                  "altitude": 24000,
                  "direction": 285
                },
                {
                  "oat": -38,
                  "speed": 43,
                  "altitude": 30000,
                  "direction": 284
                },
                {
                  "oat": -47,
                  "speed": 53,
                  "altitude": 34000,
                  "direction": 296
                },
                {
                  "oat": -54,
                  "speed": 66,
                  "altitude": 39000,
                  "direction": 300
                },
                {
                  "oat": -55,
                  "speed": 59,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 44,
            "ident": "PVD",
            "latitude": 41.724344,
            "longitude": -71.429639,
            "altitude": 40000,
            "elapsedSeconds": 28058,
            "distanceNm": 69,
            "trackTrue": 199,
            "trackMag": 214,
            "viaAirway": "PARCH4",
            "stage": "CRZ",
            "fuel": {
              "flow": 4343,
              "leg": 630,
              "used": 42113,
              "minimumOnBoard": 6603,
              "plannedOnBoard": 8742
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 41100,
            "mora": 2600,
            "fir": "KZBW",
            "wind": {
              "direction": 305,
              "speed": 71,
              "levels": [
                {
                  "oat": 23,
                  "speed": 2,
                  "altitude": 0,
                  "direction": 288
                },
                {
                  "oat": 15,
                  "speed": 21,
                  "altitude": 5000,
                  "direction": 287
                },
                {
                  "oat": 7,
                  "speed": 28,
                  "altitude": 10000,
                  "direction": 295
                },
                {
                  "oat": 0,
                  "speed": 35,
                  "altitude": 14000,
                  "direction": 299
                },
                {
                  "oat": -8,
                  "speed": 36,
                  "altitude": 18000,
                  "direction": 299
                },
                {
                  "oat": -22,
                  "speed": 43,
                  "altitude": 24000,
                  "direction": 298
                },
                {
                  "oat": -37,
                  "speed": 62,
                  "altitude": 30000,
                  "direction": 299
                },
                {
                  "oat": -46,
                  "speed": 81,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -54,
                  "speed": 73,
                  "altitude": 39000,
                  "direction": 306
                },
                {
                  "oat": -56,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 304
                }
              ]
            }
          },
          {
            "ordinal": 45,
            "ident": "TOD",
            "latitude": 41.698783,
            "longitude": -71.458252,
            "altitude": 40000,
            "elapsedSeconds": 28073,
            "distanceNm": 2,
            "trackTrue": 219,
            "trackMag": 234,
            "viaAirway": "PARCH4",
            "stage": "CRZ",
            "fuel": {
              "flow": 4477,
              "leg": 19,
              "used": 42132,
              "minimumOnBoard": 6584,
              "plannedOnBoard": 8723
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 41100,
            "mora": 2400,
            "fir": "KZBW",
            "wind": {
              "direction": 306,
              "speed": 72,
              "levels": [
                {
                  "oat": 23,
                  "speed": 2,
                  "altitude": 0,
                  "direction": 288
                },
                {
                  "oat": 15,
                  "speed": 21,
                  "altitude": 5000,
                  "direction": 287
                },
                {
                  "oat": 7,
                  "speed": 28,
                  "altitude": 10000,
                  "direction": 295
                },
                {
                  "oat": 0,
                  "speed": 35,
                  "altitude": 14000,
                  "direction": 299
                },
                {
                  "oat": -8,
                  "speed": 36,
                  "altitude": 18000,
                  "direction": 299
                },
                {
                  "oat": -22,
                  "speed": 43,
                  "altitude": 24000,
                  "direction": 299
                },
                {
                  "oat": -37,
                  "speed": 62,
                  "altitude": 30000,
                  "direction": 299
                },
                {
                  "oat": -46,
                  "speed": 81,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -54,
                  "speed": 73,
                  "altitude": 39000,
                  "direction": 306
                },
                {
                  "oat": -56,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 304
                }
              ]
            }
          },
          {
            "ordinal": 46,
            "ident": "TRAIT",
            "latitude": 41.284653,
            "longitude": -71.917597,
            "altitude": 30200,
            "elapsedSeconds": 28399,
            "distanceNm": 32,
            "trackTrue": 219,
            "trackMag": 235,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2509,
              "leg": 96,
              "used": 42228,
              "minimumOnBoard": 6488,
              "plannedOnBoard": 8627
            },
            "oat": -36,
            "isaDeviation": 9,
            "tropopause": 44300,
            "mora": 2600,
            "fir": "KZBW",
            "wind": {
              "direction": 304,
              "speed": 75,
              "levels": [
                {
                  "oat": 23,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 238
                },
                {
                  "oat": 17,
                  "speed": 22,
                  "altitude": 5000,
                  "direction": 293
                },
                {
                  "oat": 8,
                  "speed": 37,
                  "altitude": 10000,
                  "direction": 310
                },
                {
                  "oat": 1,
                  "speed": 40,
                  "altitude": 14000,
                  "direction": 304
                },
                {
                  "oat": -8,
                  "speed": 37,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -21,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 304
                },
                {
                  "oat": -35,
                  "speed": 75,
                  "altitude": 30000,
                  "direction": 304
                },
                {
                  "oat": -44,
                  "speed": 89,
                  "altitude": 34000,
                  "direction": 305
                },
                {
                  "oat": -54,
                  "speed": 81,
                  "altitude": 39000,
                  "direction": 297
                },
                {
                  "oat": -58,
                  "speed": 74,
                  "altitude": 45000,
                  "direction": 307
                }
              ]
            }
          },
          {
            "ordinal": 47,
            "ident": "PARCH",
            "latitude": 41.099228,
            "longitude": -72.120739,
            "altitude": 25800,
            "elapsedSeconds": 28542,
            "distanceNm": 14,
            "trackTrue": 219,
            "trackMag": 233,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2607,
              "leg": 42,
              "used": 42270,
              "minimumOnBoard": 6446,
              "plannedOnBoard": 8585
            },
            "oat": -25,
            "isaDeviation": 12,
            "tropopause": 44100,
            "mora": 2100,
            "fir": "KZBW",
            "wind": {
              "direction": 303,
              "speed": 61,
              "levels": [
                {
                  "oat": 23,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 238
                },
                {
                  "oat": 17,
                  "speed": 22,
                  "altitude": 5000,
                  "direction": 293
                },
                {
                  "oat": 8,
                  "speed": 37,
                  "altitude": 10000,
                  "direction": 310
                },
                {
                  "oat": 1,
                  "speed": 40,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -8,
                  "speed": 37,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -21,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 304
                },
                {
                  "oat": -35,
                  "speed": 75,
                  "altitude": 30000,
                  "direction": 304
                },
                {
                  "oat": -44,
                  "speed": 89,
                  "altitude": 34000,
                  "direction": 305
                },
                {
                  "oat": -54,
                  "speed": 81,
                  "altitude": 39000,
                  "direction": 297
                },
                {
                  "oat": -58,
                  "speed": 74,
                  "altitude": 45000,
                  "direction": 307
                }
              ]
            }
          },
          {
            "ordinal": 48,
            "ident": "CCC",
            "latitude": 40.929619,
            "longitude": -72.798858,
            "altitude": 16000,
            "elapsedSeconds": 28868,
            "distanceNm": 32,
            "trackTrue": 251,
            "trackMag": 265,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2685,
              "leg": 96,
              "used": 42366,
              "minimumOnBoard": 6350,
              "plannedOnBoard": 8489
            },
            "oat": -2,
            "isaDeviation": 15,
            "tropopause": 43800,
            "mora": 2300,
            "fir": "KZBW",
            "wind": {
              "direction": 304,
              "speed": 36,
              "levels": [
                {
                  "oat": 26,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 205
                },
                {
                  "oat": 17,
                  "speed": 20,
                  "altitude": 5000,
                  "direction": 285
                },
                {
                  "oat": 9,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 311
                },
                {
                  "oat": 1,
                  "speed": 36,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -7,
                  "speed": 38,
                  "altitude": 18000,
                  "direction": 305
                },
                {
                  "oat": -20,
                  "speed": 61,
                  "altitude": 24000,
                  "direction": 296
                },
                {
                  "oat": -35,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 293
                },
                {
                  "oat": -44,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 302
                },
                {
                  "oat": -55,
                  "speed": 72,
                  "altitude": 39000,
                  "direction": 293
                },
                {
                  "oat": -58,
                  "speed": 76,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 49,
            "ident": "ROBER",
            "latitude": 40.685464,
            "longitude": -73.032611,
            "altitude": 10500,
            "elapsedSeconds": 29051,
            "distanceNm": 18,
            "trackTrue": 216,
            "trackMag": 229,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2689,
              "leg": 54,
              "used": 42420,
              "minimumOnBoard": 6296,
              "plannedOnBoard": 8435
            },
            "oat": 8,
            "isaDeviation": 14,
            "tropopause": 43700,
            "mora": 2300,
            "fir": "KZBW",
            "wind": {
              "direction": 311,
              "speed": 34,
              "levels": [
                {
                  "oat": 26,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 205
                },
                {
                  "oat": 17,
                  "speed": 19,
                  "altitude": 5000,
                  "direction": 285
                },
                {
                  "oat": 9,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 311
                },
                {
                  "oat": 1,
                  "speed": 36,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -7,
                  "speed": 38,
                  "altitude": 18000,
                  "direction": 305
                },
                {
                  "oat": -20,
                  "speed": 61,
                  "altitude": 24000,
                  "direction": 296
                },
                {
                  "oat": -34,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 293
                },
                {
                  "oat": -44,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 302
                },
                {
                  "oat": -55,
                  "speed": 72,
                  "altitude": 39000,
                  "direction": 293
                },
                {
                  "oat": -58,
                  "speed": 76,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 50,
            "ident": "CRAIL",
            "latitude": 40.686967,
            "longitude": -73.343411,
            "altitude": 6200,
            "elapsedSeconds": 29194,
            "distanceNm": 14,
            "trackTrue": 270,
            "trackMag": 283,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2680,
              "leg": 42,
              "used": 42462,
              "minimumOnBoard": 6254,
              "plannedOnBoard": 8393
            },
            "oat": 15,
            "isaDeviation": 12,
            "tropopause": 43700,
            "mora": 2200,
            "fir": "KZBW",
            "wind": {
              "direction": 297,
              "speed": 25,
              "levels": [
                {
                  "oat": 26,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 204
                },
                {
                  "oat": 17,
                  "speed": 19,
                  "altitude": 5000,
                  "direction": 285
                },
                {
                  "oat": 9,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 311
                },
                {
                  "oat": 1,
                  "speed": 36,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -7,
                  "speed": 38,
                  "altitude": 18000,
                  "direction": 305
                },
                {
                  "oat": -20,
                  "speed": 61,
                  "altitude": 24000,
                  "direction": 296
                },
                {
                  "oat": -34,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 293
                },
                {
                  "oat": -44,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 302
                },
                {
                  "oat": -55,
                  "speed": 72,
                  "altitude": 39000,
                  "direction": 293
                },
                {
                  "oat": -58,
                  "speed": 76,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 51,
            "ident": "KJFK",
            "latitude": 40.639928,
            "longitude": -73.778692,
            "altitude": 2500,
            "elapsedSeconds": 29678,
            "distanceNm": 27,
            "trackTrue": 262,
            "trackMag": 275,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2689,
              "leg": 308,
              "used": 42770,
              "minimumOnBoard": 5946,
              "plannedOnBoard": 8085
            },
            "oat": 23,
            "isaDeviation": 13,
            "tropopause": 45600,
            "mora": 2200,
            "fir": "KZNY",
            "wind": {
              "direction": 287,
              "speed": 8,
              "levels": [
                {
                  "oat": 25,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 262
                },
                {
                  "oat": 19,
                  "speed": 18,
                  "altitude": 5000,
                  "direction": 297
                },
                {
                  "oat": 9,
                  "speed": 30,
                  "altitude": 10000,
                  "direction": 301
                },
                {
                  "oat": 0,
                  "speed": 38,
                  "altitude": 14000,
                  "direction": 304
                },
                {
                  "oat": -8,
                  "speed": 41,
                  "altitude": 18000,
                  "direction": 306
                },
                {
                  "oat": -20,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 300
                },
                {
                  "oat": -33,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -43,
                  "speed": 73,
                  "altitude": 34000,
                  "direction": 290
                },
                {
                  "oat": -54,
                  "speed": 71,
                  "altitude": 39000,
                  "direction": 284
                },
                {
                  "oat": -61,
                  "speed": 74,
                  "altitude": 45000,
                  "direction": 293
                }
              ]
            }
          }
        ]
      }
      """

  Scenario: As operations I read the same planned route as anyone else
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "route": "OBOK3W OBOKA Z29 TORNU DCT VELED DCT BREDA DCT GALSO Q63 ICTAM L179 SAWPE DCT OZZIL DCT ARPAK DCT FELCA DCT OFSOX DCT SLANY DCT MALOT DCT 54N020W 5430N03000W 5330N04000W 52N050W DCT TUDEP N526A TOPPS DCT ENE PARCH4",
        "atcRoute": "N0477F360 OBOK3W OBOKA Z29 TORNU DCT VELED DCT BREDA DCT GALSO Q63 ICTAM L179 SAWPE DCT OZZIL DCT ARPAK DCT FELCA DCT OFSOX DCT SLANY DCT MALOT/M082F370 DCT 54N020W 5430N03000W 5330N04000W 52N050W DCT TUDEP/N0464F400 N526A TOPPS DCT ENE PARCH4",
        "fixes": [
          {
            "ordinal": 0,
            "ident": "EDDF",
            "latitude": 50.033306,
            "longitude": 8.570456,
            "altitude": 363,
            "elapsedSeconds": 0,
            "distanceNm": 0,
            "trackTrue": null,
            "trackMag": null,
            "viaAirway": null,
            "stage": "CLB",
            "fuel": {
              "flow": null,
              "leg": null,
              "used": null,
              "minimumOnBoard": null,
              "plannedOnBoard": null
            },
            "oat": null,
            "isaDeviation": null,
            "tropopause": null,
            "mora": null,
            "fir": null,
            "wind": {
              "direction": null,
              "speed": null,
              "levels": []
            }
          },
          {
            "ordinal": 1,
            "ident": "DF999",
            "latitude": 50.027508,
            "longitude": 8.513286,
            "altitude": 2900,
            "elapsedSeconds": 163,
            "distanceNm": 2,
            "trackTrue": 261,
            "trackMag": 257,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14392,
              "leg": 685,
              "used": 685,
              "minimumOnBoard": 48031,
              "plannedOnBoard": 50170
            },
            "oat": 16,
            "isaDeviation": 7,
            "tropopause": 41700,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 259,
              "speed": 26,
              "levels": [
                {
                  "oat": 18,
                  "speed": 3,
                  "altitude": 0,
                  "direction": 220
                },
                {
                  "oat": 11,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 4,
                  "speed": 32,
                  "altitude": 10000,
                  "direction": 278
                },
                {
                  "oat": -2,
                  "speed": 39,
                  "altitude": 14000,
                  "direction": 290
                },
                {
                  "oat": -11,
                  "speed": 48,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -23,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 307
                },
                {
                  "oat": -38,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 314
                },
                {
                  "oat": -49,
                  "speed": 80,
                  "altitude": 34000,
                  "direction": 311
                },
                {
                  "oat": -61,
                  "speed": 89,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -58,
                  "speed": 53,
                  "altitude": 45000,
                  "direction": 309
                }
              ]
            }
          },
          {
            "ordinal": 2,
            "ident": "DF998",
            "latitude": 50.001272,
            "longitude": 8.480206,
            "altitude": 5300,
            "elapsedSeconds": 221,
            "distanceNm": 2,
            "trackTrue": 219,
            "trackMag": 215,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14373,
              "leg": 228,
              "used": 913,
              "minimumOnBoard": 47803,
              "plannedOnBoard": 49942
            },
            "oat": 11,
            "isaDeviation": 7,
            "tropopause": 42100,
            "mora": 2800,
            "fir": "EDGG",
            "wind": {
              "direction": 275,
              "speed": 32,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 3,
            "ident": "DF996",
            "latitude": 49.961917,
            "longitude": 8.471325,
            "altitude": 7300,
            "elapsedSeconds": 268,
            "distanceNm": 2,
            "trackTrue": 188,
            "trackMag": 185,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14439,
              "leg": 191,
              "used": 1104,
              "minimumOnBoard": 47612,
              "plannedOnBoard": 49751
            },
            "oat": 9,
            "isaDeviation": 9,
            "tropopause": 42100,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 277,
              "speed": 32,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 4,
            "ident": "DF172",
            "latitude": 49.914603,
            "longitude": 8.449433,
            "altitude": 9800,
            "elapsedSeconds": 325,
            "distanceNm": 3,
            "trackTrue": 196,
            "trackMag": 193,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14457,
              "leg": 238,
              "used": 1342,
              "minimumOnBoard": 47374,
              "plannedOnBoard": 49513
            },
            "oat": 5,
            "isaDeviation": 10,
            "tropopause": 42100,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 281,
              "speed": 34,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 5,
            "ident": "PABVI",
            "latitude": 49.884994,
            "longitude": 8.373053,
            "altitude": 11900,
            "elapsedSeconds": 391,
            "distanceNm": 3,
            "trackTrue": 238,
            "trackMag": 235,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14430,
              "leg": 250,
              "used": 1592,
              "minimumOnBoard": 47124,
              "plannedOnBoard": 49263
            },
            "oat": 1,
            "isaDeviation": 10,
            "tropopause": 42100,
            "mora": 2400,
            "fir": "EDGG",
            "wind": {
              "direction": 284,
              "speed": 37,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 6,
            "ident": "SIVDO",
            "latitude": 49.890575,
            "longitude": 8.265772,
            "altitude": 14200,
            "elapsedSeconds": 473,
            "distanceNm": 4,
            "trackTrue": 274,
            "trackMag": 271,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14439,
              "leg": 280,
              "used": 1872,
              "minimumOnBoard": 46844,
              "plannedOnBoard": 48983
            },
            "oat": -2,
            "isaDeviation": 11,
            "tropopause": 42100,
            "mora": 2700,
            "fir": "EDGG",
            "wind": {
              "direction": 289,
              "speed": 42,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 7,
            "ident": "KUPIP",
            "latitude": 49.940783,
            "longitude": 8.160283,
            "altitude": 16700,
            "elapsedSeconds": 559,
            "distanceNm": 5,
            "trackTrue": 306,
            "trackMag": 303,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14435,
              "leg": 304,
              "used": 2176,
              "minimumOnBoard": 46540,
              "plannedOnBoard": 48679
            },
            "oat": -6,
            "isaDeviation": 12,
            "tropopause": 42100,
            "mora": 2900,
            "fir": "EDGG",
            "wind": {
              "direction": 294,
              "speed": 46,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 276
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 8,
            "ident": "MASIR",
            "latitude": 50.254914,
            "longitude": 7.737928,
            "altitude": 20700,
            "elapsedSeconds": 707,
            "distanceNm": 25,
            "trackTrue": 319,
            "trackMag": 316,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14298,
              "leg": 486,
              "used": 2662,
              "minimumOnBoard": 46054,
              "plannedOnBoard": 48193
            },
            "oat": -15,
            "isaDeviation": 11,
            "tropopause": 42100,
            "mora": 4100,
            "fir": "EDGG",
            "wind": {
              "direction": 302,
              "speed": 48,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 276
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 9,
            "ident": "RAVKI",
            "latitude": 50.361664,
            "longitude": 7.664903,
            "altitude": 22700,
            "elapsedSeconds": 786,
            "distanceNm": 7,
            "trackTrue": 336,
            "trackMag": 333,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 14191,
              "leg": 243,
              "used": 2905,
              "minimumOnBoard": 45811,
              "plannedOnBoard": 47950
            },
            "oat": -19,
            "isaDeviation": 11,
            "tropopause": 42200,
            "mora": 3800,
            "fir": "EDGG",
            "wind": {
              "direction": 307,
              "speed": 51,
              "levels": [
                {
                  "oat": 21,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 263
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 276
                },
                {
                  "oat": 5,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 281
                },
                {
                  "oat": -2,
                  "speed": 42,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -10,
                  "speed": 47,
                  "altitude": 18000,
                  "direction": 297
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 309
                },
                {
                  "oat": -38,
                  "speed": 64,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -49,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 307
                },
                {
                  "oat": -61,
                  "speed": 87,
                  "altitude": 39000,
                  "direction": 313
                },
                {
                  "oat": -59,
                  "speed": 55,
                  "altitude": 45000,
                  "direction": 306
                }
              ]
            }
          },
          {
            "ordinal": 10,
            "ident": "DITAM",
            "latitude": 50.558111,
            "longitude": 7.529561,
            "altitude": 26100,
            "elapsedSeconds": 929,
            "distanceNm": 13,
            "trackTrue": 336,
            "trackMag": 333,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 13938,
              "leg": 413,
              "used": 3318,
              "minimumOnBoard": 45398,
              "plannedOnBoard": 47537
            },
            "oat": -28,
            "isaDeviation": 9,
            "tropopause": 41500,
            "mora": 3800,
            "fir": "EDUU",
            "wind": {
              "direction": 304,
              "speed": 67,
              "levels": [
                {
                  "oat": 17,
                  "speed": 8,
                  "altitude": 0,
                  "direction": 241
                },
                {
                  "oat": 11,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 278
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 288
                },
                {
                  "oat": -2,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 290
                },
                {
                  "oat": -10,
                  "speed": 50,
                  "altitude": 18000,
                  "direction": 290
                },
                {
                  "oat": -23,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 299
                },
                {
                  "oat": -38,
                  "speed": 73,
                  "altitude": 30000,
                  "direction": 314
                },
                {
                  "oat": -49,
                  "speed": 84,
                  "altitude": 34000,
                  "direction": 306
                },
                {
                  "oat": -61,
                  "speed": 88,
                  "altitude": 39000,
                  "direction": 307
                },
                {
                  "oat": -58,
                  "speed": 54,
                  "altitude": 45000,
                  "direction": 303
                }
              ]
            }
          },
          {
            "ordinal": 11,
            "ident": "OBOKA",
            "latitude": 50.744864,
            "longitude": 7.338047,
            "altitude": 28600,
            "elapsedSeconds": 1044,
            "distanceNm": 13,
            "trackTrue": 327,
            "trackMag": 324,
            "viaAirway": "OBOK3W",
            "stage": "CLB",
            "fuel": {
              "flow": 13678,
              "leg": 304,
              "used": 3622,
              "minimumOnBoard": 45094,
              "plannedOnBoard": 47233
            },
            "oat": -34,
            "isaDeviation": 8,
            "tropopause": 41800,
            "mora": 3400,
            "fir": "EDVV",
            "wind": {
              "direction": 305,
              "speed": 66,
              "levels": [
                {
                  "oat": 19,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 252
                },
                {
                  "oat": 11,
                  "speed": 30,
                  "altitude": 5000,
                  "direction": 277
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": -2,
                  "speed": 47,
                  "altitude": 14000,
                  "direction": 287
                },
                {
                  "oat": -10,
                  "speed": 52,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 60,
                  "altitude": 24000,
                  "direction": 297
                },
                {
                  "oat": -38,
                  "speed": 67,
                  "altitude": 30000,
                  "direction": 307
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -61,
                  "speed": 88,
                  "altitude": 39000,
                  "direction": 302
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 12,
            "ident": "ROCUH",
            "latitude": 50.866389,
            "longitude": 6.963889,
            "altitude": 31200,
            "elapsedSeconds": 1191,
            "distanceNm": 16,
            "trackTrue": 297,
            "trackMag": 294,
            "viaAirway": "Z29",
            "stage": "CLB",
            "fuel": {
              "flow": 13222,
              "leg": 315,
              "used": 3937,
              "minimumOnBoard": 44779,
              "plannedOnBoard": 46918
            },
            "oat": -41,
            "isaDeviation": 6,
            "tropopause": 41900,
            "mora": 3100,
            "fir": "EDVV",
            "wind": {
              "direction": 308,
              "speed": 71,
              "levels": [
                {
                  "oat": 19,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 252
                },
                {
                  "oat": 11,
                  "speed": 30,
                  "altitude": 5000,
                  "direction": 277
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": -2,
                  "speed": 47,
                  "altitude": 14000,
                  "direction": 287
                },
                {
                  "oat": -10,
                  "speed": 52,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 60,
                  "altitude": 24000,
                  "direction": 297
                },
                {
                  "oat": -38,
                  "speed": 67,
                  "altitude": 30000,
                  "direction": 307
                },
                {
                  "oat": -49,
                  "speed": 79,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -61,
                  "speed": 88,
                  "altitude": 39000,
                  "direction": 302
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 13,
            "ident": "TOC",
            "latitude": 51.128729,
            "longitude": 6.136726,
            "altitude": 36000,
            "elapsedSeconds": 1497,
            "distanceNm": 35,
            "trackTrue": 297,
            "trackMag": 294,
            "viaAirway": "Z29",
            "stage": "CLB",
            "fuel": {
              "flow": 11878,
              "leg": 614,
              "used": 4551,
              "minimumOnBoard": 44165,
              "plannedOnBoard": 46304
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42500,
            "mora": 2500,
            "fir": "EDVV",
            "wind": {
              "direction": 301,
              "speed": 82,
              "levels": [
                {
                  "oat": 18,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 245
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 274
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 286
                },
                {
                  "oat": -10,
                  "speed": 54,
                  "altitude": 18000,
                  "direction": 288
                },
                {
                  "oat": -22,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 295
                },
                {
                  "oat": -37,
                  "speed": 61,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 303
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 301
                }
              ]
            }
          },
          {
            "ordinal": 14,
            "ident": "TINIK",
            "latitude": 51.14,
            "longitude": 6.100556,
            "altitude": 36000,
            "elapsedSeconds": 1515,
            "distanceNm": 2,
            "trackTrue": 296,
            "trackMag": 295,
            "viaAirway": "Z29",
            "stage": "CRZ",
            "fuel": {
              "flow": 5625,
              "leg": 28,
              "used": 4579,
              "minimumOnBoard": 44137,
              "plannedOnBoard": 46276
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42500,
            "mora": 2300,
            "fir": "EDVV",
            "wind": {
              "direction": 301,
              "speed": 81,
              "levels": [
                {
                  "oat": 19,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 245
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 274
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 286
                },
                {
                  "oat": -10,
                  "speed": 54,
                  "altitude": 18000,
                  "direction": 288
                },
                {
                  "oat": -22,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 295
                },
                {
                  "oat": -37,
                  "speed": 61,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 303
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 301
                }
              ]
            }
          },
          {
            "ordinal": 15,
            "ident": "TORNU",
            "latitude": 51.183333,
            "longitude": 5.833333,
            "altitude": 36000,
            "elapsedSeconds": 1605,
            "distanceNm": 10,
            "trackTrue": 284,
            "trackMag": 282,
            "viaAirway": "Z29",
            "stage": "CRZ",
            "fuel": {
              "flow": 5609,
              "leg": 140,
              "used": 4719,
              "minimumOnBoard": 43997,
              "plannedOnBoard": 46136
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42500,
            "mora": 2300,
            "fir": "EHAA",
            "wind": {
              "direction": 301,
              "speed": 81,
              "levels": [
                {
                  "oat": 19,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 245
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 274
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 286
                },
                {
                  "oat": -10,
                  "speed": 54,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 295
                },
                {
                  "oat": -37,
                  "speed": 61,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 303
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 301
                }
              ]
            }
          },
          {
            "ordinal": 16,
            "ident": "VELED",
            "latitude": 51.39,
            "longitude": 5.366944,
            "altitude": 36000,
            "elapsedSeconds": 1793,
            "distanceNm": 21,
            "trackTrue": 305,
            "trackMag": 302,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5593,
              "leg": 292,
              "used": 5011,
              "minimumOnBoard": 43705,
              "plannedOnBoard": 45844
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42600,
            "mora": 2100,
            "fir": "EHAA",
            "wind": {
              "direction": 295,
              "speed": 77,
              "levels": [
                {
                  "oat": 19,
                  "speed": 21,
                  "altitude": 0,
                  "direction": 244
                },
                {
                  "oat": 12,
                  "speed": 32,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 5,
                  "speed": 40,
                  "altitude": 10000,
                  "direction": 280
                },
                {
                  "oat": -1,
                  "speed": 46,
                  "altitude": 14000,
                  "direction": 283
                },
                {
                  "oat": -9,
                  "speed": 56,
                  "altitude": 18000,
                  "direction": 289
                },
                {
                  "oat": -22,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 291
                },
                {
                  "oat": -37,
                  "speed": 59,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -48,
                  "speed": 73,
                  "altitude": 34000,
                  "direction": 296
                },
                {
                  "oat": -60,
                  "speed": 81,
                  "altitude": 39000,
                  "direction": 294
                },
                {
                  "oat": -60,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 299
                }
              ]
            }
          },
          {
            "ordinal": 17,
            "ident": "BREDA",
            "latitude": 51.560306,
            "longitude": 4.853333,
            "altitude": 36000,
            "elapsedSeconds": 1993,
            "distanceNm": 22,
            "trackTrue": 298,
            "trackMag": 295,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5605,
              "leg": 311,
              "used": 5322,
              "minimumOnBoard": 43394,
              "plannedOnBoard": 45533
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41800,
            "mora": 2100,
            "fir": "EHAA",
            "wind": {
              "direction": 296,
              "speed": 82,
              "levels": [
                {
                  "oat": 20,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 10,
                  "speed": 33,
                  "altitude": 5000,
                  "direction": 273
                },
                {
                  "oat": 5,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -2,
                  "speed": 50,
                  "altitude": 14000,
                  "direction": 281
                },
                {
                  "oat": -10,
                  "speed": 60,
                  "altitude": 18000,
                  "direction": 284
                },
                {
                  "oat": -22,
                  "speed": 64,
                  "altitude": 24000,
                  "direction": 290
                },
                {
                  "oat": -37,
                  "speed": 74,
                  "altitude": 30000,
                  "direction": 291
                },
                {
                  "oat": -48,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 298
                },
                {
                  "oat": -60,
                  "speed": 84,
                  "altitude": 39000,
                  "direction": 294
                },
                {
                  "oat": -60,
                  "speed": 59,
                  "altitude": 45000,
                  "direction": 296
                }
              ]
            }
          },
          {
            "ordinal": 18,
            "ident": "GALSO",
            "latitude": 51.732778,
            "longitude": 3.171944,
            "altitude": 36000,
            "elapsedSeconds": 2558,
            "distanceNm": 63,
            "trackTrue": 280,
            "trackMag": 277,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5554,
              "leg": 872,
              "used": 6194,
              "minimumOnBoard": 42522,
              "plannedOnBoard": 44661
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41500,
            "mora": 2100,
            "fir": "EHAA",
            "wind": {
              "direction": 292,
              "speed": 76,
              "levels": [
                {
                  "oat": 21,
                  "speed": 24,
                  "altitude": 0,
                  "direction": 252
                },
                {
                  "oat": 11,
                  "speed": 31,
                  "altitude": 5000,
                  "direction": 270
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 276
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 277
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 276
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 283
                },
                {
                  "oat": -37,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 293
                },
                {
                  "oat": -60,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 290
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 290
                }
              ]
            }
          },
          {
            "ordinal": 19,
            "ident": "AMRIV",
            "latitude": 51.688611,
            "longitude": 2.666944,
            "altitude": 36000,
            "elapsedSeconds": 2725,
            "distanceNm": 19,
            "trackTrue": 262,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5477,
              "leg": 254,
              "used": 6448,
              "minimumOnBoard": 42268,
              "plannedOnBoard": 44407
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41600,
            "mora": 2000,
            "fir": "EHAA",
            "wind": {
              "direction": 292,
              "speed": 75,
              "levels": [
                {
                  "oat": 21,
                  "speed": 24,
                  "altitude": 0,
                  "direction": 251
                },
                {
                  "oat": 11,
                  "speed": 31,
                  "altitude": 5000,
                  "direction": 270
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 276
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 277
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 276
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 283
                },
                {
                  "oat": -37,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 293
                },
                {
                  "oat": -60,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 290
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 290
                }
              ]
            }
          },
          {
            "ordinal": 20,
            "ident": "MOMIC",
            "latitude": 51.673611,
            "longitude": 2.5,
            "altitude": 36000,
            "elapsedSeconds": 2777,
            "distanceNm": 6,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5469,
              "leg": 79,
              "used": 6527,
              "minimumOnBoard": 42189,
              "plannedOnBoard": 44328
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 41600,
            "mora": 2000,
            "fir": "EHAA",
            "wind": {
              "direction": 292,
              "speed": 75,
              "levels": [
                {
                  "oat": 21,
                  "speed": 24,
                  "altitude": 0,
                  "direction": 251
                },
                {
                  "oat": 11,
                  "speed": 31,
                  "altitude": 5000,
                  "direction": 270
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 276
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 277
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 276
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 283
                },
                {
                  "oat": -37,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 293
                },
                {
                  "oat": -60,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 290
                },
                {
                  "oat": -59,
                  "speed": 57,
                  "altitude": 45000,
                  "direction": 290
                }
              ]
            }
          },
          {
            "ordinal": 21,
            "ident": "SUMUM",
            "latitude": 51.637292,
            "longitude": 2.107714,
            "altitude": 36000,
            "elapsedSeconds": 2910,
            "distanceNm": 15,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5489,
              "leg": 203,
              "used": 6730,
              "minimumOnBoard": 41986,
              "plannedOnBoard": 44125
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EHAA",
            "wind": {
              "direction": 285,
              "speed": 78,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 78,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 22,
            "ident": "BLIXY",
            "latitude": 51.625069,
            "longitude": 1.975428,
            "altitude": 36000,
            "elapsedSeconds": 2954,
            "distanceNm": 5,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5479,
              "leg": 67,
              "used": 6797,
              "minimumOnBoard": 41919,
              "plannedOnBoard": 44058
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 285,
              "speed": 77,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 78,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 23,
            "ident": "ARREK",
            "latitude": 51.611956,
            "longitude": 1.835353,
            "altitude": 36000,
            "elapsedSeconds": 2998,
            "distanceNm": 5,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5476,
              "leg": 67,
              "used": 6864,
              "minimumOnBoard": 41852,
              "plannedOnBoard": 43991
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 285,
              "speed": 77,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 261
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 78,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 24,
            "ident": "ERING",
            "latitude": 51.590681,
            "longitude": 1.611944,
            "altitude": 36000,
            "elapsedSeconds": 3069,
            "distanceNm": 8,
            "trackTrue": 261,
            "trackMag": 260,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5473,
              "leg": 108,
              "used": 6972,
              "minimumOnBoard": 41744,
              "plannedOnBoard": 43883
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42200,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 285,
              "speed": 77,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 262
                },
                {
                  "oat": 11,
                  "speed": 34,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 6,
                  "speed": 42,
                  "altitude": 10000,
                  "direction": 277
                },
                {
                  "oat": -1,
                  "speed": 51,
                  "altitude": 14000,
                  "direction": 275
                },
                {
                  "oat": -10,
                  "speed": 61,
                  "altitude": 18000,
                  "direction": 275
                },
                {
                  "oat": -22,
                  "speed": 63,
                  "altitude": 24000,
                  "direction": 276
                },
                {
                  "oat": -37,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -48,
                  "speed": 76,
                  "altitude": 34000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 285
                },
                {
                  "oat": -59,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 284
                }
              ]
            }
          },
          {
            "ordinal": 25,
            "ident": "KOPUL",
            "latitude": 51.542156,
            "longitude": 1.137178,
            "altitude": 36000,
            "elapsedSeconds": 3228,
            "distanceNm": 18,
            "trackTrue": 260,
            "trackMag": 259,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5454,
              "leg": 241,
              "used": 7213,
              "minimumOnBoard": 41503,
              "plannedOnBoard": 43642
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42800,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 287,
              "speed": 75,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 265
                },
                {
                  "oat": 11,
                  "speed": 36,
                  "altitude": 5000,
                  "direction": 261
                },
                {
                  "oat": 5,
                  "speed": 46,
                  "altitude": 10000,
                  "direction": 273
                },
                {
                  "oat": -1,
                  "speed": 56,
                  "altitude": 14000,
                  "direction": 274
                },
                {
                  "oat": -10,
                  "speed": 62,
                  "altitude": 18000,
                  "direction": 272
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 273
                },
                {
                  "oat": -36,
                  "speed": 69,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 74,
                  "altitude": 34000,
                  "direction": 289
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 62,
                  "altitude": 45000,
                  "direction": 283
                }
              ]
            }
          },
          {
            "ordinal": 26,
            "ident": "IDITU",
            "latitude": 51.540219,
            "longitude": 0.977042,
            "altitude": 36000,
            "elapsedSeconds": 3281,
            "distanceNm": 6,
            "trackTrue": 268,
            "trackMag": 267,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5451,
              "leg": 80,
              "used": 7293,
              "minimumOnBoard": 41423,
              "plannedOnBoard": 43562
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42800,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 287,
              "speed": 75,
              "levels": [
                {
                  "oat": 22,
                  "speed": 22,
                  "altitude": 0,
                  "direction": 265
                },
                {
                  "oat": 11,
                  "speed": 36,
                  "altitude": 5000,
                  "direction": 261
                },
                {
                  "oat": 5,
                  "speed": 46,
                  "altitude": 10000,
                  "direction": 273
                },
                {
                  "oat": -1,
                  "speed": 56,
                  "altitude": 14000,
                  "direction": 274
                },
                {
                  "oat": -10,
                  "speed": 62,
                  "altitude": 18000,
                  "direction": 272
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 273
                },
                {
                  "oat": -36,
                  "speed": 69,
                  "altitude": 30000,
                  "direction": 287
                },
                {
                  "oat": -48,
                  "speed": 74,
                  "altitude": 34000,
                  "direction": 289
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 284
                },
                {
                  "oat": -60,
                  "speed": 62,
                  "altitude": 45000,
                  "direction": 283
                }
              ]
            }
          },
          {
            "ordinal": 27,
            "ident": "IPKUS",
            "latitude": 51.531231,
            "longitude": 0.388494,
            "altitude": 36000,
            "elapsedSeconds": 3478,
            "distanceNm": 22,
            "trackTrue": 268,
            "trackMag": 267,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5454,
              "leg": 298,
              "used": 7591,
              "minimumOnBoard": 41125,
              "plannedOnBoard": 43264
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42900,
            "mora": 2300,
            "fir": "EGTT",
            "wind": {
              "direction": 282,
              "speed": 76,
              "levels": [
                {
                  "oat": 21,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 254
                },
                {
                  "oat": 11,
                  "speed": 35,
                  "altitude": 5000,
                  "direction": 263
                },
                {
                  "oat": 5,
                  "speed": 48,
                  "altitude": 10000,
                  "direction": 270
                },
                {
                  "oat": -1,
                  "speed": 59,
                  "altitude": 14000,
                  "direction": 270
                },
                {
                  "oat": -10,
                  "speed": 66,
                  "altitude": 18000,
                  "direction": 270
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 272
                },
                {
                  "oat": -36,
                  "speed": 65,
                  "altitude": 30000,
                  "direction": 280
                },
                {
                  "oat": -47,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 282
                },
                {
                  "oat": -60,
                  "speed": 76,
                  "altitude": 39000,
                  "direction": 280
                },
                {
                  "oat": -60,
                  "speed": 62,
                  "altitude": 45000,
                  "direction": 280
                }
              ]
            }
          },
          {
            "ordinal": 28,
            "ident": "ICTAM",
            "latitude": 51.527047,
            "longitude": -1.163367,
            "altitude": 36000,
            "elapsedSeconds": 4000,
            "distanceNm": 58,
            "trackTrue": 270,
            "trackMag": 269,
            "viaAirway": "Q63",
            "stage": "CRZ",
            "fuel": {
              "flow": 5445,
              "leg": 789,
              "used": 8380,
              "minimumOnBoard": 40336,
              "plannedOnBoard": 42475
            },
            "oat": -53,
            "isaDeviation": 4,
            "tropopause": 42900,
            "mora": 2600,
            "fir": "EGTT",
            "wind": {
              "direction": 276,
              "speed": 76,
              "levels": [
                {
                  "oat": 20,
                  "speed": 17,
                  "altitude": 0,
                  "direction": 248
                },
                {
                  "oat": 12,
                  "speed": 36,
                  "altitude": 5000,
                  "direction": 264
                },
                {
                  "oat": 5,
                  "speed": 49,
                  "altitude": 10000,
                  "direction": 267
                },
                {
                  "oat": -1,
                  "speed": 61,
                  "altitude": 14000,
                  "direction": 268
                },
                {
                  "oat": -10,
                  "speed": 66,
                  "altitude": 18000,
                  "direction": 267
                },
                {
                  "oat": -21,
                  "speed": 62,
                  "altitude": 24000,
                  "direction": 267
                },
                {
                  "oat": -36,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 272
                },
                {
                  "oat": -47,
                  "speed": 75,
                  "altitude": 34000,
                  "direction": 276
                },
                {
                  "oat": -60,
                  "speed": 76,
                  "altitude": 39000,
                  "direction": 276
                },
                {
                  "oat": -61,
                  "speed": 63,
                  "altitude": 45000,
                  "direction": 276
                }
              ]
            }
          },
          {
            "ordinal": 29,
            "ident": "SAWPE",
            "latitude": 51.584631,
            "longitude": -1.654561,
            "altitude": 36000,
            "elapsedSeconds": 4171,
            "distanceNm": 19,
            "trackTrue": 280,
            "trackMag": 280,
            "viaAirway": "L179",
            "stage": "CRZ",
            "fuel": {
              "flow": 5440,
              "leg": 258,
              "used": 8638,
              "minimumOnBoard": 40078,
              "plannedOnBoard": 42217
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 43100,
            "mora": 2700,
            "fir": "EGTT",
            "wind": {
              "direction": 275,
              "speed": 77,
              "levels": [
                {
                  "oat": 20,
                  "speed": 16,
                  "altitude": 0,
                  "direction": 242
                },
                {
                  "oat": 12,
                  "speed": 38,
                  "altitude": 5000,
                  "direction": 264
                },
                {
                  "oat": 5,
                  "speed": 52,
                  "altitude": 10000,
                  "direction": 264
                },
                {
                  "oat": -1,
                  "speed": 63,
                  "altitude": 14000,
                  "direction": 264
                },
                {
                  "oat": -10,
                  "speed": 69,
                  "altitude": 18000,
                  "direction": 263
                },
                {
                  "oat": -21,
                  "speed": 64,
                  "altitude": 24000,
                  "direction": 264
                },
                {
                  "oat": -36,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 266
                },
                {
                  "oat": -47,
                  "speed": 77,
                  "altitude": 34000,
                  "direction": 274
                },
                {
                  "oat": -60,
                  "speed": 75,
                  "altitude": 39000,
                  "direction": 276
                },
                {
                  "oat": -61,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 274
                }
              ]
            }
          },
          {
            "ordinal": 30,
            "ident": "OZZIL",
            "latitude": 51.639261,
            "longitude": -2.430325,
            "altitude": 36000,
            "elapsedSeconds": 4432,
            "distanceNm": 29,
            "trackTrue": 276,
            "trackMag": 276,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5425,
              "leg": 393,
              "used": 9031,
              "minimumOnBoard": 39685,
              "plannedOnBoard": 41824
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 43100,
            "mora": 2800,
            "fir": "EGTT",
            "wind": {
              "direction": 274,
              "speed": 76,
              "levels": [
                {
                  "oat": 20,
                  "speed": 16,
                  "altitude": 0,
                  "direction": 242
                },
                {
                  "oat": 12,
                  "speed": 38,
                  "altitude": 5000,
                  "direction": 264
                },
                {
                  "oat": 5,
                  "speed": 52,
                  "altitude": 10000,
                  "direction": 264
                },
                {
                  "oat": -1,
                  "speed": 63,
                  "altitude": 14000,
                  "direction": 264
                },
                {
                  "oat": -10,
                  "speed": 69,
                  "altitude": 18000,
                  "direction": 263
                },
                {
                  "oat": -21,
                  "speed": 64,
                  "altitude": 24000,
                  "direction": 263
                },
                {
                  "oat": -36,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 266
                },
                {
                  "oat": -47,
                  "speed": 77,
                  "altitude": 34000,
                  "direction": 273
                },
                {
                  "oat": -60,
                  "speed": 75,
                  "altitude": 39000,
                  "direction": 276
                },
                {
                  "oat": -61,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 274
                }
              ]
            }
          },
          {
            "ordinal": 31,
            "ident": "ARPAK",
            "latitude": 51.8124,
            "longitude": -3.318189,
            "altitude": 36000,
            "elapsedSeconds": 4743,
            "distanceNm": 35,
            "trackTrue": 287,
            "trackMag": 287,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5385,
              "leg": 465,
              "used": 9496,
              "minimumOnBoard": 39220,
              "plannedOnBoard": 41359
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 43000,
            "mora": 3800,
            "fir": "EGTT",
            "wind": {
              "direction": 272,
              "speed": 73,
              "levels": [
                {
                  "oat": 19,
                  "speed": 14,
                  "altitude": 0,
                  "direction": 241
                },
                {
                  "oat": 12,
                  "speed": 39,
                  "altitude": 5000,
                  "direction": 261
                },
                {
                  "oat": 6,
                  "speed": 55,
                  "altitude": 10000,
                  "direction": 261
                },
                {
                  "oat": -1,
                  "speed": 66,
                  "altitude": 14000,
                  "direction": 263
                },
                {
                  "oat": -10,
                  "speed": 70,
                  "altitude": 18000,
                  "direction": 261
                },
                {
                  "oat": -20,
                  "speed": 67,
                  "altitude": 24000,
                  "direction": 261
                },
                {
                  "oat": -36,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 268
                },
                {
                  "oat": -47,
                  "speed": 72,
                  "altitude": 34000,
                  "direction": 271
                },
                {
                  "oat": -60,
                  "speed": 75,
                  "altitude": 39000,
                  "direction": 272
                },
                {
                  "oat": -61,
                  "speed": 68,
                  "altitude": 45000,
                  "direction": 271
                }
              ]
            }
          },
          {
            "ordinal": 32,
            "ident": "FELCA",
            "latitude": 51.825239,
            "longitude": -3.538781,
            "altitude": 36000,
            "elapsedSeconds": 4815,
            "distanceNm": 8,
            "trackTrue": 275,
            "trackMag": 275,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5404,
              "leg": 108,
              "used": 9604,
              "minimumOnBoard": 39112,
              "plannedOnBoard": 41251
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 42800,
            "mora": 4500,
            "fir": "EGTT",
            "wind": {
              "direction": 268,
              "speed": 79,
              "levels": [
                {
                  "oat": 18,
                  "speed": 13,
                  "altitude": 0,
                  "direction": 231
                },
                {
                  "oat": 11,
                  "speed": 38,
                  "altitude": 5000,
                  "direction": 257
                },
                {
                  "oat": 5,
                  "speed": 56,
                  "altitude": 10000,
                  "direction": 258
                },
                {
                  "oat": -1,
                  "speed": 67,
                  "altitude": 14000,
                  "direction": 260
                },
                {
                  "oat": -10,
                  "speed": 73,
                  "altitude": 18000,
                  "direction": 259
                },
                {
                  "oat": -20,
                  "speed": 72,
                  "altitude": 24000,
                  "direction": 260
                },
                {
                  "oat": -35,
                  "speed": 72,
                  "altitude": 30000,
                  "direction": 265
                },
                {
                  "oat": -47,
                  "speed": 82,
                  "altitude": 34000,
                  "direction": 270
                },
                {
                  "oat": -59,
                  "speed": 74,
                  "altitude": 39000,
                  "direction": 265
                },
                {
                  "oat": -60,
                  "speed": 68,
                  "altitude": 45000,
                  "direction": 268
                }
              ]
            }
          },
          {
            "ordinal": 33,
            "ident": "OFSOX",
            "latitude": 52.029217,
            "longitude": -5.19545,
            "altitude": 36000,
            "elapsedSeconds": 5382,
            "distanceNm": 63,
            "trackTrue": 281,
            "trackMag": 282,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5380,
              "leg": 847,
              "used": 10451,
              "minimumOnBoard": 38265,
              "plannedOnBoard": 40404
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 42700,
            "mora": 4800,
            "fir": "EGTT",
            "wind": {
              "direction": 262,
              "speed": 80,
              "levels": [
                {
                  "oat": 17,
                  "speed": 21,
                  "altitude": 0,
                  "direction": 226
                },
                {
                  "oat": 11,
                  "speed": 40,
                  "altitude": 5000,
                  "direction": 253
                },
                {
                  "oat": 5,
                  "speed": 57,
                  "altitude": 10000,
                  "direction": 254
                },
                {
                  "oat": -2,
                  "speed": 69,
                  "altitude": 14000,
                  "direction": 255
                },
                {
                  "oat": -10,
                  "speed": 75,
                  "altitude": 18000,
                  "direction": 255
                },
                {
                  "oat": -21,
                  "speed": 74,
                  "altitude": 24000,
                  "direction": 258
                },
                {
                  "oat": -35,
                  "speed": 79,
                  "altitude": 30000,
                  "direction": 264
                },
                {
                  "oat": -47,
                  "speed": 82,
                  "altitude": 34000,
                  "direction": 263
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 260
                },
                {
                  "oat": -61,
                  "speed": 71,
                  "altitude": 45000,
                  "direction": 265
                }
              ]
            }
          },
          {
            "ordinal": 34,
            "ident": "SLANY",
            "latitude": 52.158556,
            "longitude": -5.842131,
            "altitude": 36000,
            "elapsedSeconds": 5604,
            "distanceNm": 25,
            "trackTrue": 288,
            "trackMag": 289,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5332,
              "leg": 329,
              "used": 10780,
              "minimumOnBoard": 37936,
              "plannedOnBoard": 40075
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 42800,
            "mora": 2000,
            "fir": "EGTT",
            "wind": {
              "direction": 260,
              "speed": 78,
              "levels": [
                {
                  "oat": 16,
                  "speed": 26,
                  "altitude": 0,
                  "direction": 233
                },
                {
                  "oat": 11,
                  "speed": 44,
                  "altitude": 5000,
                  "direction": 249
                },
                {
                  "oat": 5,
                  "speed": 61,
                  "altitude": 10000,
                  "direction": 253
                },
                {
                  "oat": -1,
                  "speed": 72,
                  "altitude": 14000,
                  "direction": 254
                },
                {
                  "oat": -9,
                  "speed": 75,
                  "altitude": 18000,
                  "direction": 255
                },
                {
                  "oat": -21,
                  "speed": 79,
                  "altitude": 24000,
                  "direction": 255
                },
                {
                  "oat": -35,
                  "speed": 77,
                  "altitude": 30000,
                  "direction": 262
                },
                {
                  "oat": -47,
                  "speed": 80,
                  "altitude": 34000,
                  "direction": 262
                },
                {
                  "oat": -59,
                  "speed": 77,
                  "altitude": 39000,
                  "direction": 257
                },
                {
                  "oat": -61,
                  "speed": 72,
                  "altitude": 45000,
                  "direction": 263
                }
              ]
            }
          },
          {
            "ordinal": 35,
            "ident": "MALOT",
            "latitude": 53,
            "longitude": -15,
            "altitude": 36000,
            "elapsedSeconds": 8764,
            "distanceNm": 338,
            "trackTrue": 282,
            "trackMag": 283,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 5608,
              "leg": 4922,
              "used": 15702,
              "minimumOnBoard": 33014,
              "plannedOnBoard": 35153
            },
            "oat": -52,
            "isaDeviation": 5,
            "tropopause": 41500,
            "mora": 5100,
            "fir": "EISN",
            "wind": {
              "direction": 254,
              "speed": 103,
              "levels": [
                {
                  "oat": 15,
                  "speed": 28,
                  "altitude": 0,
                  "direction": 260
                },
                {
                  "oat": 4,
                  "speed": 37,
                  "altitude": 5000,
                  "direction": 259
                },
                {
                  "oat": -1,
                  "speed": 47,
                  "altitude": 10000,
                  "direction": 256
                },
                {
                  "oat": -7,
                  "speed": 59,
                  "altitude": 14000,
                  "direction": 255
                },
                {
                  "oat": -14,
                  "speed": 76,
                  "altitude": 18000,
                  "direction": 249
                },
                {
                  "oat": -23,
                  "speed": 110,
                  "altitude": 24000,
                  "direction": 245
                },
                {
                  "oat": -35,
                  "speed": 127,
                  "altitude": 30000,
                  "direction": 249
                },
                {
                  "oat": -47,
                  "speed": 125,
                  "altitude": 34000,
                  "direction": 250
                },
                {
                  "oat": -57,
                  "speed": 121,
                  "altitude": 39000,
                  "direction": 254
                },
                {
                  "oat": -53,
                  "speed": 79,
                  "altitude": 45000,
                  "direction": 253
                }
              ]
            }
          },
          {
            "ordinal": 36,
            "ident": "54N020W",
            "latitude": 54,
            "longitude": -20,
            "altitude": 37000,
            "elapsedSeconds": 10498,
            "distanceNm": 188,
            "trackTrue": 290,
            "trackMag": 295,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 5505,
              "leg": 2685,
              "used": 18387,
              "minimumOnBoard": 30329,
              "plannedOnBoard": 32468
            },
            "oat": -49,
            "isaDeviation": 8,
            "tropopause": 35800,
            "mora": 2000,
            "fir": "EGGX",
            "wind": {
              "direction": 249,
              "speed": 114,
              "levels": [
                {
                  "oat": 13,
                  "speed": 37,
                  "altitude": 0,
                  "direction": 264
                },
                {
                  "oat": 2,
                  "speed": 44,
                  "altitude": 5000,
                  "direction": 271
                },
                {
                  "oat": -5,
                  "speed": 45,
                  "altitude": 10000,
                  "direction": 267
                },
                {
                  "oat": -11,
                  "speed": 45,
                  "altitude": 14000,
                  "direction": 260
                },
                {
                  "oat": -19,
                  "speed": 48,
                  "altitude": 18000,
                  "direction": 256
                },
                {
                  "oat": -32,
                  "speed": 66,
                  "altitude": 24000,
                  "direction": 250
                },
                {
                  "oat": -43,
                  "speed": 93,
                  "altitude": 30000,
                  "direction": 249
                },
                {
                  "oat": -45,
                  "speed": 104,
                  "altitude": 34000,
                  "direction": 249
                },
                {
                  "oat": -46,
                  "speed": 86,
                  "altitude": 39000,
                  "direction": 250
                },
                {
                  "oat": -49,
                  "speed": 63,
                  "altitude": 45000,
                  "direction": 251
                }
              ]
            }
          },
          {
            "ordinal": 37,
            "ident": "5430N03000W",
            "latitude": 54.5,
            "longitude": -30,
            "altitude": 37000,
            "elapsedSeconds": 13536,
            "distanceNm": 352,
            "trackTrue": 278,
            "trackMag": 286,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 5310,
              "leg": 4481,
              "used": 22868,
              "minimumOnBoard": 25848,
              "plannedOnBoard": 27987
            },
            "oat": -46,
            "isaDeviation": 11,
            "tropopause": 31400,
            "mora": 2000,
            "fir": "EGGX",
            "wind": {
              "direction": 255,
              "speed": 70,
              "levels": [
                {
                  "oat": 10,
                  "speed": 29,
                  "altitude": 0,
                  "direction": 288
                },
                {
                  "oat": 1,
                  "speed": 25,
                  "altitude": 5000,
                  "direction": 296
                },
                {
                  "oat": -5,
                  "speed": 31,
                  "altitude": 10000,
                  "direction": 294
                },
                {
                  "oat": -11,
                  "speed": 32,
                  "altitude": 14000,
                  "direction": 294
                },
                {
                  "oat": -20,
                  "speed": 34,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -34,
                  "speed": 37,
                  "altitude": 24000,
                  "direction": 298
                },
                {
                  "oat": -48,
                  "speed": 38,
                  "altitude": 30000,
                  "direction": 298
                },
                {
                  "oat": -53,
                  "speed": 39,
                  "altitude": 34000,
                  "direction": 282
                },
                {
                  "oat": -47,
                  "speed": 49,
                  "altitude": 39000,
                  "direction": 267
                },
                {
                  "oat": -48,
                  "speed": 44,
                  "altitude": 45000,
                  "direction": 261
                }
              ]
            }
          },
          {
            "ordinal": 38,
            "ident": "5330N04000W",
            "latitude": 53.5,
            "longitude": -40,
            "altitude": 37000,
            "elapsedSeconds": 16458,
            "distanceNm": 358,
            "trackTrue": 264,
            "trackMag": 276,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 5131,
              "leg": 4165,
              "used": 27033,
              "minimumOnBoard": 21683,
              "plannedOnBoard": 23822
            },
            "oat": -51,
            "isaDeviation": 6,
            "tropopause": 34100,
            "mora": 2000,
            "fir": "CZQX",
            "wind": {
              "direction": 285,
              "speed": 37,
              "levels": [
                {
                  "oat": 10,
                  "speed": 21,
                  "altitude": 0,
                  "direction": 259
                },
                {
                  "oat": 2,
                  "speed": 24,
                  "altitude": 5000,
                  "direction": 278
                },
                {
                  "oat": -2,
                  "speed": 23,
                  "altitude": 10000,
                  "direction": 285
                },
                {
                  "oat": -9,
                  "speed": 28,
                  "altitude": 14000,
                  "direction": 287
                },
                {
                  "oat": -17,
                  "speed": 31,
                  "altitude": 18000,
                  "direction": 292
                },
                {
                  "oat": -31,
                  "speed": 35,
                  "altitude": 24000,
                  "direction": 294
                },
                {
                  "oat": -45,
                  "speed": 39,
                  "altitude": 30000,
                  "direction": 310
                },
                {
                  "oat": -54,
                  "speed": 50,
                  "altitude": 34000,
                  "direction": 324
                },
                {
                  "oat": -55,
                  "speed": 37,
                  "altitude": 39000,
                  "direction": 306
                },
                {
                  "oat": -52,
                  "speed": 33,
                  "altitude": 45000,
                  "direction": 274
                }
              ]
            }
          },
          {
            "ordinal": 39,
            "ident": "52N050W",
            "latitude": 52,
            "longitude": -50,
            "altitude": 37000,
            "elapsedSeconds": 19372,
            "distanceNm": 374,
            "trackTrue": 260,
            "trackMag": 275,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 4954,
              "leg": 4010,
              "used": 31043,
              "minimumOnBoard": 17673,
              "plannedOnBoard": 19812
            },
            "oat": -57,
            "isaDeviation": 0,
            "tropopause": 39000,
            "mora": 2000,
            "fir": "CZQX",
            "wind": {
              "direction": 338,
              "speed": 34,
              "levels": [
                {
                  "oat": 11,
                  "speed": 20,
                  "altitude": 0,
                  "direction": 243
                },
                {
                  "oat": 6,
                  "speed": 16,
                  "altitude": 5000,
                  "direction": 275
                },
                {
                  "oat": 0,
                  "speed": 15,
                  "altitude": 10000,
                  "direction": 285
                },
                {
                  "oat": -6,
                  "speed": 18,
                  "altitude": 14000,
                  "direction": 289
                },
                {
                  "oat": -15,
                  "speed": 19,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -28,
                  "speed": 15,
                  "altitude": 24000,
                  "direction": 303
                },
                {
                  "oat": -42,
                  "speed": 19,
                  "altitude": 30000,
                  "direction": 326
                },
                {
                  "oat": -51,
                  "speed": 21,
                  "altitude": 34000,
                  "direction": 336
                },
                {
                  "oat": -61,
                  "speed": 15,
                  "altitude": 39000,
                  "direction": 323
                },
                {
                  "oat": -56,
                  "speed": 21,
                  "altitude": 45000,
                  "direction": 289
                }
              ]
            }
          },
          {
            "ordinal": 40,
            "ident": "TUDEP",
            "latitude": 51.166667,
            "longitude": -53.233333,
            "altitude": 37000,
            "elapsedSeconds": 20388,
            "distanceNm": 131,
            "trackTrue": 248,
            "trackMag": 266,
            "viaAirway": "NATE",
            "stage": "CRZ",
            "fuel": {
              "flow": 4877,
              "leg": 1376,
              "used": 32419,
              "minimumOnBoard": 16297,
              "plannedOnBoard": 18436
            },
            "oat": -58,
            "isaDeviation": -1,
            "tropopause": 40500,
            "mora": 2000,
            "fir": "CZQX",
            "wind": {
              "direction": 307,
              "speed": 9,
              "levels": [
                {
                  "oat": 12,
                  "speed": 18,
                  "altitude": 0,
                  "direction": 223
                },
                {
                  "oat": 6,
                  "speed": 11,
                  "altitude": 5000,
                  "direction": 266
                },
                {
                  "oat": 0,
                  "speed": 9,
                  "altitude": 10000,
                  "direction": 270
                },
                {
                  "oat": -5,
                  "speed": 9,
                  "altitude": 14000,
                  "direction": 272
                },
                {
                  "oat": -14,
                  "speed": 11,
                  "altitude": 18000,
                  "direction": 273
                },
                {
                  "oat": -27,
                  "speed": 12,
                  "altitude": 24000,
                  "direction": 279
                },
                {
                  "oat": -42,
                  "speed": 7,
                  "altitude": 30000,
                  "direction": 291
                },
                {
                  "oat": -51,
                  "speed": 3,
                  "altitude": 34000,
                  "direction": 254
                },
                {
                  "oat": -61,
                  "speed": 6,
                  "altitude": 39000,
                  "direction": 252
                },
                {
                  "oat": -56,
                  "speed": 22,
                  "altitude": 45000,
                  "direction": 295
                }
              ]
            }
          },
          {
            "ordinal": 41,
            "ident": "TOPPS",
            "latitude": 45.340181,
            "longitude": -67.738642,
            "altitude": 40000,
            "elapsedSeconds": 25868,
            "distanceNm": 675,
            "trackTrue": 244,
            "trackMag": 262,
            "viaAirway": "N526A",
            "stage": "CRZ",
            "fuel": {
              "flow": 4515,
              "leg": 7005,
              "used": 39424,
              "minimumOnBoard": 9292,
              "plannedOnBoard": 11431
            },
            "oat": -58,
            "isaDeviation": -1,
            "tropopause": 39700,
            "mora": 4900,
            "fir": "KZBW",
            "wind": {
              "direction": 275,
              "speed": 26,
              "levels": [
                {
                  "oat": 15,
                  "speed": 3,
                  "altitude": 0,
                  "direction": 136
                },
                {
                  "oat": 11,
                  "speed": 12,
                  "altitude": 5000,
                  "direction": 205
                },
                {
                  "oat": 4,
                  "speed": 18,
                  "altitude": 10000,
                  "direction": 251
                },
                {
                  "oat": -2,
                  "speed": 22,
                  "altitude": 14000,
                  "direction": 262
                },
                {
                  "oat": -10,
                  "speed": 25,
                  "altitude": 18000,
                  "direction": 269
                },
                {
                  "oat": -23,
                  "speed": 29,
                  "altitude": 24000,
                  "direction": 274
                },
                {
                  "oat": -38,
                  "speed": 30,
                  "altitude": 30000,
                  "direction": 273
                },
                {
                  "oat": -49,
                  "speed": 29,
                  "altitude": 34000,
                  "direction": 283
                },
                {
                  "oat": -56,
                  "speed": 32,
                  "altitude": 39000,
                  "direction": 278
                },
                {
                  "oat": -55,
                  "speed": 40,
                  "altitude": 45000,
                  "direction": 293
                }
              ]
            }
          },
          {
            "ordinal": 42,
            "ident": "ENE",
            "latitude": 43.425672,
            "longitude": -70.613525,
            "altitude": 40000,
            "elapsedSeconds": 27238,
            "distanceNm": 169,
            "trackTrue": 228,
            "trackMag": 244,
            "viaAirway": "DCT",
            "stage": "CRZ",
            "fuel": {
              "flow": 4459,
              "leg": 1697,
              "used": 41121,
              "minimumOnBoard": 7595,
              "plannedOnBoard": 9734
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 39300,
            "mora": 3100,
            "fir": "KZBW",
            "wind": {
              "direction": 292,
              "speed": 46,
              "levels": [
                {
                  "oat": 20,
                  "speed": 4,
                  "altitude": 0,
                  "direction": 77
                },
                {
                  "oat": 14,
                  "speed": 18,
                  "altitude": 5000,
                  "direction": 301
                },
                {
                  "oat": 6,
                  "speed": 23,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": 0,
                  "speed": 31,
                  "altitude": 14000,
                  "direction": 292
                },
                {
                  "oat": -8,
                  "speed": 35,
                  "altitude": 18000,
                  "direction": 292
                },
                {
                  "oat": -22,
                  "speed": 35,
                  "altitude": 24000,
                  "direction": 285
                },
                {
                  "oat": -38,
                  "speed": 43,
                  "altitude": 30000,
                  "direction": 283
                },
                {
                  "oat": -47,
                  "speed": 53,
                  "altitude": 34000,
                  "direction": 295
                },
                {
                  "oat": -54,
                  "speed": 66,
                  "altitude": 39000,
                  "direction": 300
                },
                {
                  "oat": -55,
                  "speed": 58,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 43,
            "ident": "ASPEN",
            "latitude": 42.815986,
            "longitude": -70.911497,
            "altitude": 40000,
            "elapsedSeconds": 27536,
            "distanceNm": 39,
            "trackTrue": 199,
            "trackMag": 214,
            "viaAirway": "PARCH4",
            "stage": "CRZ",
            "fuel": {
              "flow": 4370,
              "leg": 362,
              "used": 41483,
              "minimumOnBoard": 7233,
              "plannedOnBoard": 9372
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 40300,
            "mora": 2500,
            "fir": "KZBW",
            "wind": {
              "direction": 300,
              "speed": 65,
              "levels": [
                {
                  "oat": 20,
                  "speed": 4,
                  "altitude": 0,
                  "direction": 77
                },
                {
                  "oat": 14,
                  "speed": 18,
                  "altitude": 5000,
                  "direction": 302
                },
                {
                  "oat": 6,
                  "speed": 23,
                  "altitude": 10000,
                  "direction": 283
                },
                {
                  "oat": 0,
                  "speed": 31,
                  "altitude": 14000,
                  "direction": 293
                },
                {
                  "oat": -8,
                  "speed": 35,
                  "altitude": 18000,
                  "direction": 292
                },
                {
                  "oat": -22,
                  "speed": 35,
                  "altitude": 24000,
                  "direction": 285
                },
                {
                  "oat": -38,
                  "speed": 43,
                  "altitude": 30000,
                  "direction": 284
                },
                {
                  "oat": -47,
                  "speed": 53,
                  "altitude": 34000,
                  "direction": 296
                },
                {
                  "oat": -54,
                  "speed": 66,
                  "altitude": 39000,
                  "direction": 300
                },
                {
                  "oat": -55,
                  "speed": 59,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 44,
            "ident": "PVD",
            "latitude": 41.724344,
            "longitude": -71.429639,
            "altitude": 40000,
            "elapsedSeconds": 28058,
            "distanceNm": 69,
            "trackTrue": 199,
            "trackMag": 214,
            "viaAirway": "PARCH4",
            "stage": "CRZ",
            "fuel": {
              "flow": 4343,
              "leg": 630,
              "used": 42113,
              "minimumOnBoard": 6603,
              "plannedOnBoard": 8742
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 41100,
            "mora": 2600,
            "fir": "KZBW",
            "wind": {
              "direction": 305,
              "speed": 71,
              "levels": [
                {
                  "oat": 23,
                  "speed": 2,
                  "altitude": 0,
                  "direction": 288
                },
                {
                  "oat": 15,
                  "speed": 21,
                  "altitude": 5000,
                  "direction": 287
                },
                {
                  "oat": 7,
                  "speed": 28,
                  "altitude": 10000,
                  "direction": 295
                },
                {
                  "oat": 0,
                  "speed": 35,
                  "altitude": 14000,
                  "direction": 299
                },
                {
                  "oat": -8,
                  "speed": 36,
                  "altitude": 18000,
                  "direction": 299
                },
                {
                  "oat": -22,
                  "speed": 43,
                  "altitude": 24000,
                  "direction": 298
                },
                {
                  "oat": -37,
                  "speed": 62,
                  "altitude": 30000,
                  "direction": 299
                },
                {
                  "oat": -46,
                  "speed": 81,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -54,
                  "speed": 73,
                  "altitude": 39000,
                  "direction": 306
                },
                {
                  "oat": -56,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 304
                }
              ]
            }
          },
          {
            "ordinal": 45,
            "ident": "TOD",
            "latitude": 41.698783,
            "longitude": -71.458252,
            "altitude": 40000,
            "elapsedSeconds": 28073,
            "distanceNm": 2,
            "trackTrue": 219,
            "trackMag": 234,
            "viaAirway": "PARCH4",
            "stage": "CRZ",
            "fuel": {
              "flow": 4477,
              "leg": 19,
              "used": 42132,
              "minimumOnBoard": 6584,
              "plannedOnBoard": 8723
            },
            "oat": -54,
            "isaDeviation": 3,
            "tropopause": 41100,
            "mora": 2400,
            "fir": "KZBW",
            "wind": {
              "direction": 306,
              "speed": 72,
              "levels": [
                {
                  "oat": 23,
                  "speed": 2,
                  "altitude": 0,
                  "direction": 288
                },
                {
                  "oat": 15,
                  "speed": 21,
                  "altitude": 5000,
                  "direction": 287
                },
                {
                  "oat": 7,
                  "speed": 28,
                  "altitude": 10000,
                  "direction": 295
                },
                {
                  "oat": 0,
                  "speed": 35,
                  "altitude": 14000,
                  "direction": 299
                },
                {
                  "oat": -8,
                  "speed": 36,
                  "altitude": 18000,
                  "direction": 299
                },
                {
                  "oat": -22,
                  "speed": 43,
                  "altitude": 24000,
                  "direction": 299
                },
                {
                  "oat": -37,
                  "speed": 62,
                  "altitude": 30000,
                  "direction": 299
                },
                {
                  "oat": -46,
                  "speed": 81,
                  "altitude": 34000,
                  "direction": 308
                },
                {
                  "oat": -54,
                  "speed": 73,
                  "altitude": 39000,
                  "direction": 306
                },
                {
                  "oat": -56,
                  "speed": 65,
                  "altitude": 45000,
                  "direction": 304
                }
              ]
            }
          },
          {
            "ordinal": 46,
            "ident": "TRAIT",
            "latitude": 41.284653,
            "longitude": -71.917597,
            "altitude": 30200,
            "elapsedSeconds": 28399,
            "distanceNm": 32,
            "trackTrue": 219,
            "trackMag": 235,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2509,
              "leg": 96,
              "used": 42228,
              "minimumOnBoard": 6488,
              "plannedOnBoard": 8627
            },
            "oat": -36,
            "isaDeviation": 9,
            "tropopause": 44300,
            "mora": 2600,
            "fir": "KZBW",
            "wind": {
              "direction": 304,
              "speed": 75,
              "levels": [
                {
                  "oat": 23,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 238
                },
                {
                  "oat": 17,
                  "speed": 22,
                  "altitude": 5000,
                  "direction": 293
                },
                {
                  "oat": 8,
                  "speed": 37,
                  "altitude": 10000,
                  "direction": 310
                },
                {
                  "oat": 1,
                  "speed": 40,
                  "altitude": 14000,
                  "direction": 304
                },
                {
                  "oat": -8,
                  "speed": 37,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -21,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 304
                },
                {
                  "oat": -35,
                  "speed": 75,
                  "altitude": 30000,
                  "direction": 304
                },
                {
                  "oat": -44,
                  "speed": 89,
                  "altitude": 34000,
                  "direction": 305
                },
                {
                  "oat": -54,
                  "speed": 81,
                  "altitude": 39000,
                  "direction": 297
                },
                {
                  "oat": -58,
                  "speed": 74,
                  "altitude": 45000,
                  "direction": 307
                }
              ]
            }
          },
          {
            "ordinal": 47,
            "ident": "PARCH",
            "latitude": 41.099228,
            "longitude": -72.120739,
            "altitude": 25800,
            "elapsedSeconds": 28542,
            "distanceNm": 14,
            "trackTrue": 219,
            "trackMag": 233,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2607,
              "leg": 42,
              "used": 42270,
              "minimumOnBoard": 6446,
              "plannedOnBoard": 8585
            },
            "oat": -25,
            "isaDeviation": 12,
            "tropopause": 44100,
            "mora": 2100,
            "fir": "KZBW",
            "wind": {
              "direction": 303,
              "speed": 61,
              "levels": [
                {
                  "oat": 23,
                  "speed": 15,
                  "altitude": 0,
                  "direction": 238
                },
                {
                  "oat": 17,
                  "speed": 22,
                  "altitude": 5000,
                  "direction": 293
                },
                {
                  "oat": 8,
                  "speed": 37,
                  "altitude": 10000,
                  "direction": 310
                },
                {
                  "oat": 1,
                  "speed": 40,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -8,
                  "speed": 37,
                  "altitude": 18000,
                  "direction": 301
                },
                {
                  "oat": -21,
                  "speed": 57,
                  "altitude": 24000,
                  "direction": 304
                },
                {
                  "oat": -35,
                  "speed": 75,
                  "altitude": 30000,
                  "direction": 304
                },
                {
                  "oat": -44,
                  "speed": 89,
                  "altitude": 34000,
                  "direction": 305
                },
                {
                  "oat": -54,
                  "speed": 81,
                  "altitude": 39000,
                  "direction": 297
                },
                {
                  "oat": -58,
                  "speed": 74,
                  "altitude": 45000,
                  "direction": 307
                }
              ]
            }
          },
          {
            "ordinal": 48,
            "ident": "CCC",
            "latitude": 40.929619,
            "longitude": -72.798858,
            "altitude": 16000,
            "elapsedSeconds": 28868,
            "distanceNm": 32,
            "trackTrue": 251,
            "trackMag": 265,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2685,
              "leg": 96,
              "used": 42366,
              "minimumOnBoard": 6350,
              "plannedOnBoard": 8489
            },
            "oat": -2,
            "isaDeviation": 15,
            "tropopause": 43800,
            "mora": 2300,
            "fir": "KZBW",
            "wind": {
              "direction": 304,
              "speed": 36,
              "levels": [
                {
                  "oat": 26,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 205
                },
                {
                  "oat": 17,
                  "speed": 20,
                  "altitude": 5000,
                  "direction": 285
                },
                {
                  "oat": 9,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 311
                },
                {
                  "oat": 1,
                  "speed": 36,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -7,
                  "speed": 38,
                  "altitude": 18000,
                  "direction": 305
                },
                {
                  "oat": -20,
                  "speed": 61,
                  "altitude": 24000,
                  "direction": 296
                },
                {
                  "oat": -35,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 293
                },
                {
                  "oat": -44,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 302
                },
                {
                  "oat": -55,
                  "speed": 72,
                  "altitude": 39000,
                  "direction": 293
                },
                {
                  "oat": -58,
                  "speed": 76,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 49,
            "ident": "ROBER",
            "latitude": 40.685464,
            "longitude": -73.032611,
            "altitude": 10500,
            "elapsedSeconds": 29051,
            "distanceNm": 18,
            "trackTrue": 216,
            "trackMag": 229,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2689,
              "leg": 54,
              "used": 42420,
              "minimumOnBoard": 6296,
              "plannedOnBoard": 8435
            },
            "oat": 8,
            "isaDeviation": 14,
            "tropopause": 43700,
            "mora": 2300,
            "fir": "KZBW",
            "wind": {
              "direction": 311,
              "speed": 34,
              "levels": [
                {
                  "oat": 26,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 205
                },
                {
                  "oat": 17,
                  "speed": 19,
                  "altitude": 5000,
                  "direction": 285
                },
                {
                  "oat": 9,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 311
                },
                {
                  "oat": 1,
                  "speed": 36,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -7,
                  "speed": 38,
                  "altitude": 18000,
                  "direction": 305
                },
                {
                  "oat": -20,
                  "speed": 61,
                  "altitude": 24000,
                  "direction": 296
                },
                {
                  "oat": -34,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 293
                },
                {
                  "oat": -44,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 302
                },
                {
                  "oat": -55,
                  "speed": 72,
                  "altitude": 39000,
                  "direction": 293
                },
                {
                  "oat": -58,
                  "speed": 76,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 50,
            "ident": "CRAIL",
            "latitude": 40.686967,
            "longitude": -73.343411,
            "altitude": 6200,
            "elapsedSeconds": 29194,
            "distanceNm": 14,
            "trackTrue": 270,
            "trackMag": 283,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2680,
              "leg": 42,
              "used": 42462,
              "minimumOnBoard": 6254,
              "plannedOnBoard": 8393
            },
            "oat": 15,
            "isaDeviation": 12,
            "tropopause": 43700,
            "mora": 2200,
            "fir": "KZBW",
            "wind": {
              "direction": 297,
              "speed": 25,
              "levels": [
                {
                  "oat": 26,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 204
                },
                {
                  "oat": 17,
                  "speed": 19,
                  "altitude": 5000,
                  "direction": 285
                },
                {
                  "oat": 9,
                  "speed": 34,
                  "altitude": 10000,
                  "direction": 311
                },
                {
                  "oat": 1,
                  "speed": 36,
                  "altitude": 14000,
                  "direction": 305
                },
                {
                  "oat": -7,
                  "speed": 38,
                  "altitude": 18000,
                  "direction": 305
                },
                {
                  "oat": -20,
                  "speed": 61,
                  "altitude": 24000,
                  "direction": 296
                },
                {
                  "oat": -34,
                  "speed": 71,
                  "altitude": 30000,
                  "direction": 293
                },
                {
                  "oat": -44,
                  "speed": 78,
                  "altitude": 34000,
                  "direction": 302
                },
                {
                  "oat": -55,
                  "speed": 72,
                  "altitude": 39000,
                  "direction": 293
                },
                {
                  "oat": -58,
                  "speed": 76,
                  "altitude": 45000,
                  "direction": 302
                }
              ]
            }
          },
          {
            "ordinal": 51,
            "ident": "KJFK",
            "latitude": 40.639928,
            "longitude": -73.778692,
            "altitude": 2500,
            "elapsedSeconds": 29678,
            "distanceNm": 27,
            "trackTrue": 262,
            "trackMag": 275,
            "viaAirway": "PARCH4",
            "stage": "DSC",
            "fuel": {
              "flow": 2689,
              "leg": 308,
              "used": 42770,
              "minimumOnBoard": 5946,
              "plannedOnBoard": 8085
            },
            "oat": 23,
            "isaDeviation": 13,
            "tropopause": 45600,
            "mora": 2200,
            "fir": "KZNY",
            "wind": {
              "direction": 287,
              "speed": 8,
              "levels": [
                {
                  "oat": 25,
                  "speed": 7,
                  "altitude": 0,
                  "direction": 262
                },
                {
                  "oat": 19,
                  "speed": 18,
                  "altitude": 5000,
                  "direction": 297
                },
                {
                  "oat": 9,
                  "speed": 30,
                  "altitude": 10000,
                  "direction": 301
                },
                {
                  "oat": 0,
                  "speed": 38,
                  "altitude": 14000,
                  "direction": 304
                },
                {
                  "oat": -8,
                  "speed": 41,
                  "altitude": 18000,
                  "direction": 306
                },
                {
                  "oat": -20,
                  "speed": 54,
                  "altitude": 24000,
                  "direction": 300
                },
                {
                  "oat": -33,
                  "speed": 68,
                  "altitude": 30000,
                  "direction": 301
                },
                {
                  "oat": -43,
                  "speed": 73,
                  "altitude": 34000,
                  "direction": 290
                },
                {
                  "oat": -54,
                  "speed": 71,
                  "altitude": 39000,
                  "direction": 284
                },
                {
                  "oat": -61,
                  "speed": 74,
                  "altitude": 45000,
                  "direction": 293
                }
              ]
            }
          }
        ]
      }
      """

  Scenario: As anyone a flight created without a plan reports no planned route
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/route"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "route": null,
        "atcRoute": null,
        "fixes": []
      }
      """

  Scenario: As anyone I cannot read the route of a flight that does not exist
    When I send a "GET" request to "/api/v1/flight/11111111-1111-4111-8111-111111111111/route"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As anyone I cannot read the route of a malformed flight identifier
    When I send a "GET" request to "/api/v1/flight/not-a-flight/route"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
