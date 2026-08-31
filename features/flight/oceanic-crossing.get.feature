Feature: Read the oceanic tracks a flight was planned against

  Scenario: As anyone I can read the tracks a flight was planned against, both directions as published
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/oceanic-crossing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
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
            "levels": [320, 330, 340, 350],
            "validFrom": "2025-01-05T23:00:00.000Z",
            "validTo": "2025-01-06T06:30:00.000Z",
            "fixes": [
              { "ident": "RESNO", "latitude": 55, "longitude": -15 },
              { "ident": "DOGAL", "latitude": 54.5, "longitude": -50 }
            ]
          },
          {
            "identifier": "A",
            "direction": "west",
            "tmi": "241",
            "issuingOca": "EGGX",
            "route": "MALOT 5620N 5730N 5740N 5650N JANJO",
            "levels": [340, 350, 360, 370, 380, 390, 400],
            "validFrom": "2025-01-05T11:00:00.000Z",
            "validTo": "2025-01-05T18:30:00.000Z",
            "fixes": [
              { "ident": "MALOT", "latitude": 54, "longitude": -15 },
              { "ident": "5620N", "latitude": 56, "longitude": -20 },
              { "ident": "JANJO", "latitude": 55.5, "longitude": -53 }
            ]
          }
        ]
      }
      """

  Scenario: As anyone each direction reports its own validity period
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/oceanic-crossing"
    Then the response status should be 200
    And the response body list "tracks" should have distinct "identifier" values
    And every entry of the response body list "tracks" should have a "validFrom"
    And every entry of the response body list "tracks" should have a "validTo"
    And every "direction" of the response body list "tracks" should be one of "east,west"

  Scenario: As anyone the track the flight is on is named and its routing distinguishes clearance from geometry
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/oceanic-crossing"
    Then the response status should be 200
    And the response body property "routing" should contain:
      """json
      "track"
      """
    And the response body property "trackId" should contain:
      """json
      "A"
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

  Scenario: As anyone I cannot read the tracks of a flight that does not exist
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
