Feature: Get airframe by type

  Scenario: As an admin I can get one airframe
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airframe/B77W"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "B77W",
        "iataType": "77W",
        "name": "Boeing 777-300ER",
        "cruiseSpeed": { "value": 0.84, "unit": "mach" },
        "serviceCeiling": 43000,
        "performanceCode": "D",
        "weightCategory": "heavy",
        "serviceType": "passenger"
      }
      """

  Scenario: As operations I can get one airframe
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airframe/A339"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "A339",
        "iataType": "339",
        "name": "Airbus A330-900",
        "cruiseSpeed": { "value": 0.8, "unit": "mach" },
        "serviceCeiling": 41400,
        "performanceCode": "D",
        "weightCategory": "heavy",
        "serviceType": "passenger"
      }
      """

  Scenario: As cabin crew I can get one airframe
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airframe/A319"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "A319",
        "iataType": "319",
        "name": "Airbus A319-100",
        "cruiseSpeed": { "value": 0.78, "unit": "mach" },
        "serviceCeiling": 39000,
        "performanceCode": "C",
        "weightCategory": "medium",
        "serviceType": "passenger"
      }
      """

  Scenario: As operations I can get a freighter airframe
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airframe/B77F"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "B77F",
        "iataType": "77F",
        "name": "Boeing 777-F",
        "cruiseSpeed": { "value": 0.84, "unit": "mach" },
        "serviceCeiling": 43000,
        "performanceCode": "D",
        "weightCategory": "heavy",
        "serviceType": "cargo"
      }
      """

  Scenario: As operations I can get an airframe serving both roles
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airframe/C208"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "type": "C208",
        "iataType": "CN1",
        "name": "Cessna 208B",
        "cruiseSpeed": { "value": 150, "unit": "knots" },
        "serviceCeiling": 20000,
        "performanceCode": "B",
        "weightCategory": "light",
        "serviceType": "both"
      }
      """

  Scenario: Get airframe with unknown type returns 404
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airframe/ZZZZ"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airframe with given type not found."
      }
      """

  Scenario: As an unauthorized user I cannot get an airframe
    When I send a "GET" request to "/api/v1/airframe/B77W"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
