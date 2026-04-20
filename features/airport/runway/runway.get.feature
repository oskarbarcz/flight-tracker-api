Feature: Get runway

  Scenario: As an admin I can get one runway
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "0aaaf26f-29df-45d3-8330-f85f9838de2f",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "designator": "11",
        "length": 2800,
        "width": 50,
        "displace": null,
        "trueHeading": 111,
        "magneticHeading": 107,
        "elevation": 110,
        "surfaceType": "asphalt",
        "lightingType": "HIRL"
      }
      """

  Scenario: As operations I can get one runway
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "0aaaf26f-29df-45d3-8330-f85f9838de2f",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "designator": "11",
        "length": 2800,
        "width": 50,
        "displace": null,
        "trueHeading": 111,
        "magneticHeading": 107,
        "elevation": 110,
        "surfaceType": "asphalt",
        "lightingType": "HIRL"
      }
      """

  Scenario: As a cabin crew I can get one runway
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "0aaaf26f-29df-45d3-8330-f85f9838de2f",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "designator": "11",
        "length": 2800,
        "width": 50,
        "displace": null,
        "trueHeading": 111,
        "magneticHeading": 107,
        "elevation": 110,
        "surfaceType": "asphalt",
        "lightingType": "HIRL"
      }
      """

  Scenario: As a cabin crew I cannot get runway that does not belong to airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Runway with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get runway of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get runway with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot get one runway
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
