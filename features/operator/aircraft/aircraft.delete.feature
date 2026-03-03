Feature: Delete aircraft

  Scenario: As an admin I cannot delete aircraft
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can delete aircraft
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 204
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
        "icaoCode": "CDG",
        "iataCode": "DE",
        "shortName": "Condor",
        "fullName": "Condor Flugdienst",
        "callsign": "CONDOR",
        "type": "low_cost",
        "hubs": ["BER", "DUS", "FRA", "HAM", "MUC", "STR", "ZRH"],
        "fleetSize": 1,
        "fleetTypes": ["A321"],
        "avgFleetAge": 9.2,
        "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/condor.png",
        "backgroundUrl": null,
        "continent": "europe"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot delete aircraft
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot delete aircraft that is already in use
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft/9f5da1a4-f09e-4961-8299-82d688337d1f"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "message": "Aircraft is related to other resources and cannot be removed.",
        "error": "Conflict",
        "statusCode": 409
      }
      """

  Scenario: As operations I cannot delete aircraft that does not exist
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/b0e25839-e8e7-4d92-b6fd-bfca99263d83"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Aircraft with given ID not found.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete aircraft with incorrect ID
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations I cannot delete aircraft for operator with incorrect ID
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/incorrect-uuid/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot delete aircraft
    When I send a "DELETE" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/3f34bc59-c9c3-4ad0-88fa-2cc570298602"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
