Feature: Create terminal

  Scenario: As an admin I cannot create terminal
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal" with body:
      """json
      {
        "shortName": "T3",
        "fullName": "Terminal 3",
        "averageTaxiTime": 10,
        "operatorCodes": ["KLM"]
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can create terminal
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal" with body:
      """json
      {
        "shortName": "T3",
        "fullName": "Terminal 3",
        "averageTaxiTime": 10,
        "operatorCodes": ["KLM"]
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "shortName": "T3",
        "fullName": "Terminal 3",
        "averageTaxiTime": 10,
        "operatorCodes": ["KLM"]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot create terminal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal" with body:
      """json
      {
        "shortName": "T3",
        "fullName": "Terminal 3",
        "averageTaxiTime": 10,
        "operatorCodes": ["KLM"]
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot create terminal at non-existing airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/terminal" with body:
      """json
      {
        "shortName": "T3",
        "fullName": "Terminal 3",
        "averageTaxiTime": 10,
        "operatorCodes": ["KLM"]
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot create terminal with incorrect data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal" with body:
      """json
      {
        "shortName": "",
        "averageTaxiTime": -5
      }
      """
    Then the response status should be 400
    And the response body should have the property "violations"

  Scenario: As an unauthorized user I cannot create terminal
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal" with body:
      """json
      {
        "shortName": "T3",
        "fullName": "Terminal 3",
        "averageTaxiTime": 10,
        "operatorCodes": ["KLM"]
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
