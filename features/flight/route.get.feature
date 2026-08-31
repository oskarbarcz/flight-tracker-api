Feature: Read the planned route of a flight

  Scenario: As anyone I can read the route a flight is planned to fly, airport to airport
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route"
    Then the response status should be 200
    And the response body property "route" should contain:
      """json
      "TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY UN546 LAPEX NATA JANJO DCT HOIST"
      """
    And the response body property "fixes.0" should contain:
      """json
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
      }
      """
    And the response body property "fixes.6" should contain:
      """json
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
      """

  Scenario: As anyone every point of the route is positioned, so it can be drawn without a gap
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route"
    Then the response status should be 200
    And every entry of the response body list "fixes" should have a "latitude"
    And every entry of the response body list "fixes" should have a "longitude"
    And every entry of the response body list "fixes" should have a "ident"
    And the response body list "fixes" should have distinct "ordinal" values

  Scenario: As anyone the planned altitude of every point is reported, so the vertical profile is drawable
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route"
    Then the response status should be 200
    And every entry of the response body list "fixes" should have a "altitude"
    And the response body property "fixes.2" should contain:
      """json
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
      }
      """
    And the response body property "fixes.5" should contain:
      """json
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
      }
      """

  Scenario: As anyone the segment flown on an oceanic track names the track as its airway
    When I send a "GET" request to "/api/v1/flight/6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56/route"
    Then the response status should be 200
    And the only entry of the response body list "fixes" with "viaAirway" set to "NATA" should contain:
      """json
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
      }
      """

  Scenario: As anyone a flight created without a plan reports no planned route
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/route"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "route": null,
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
