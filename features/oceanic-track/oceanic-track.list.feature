Feature: Read the oceanic tracks published now

  Scenario: As anyone I can read today's Pacific tracks with every fix placed
    When I send a "GET" request to "/api/v1/oceanic-track"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "fetchedAt": "2026-11-03T22:02:47.722Z",
        "tracks": [
          {
            "system": "pacots",
            "identifier": "A",
            "direction": "west",
            "issuingAuthority": "KZAK",
            "notamNumber": "A5313/26",
            "validFrom": "2026-11-03T19:00:00.000Z",
            "validTo": "2026-11-04T08:00:00.000Z",
            "route": "PUPPI CRESP 23N170W 25N180E 27N170E 28N160E 31N150E TONIK",
            "levels": [],
            "fixes": [
              {
                "ident": "PUPPI",
                "latitude": 21.921383,
                "longitude": -161.679633
              },
              {
                "ident": "CRESP",
                "latitude": 22.205556,
                "longitude": -163.914444
              },
              {
                "ident": "23N170W",
                "latitude": 23,
                "longitude": -170
              },
              {
                "ident": "25N180E",
                "latitude": 25,
                "longitude": 180
              },
              {
                "ident": "27N170E",
                "latitude": 27,
                "longitude": 170
              },
              {
                "ident": "28N160E",
                "latitude": 28,
                "longitude": 160
              },
              {
                "ident": "31N150E",
                "latitude": 31,
                "longitude": 150
              },
              {
                "ident": "TONIK",
                "latitude": 32.003806,
                "longitude": 145.996414
              }
            ],
            "unresolvedFixes": [],
            "remarks": "TRK B NOT AVAILABLE",
            "message": "(TDM TRK A 261103190001 2611031900 2611040800 PUPPI CRESP 23N170W 25N180E 27N170E 28N160E 31N150E TONIK RTS/PHNL KEOLA PUPPI TONIK G223 BEGAD RMK/TRK B NOT AVAILABLE )"
          },
          {
            "system": "pacots",
            "identifier": "C",
            "direction": "west",
            "issuingAuthority": "KZAK",
            "notamNumber": "A5314/26",
            "validFrom": "2026-11-03T19:00:00.000Z",
            "validTo": "2026-11-04T08:00:00.000Z",
            "route": "KATCH HMPTN GRIZZ CJAYY 58N160W 58N170W ECOMI NATES NIKLL NYMPH NUZAN NRKEY NIPPI",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": null,
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "E",
            "direction": "west",
            "issuingAuthority": "KZAK",
            "notamNumber": "A5310/26",
            "validFrom": "2026-11-03T19:00:00.000Z",
            "validTo": "2026-11-04T08:00:00.000Z",
            "route": "BOXER FULMR FASEL 52N140W 55N150W 56N160W 56N170W ALDOZ AMOND SYA AAMYY ASPIN AKISU AGEDI ADGOR",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": null,
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "F",
            "direction": "west",
            "issuingAuthority": "KZAK",
            "notamNumber": "A5311/26",
            "validFrom": "2026-11-03T19:00:00.000Z",
            "validTo": "2026-11-04T08:00:00.000Z",
            "route": "ALCOA ALLBE ADTIL 35N140W 33N150W 31N160W 30N170W 30N180E 30N170E 31N160E 33N150E MORAY",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": null,
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "H",
            "direction": "west",
            "issuingAuthority": "KZAK",
            "notamNumber": "A5312/26",
            "validFrom": "2026-11-03T19:00:00.000Z",
            "validTo": "2026-11-04T08:00:00.000Z",
            "route": "BAART BARAZ BILLO 30N150W 29N160W 28N170W 27N180E 26N170E 25N160E 24N150E 23N140E TUNTO",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": "TRK H ONLY AVAILABLE TO ACFT LANDING RCTP OR SOUTH",
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "J",
            "direction": "west",
            "issuingAuthority": "KZAK",
            "notamNumber": "A5318/26",
            "validFrom": "2026-11-04T05:00:00.000Z",
            "validTo": "2026-11-04T21:00:00.000Z",
            "route": "REDWD VESPA 43N130W 51N140W 55N150W 57N160W OGGOE NULUK NANDY NATES NIKLL NYMPH NUZAN NIPPI",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": null,
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "1",
            "direction": "east",
            "issuingAuthority": "RJJJ",
            "notamNumber": "Q2634/26",
            "validFrom": "2026-11-04T07:00:00.000Z",
            "validTo": "2026-11-04T21:00:00.000Z",
            "route": "ADGOR AGEDI AKISU ASPIN LYYLE 50N180E 51N170W 51N160W 50N150W 49N140W ROUKE",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": "ACFT LDG CYVR--50N150W 50N140W PRETY GOVAD CYVR\nACFT LDG OTHER DEST--ROUKE DOLFF TOU UPR TO DEST",
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "2",
            "direction": "east",
            "issuingAuthority": "RJJJ",
            "notamNumber": "Q2634/26",
            "validFrom": "2026-11-04T07:00:00.000Z",
            "validTo": "2026-11-04T21:00:00.000Z",
            "route": "KALNA 41N160E 43N170E 45N180E 46N170W 46N160W 45N150W 43N140W 41N130W TRYSH",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": null,
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "3",
            "direction": "east",
            "issuingAuthority": "RJJJ",
            "notamNumber": "Q2634/26",
            "validFrom": "2026-11-04T07:00:00.000Z",
            "validTo": "2026-11-04T21:00:00.000Z",
            "route": "EMRON 40N160E 42N170E 44N180E 45N170W 45N160W 44N150W 42N140W 39N130W DACEM",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": "ATM CENTER TEL:81-92-608-8870",
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "11",
            "direction": "east",
            "issuingAuthority": "RJJJ",
            "notamNumber": "Q2635/26",
            "validFrom": "2026-11-04T10:00:00.000Z",
            "validTo": "2026-11-04T21:00:00.000Z",
            "route": "LEPKI 38N160E 38N170E 36N180E 32N170W THOMA",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": "TRK 12 NOT AVAILABLE\nATM CENTER TEL:81-92-608-8870",
            "message": "@any"
          },
          {
            "system": "pacots",
            "identifier": "14",
            "direction": "east",
            "issuingAuthority": "RJJJ",
            "notamNumber": "Q2636/26",
            "validFrom": "2026-11-04T07:00:00.000Z",
            "validTo": "2026-11-04T21:00:00.000Z",
            "route": "EMRON 39N160E 41N170E 43N180E 44N170W 44N160W 43N150W 41N140W 38N130W ALLBE",
            "levels": [],
            "fixes": "@any",
            "unresolvedFixes": [],
            "remarks": "TRK 15 NOT AVAILABLE\nATM CENTER TEL:81-92-608-8870",
            "message": "@any"
          }
        ]
      }
      """

  Scenario: As cabin crew I read the same tracks as anyone else
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/oceanic-track"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "fetchedAt": "2026-11-03T22:02:47.722Z",
        "tracks": "@any"
      }
      """
