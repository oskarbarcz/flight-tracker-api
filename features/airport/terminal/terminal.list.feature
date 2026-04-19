Feature: List terminals at an airport

  Scenario: As an admin I can list terminals at an airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "shortName": "T1",
          "fullName": "Terminal 1",
          "averageTaxiTime": 12,
          "operatorCodes": ["DLH", "LOT"]
        },
        {
          "id": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "shortName": "T2",
          "fullName": "Terminal 2",
          "averageTaxiTime": 14,
          "operatorCodes": ["BAW", "AFR"]
        }
      ]
      """

  Scenario: As operations I can list terminals
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal"
    Then the response status should be 200

  Scenario: As a cabin crew I can list terminals
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal"
    Then the response status should be 200

  Scenario: As a cabin crew I cannot list terminals of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/terminal"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot list terminals
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
