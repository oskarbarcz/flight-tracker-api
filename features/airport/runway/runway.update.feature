Feature: Update runway

  Scenario: As an admin I cannot update runway
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f" with body:
      """json
      { "displace": 150 }
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

  Scenario: As operations I can update runway
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f" with body:
      """json
      {
        "length": 2900,
        "displace": 150,
        "surfaceType": "concrete",
        "lightingType": "ALS"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "0aaaf26f-29df-45d3-8330-f85f9838de2f",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "designator": "11",
        "length": 2900,
        "width": 50,
        "displace": 150,
        "trueHeading": 111,
        "magneticHeading": 107,
        "elevation": 110,
        "surfaceType": "concrete",
        "lightingType": "ALS"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update runway
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f" with body:
      """json
      { "displace": 150 }
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

  Scenario: As operations I cannot update runway that does not belong to airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f" with body:
      """json
      { "displace": 150 }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Runway with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update runway with invalid surface type
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f" with body:
      """json
      { "surfaceType": "ice" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "surfaceType": [
            "surfaceType must be one of the following values: asphalt, concrete, grass, gravel, unknown"
          ]
        }
      }
      """

  Scenario: As an unauthorized user I cannot update runway
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f" with body:
      """json
      { "displace": 150 }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
