Feature: Get airport weather

  Scenario: As an admin I can read the weather of a watched airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": true
      }
      """

  Scenario: As operations I can read the weather of a watched airport
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": true
      }
      """

  Scenario: As a cabin crew I can read the weather of a watched airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": true
      }
      """

  Scenario: As an unauthorized user I can read the weather of a watched airport
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": true
      }
      """

  Scenario: A retained report of an unwatched airport is still readable
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EDDF 081200Z 24008KT 9999 FEW035 22/12 Q1018 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EDDF 081100Z 0812/0918 24010KT 9999 FEW035 BECMG 0815/0817 27012KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": false
      }
      """

  Scenario: There is no weather record for the airport
    When I send a "GET" request to "/api/v1/airport/523b2d2f-9b60-405a-bd5a-90eed1b58e9a/weather"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Weather for given airport does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: The airport id is not a valid uuid
    When I send a "GET" request to "/api/v1/airport/incorrect-uuid/weather"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: Checking in a pilot marks every airport of the flight as watched
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/airport/c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "KBOS 081154Z 21009KT 10SM FEW040 24/16 A3000",
        "metarLastUpdate": "@date('within 1 minute from now')",
        "taf": "TAF KBOS 081120Z 0812/0918 21010KT P6SM FEW040",
        "tafLastUpdate": "@date('within 1 minute from now')",
        "watch": true
      }
      """
    When I send a "GET" request to "/api/v1/airport/e764251b-bb25-4e8b-8cc7-11b0397b4554/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "KPHL 081154Z 20008KT 10SM SCT045 26/17 A2999",
        "metarLastUpdate": "@date('within 1 minute from now')",
        "taf": "TAF KPHL 081120Z 0812/0918 20010KT P6SM SCT045",
        "tafLastUpdate": "@date('within 1 minute from now')",
        "watch": true
      }
      """
    When I send a "GET" request to "/api/v1/airport/3c721cc6-c653-4fad-be43-dc9d6a149383/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "KJFK 081151Z 18010KT 10SM FEW050 27/18 A2998 RMK AO2",
        "metarLastUpdate": "@date('within 1 minute from now')",
        "taf": "TAF KJFK 081120Z 0812/0918 18012KT P6SM FEW050 FM090000 21008KT P6SM SCT060",
        "tafLastUpdate": "@date('within 1 minute from now')",
        "watch": true
      }
      """
    And I set database to initial state

  Scenario: Reporting on-block stops watching the flight's airports
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": true
      }
      """
    When I send a "POST" request to "/api/v1/flight/eaa29705-1c4b-47a8-b93f-5789df4cd3ef/report-on-block"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/weather"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "metar": "EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG",
        "metarLastUpdate": "2026-07-08T12:00:00.000Z",
        "taf": "TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT",
        "tafLastUpdate": "2026-07-08T11:00:00.000Z",
        "watch": false
      }
      """
    And I set database to initial state
