Feature: List runways at an airport

  Scenario: As an admin I can list runways at an airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
        },
        {
          "id": "caeefbc3-d620-4af1-b5c7-175485a56db1",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "15",
          "length": 3690,
          "width": 60,
          "displace": null,
          "trueHeading": 151,
          "magneticHeading": 147,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        },
        {
          "id": "338cccf0-431c-44c5-99bf-ae1c8a8b372a",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "29",
          "length": 2800,
          "width": 50,
          "displace": null,
          "trueHeading": 291,
          "magneticHeading": 287,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        },
        {
          "id": "fbf2e4f1-acc0-4084-8da7-6587fc0809f4",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "33",
          "length": 3690,
          "width": 60,
          "displace": null,
          "trueHeading": 331,
          "magneticHeading": 327,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        }
      ]
      """

  Scenario: As operations I can list runways
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
        },
        {
          "id": "caeefbc3-d620-4af1-b5c7-175485a56db1",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "15",
          "length": 3690,
          "width": 60,
          "displace": null,
          "trueHeading": 151,
          "magneticHeading": 147,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        },
        {
          "id": "338cccf0-431c-44c5-99bf-ae1c8a8b372a",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "29",
          "length": 2800,
          "width": 50,
          "displace": null,
          "trueHeading": 291,
          "magneticHeading": 287,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        },
        {
          "id": "fbf2e4f1-acc0-4084-8da7-6587fc0809f4",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "33",
          "length": 3690,
          "width": 60,
          "displace": null,
          "trueHeading": 331,
          "magneticHeading": 327,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        }
      ]
      """

  Scenario: As a cabin crew I can list runways
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
        },
        {
          "id": "caeefbc3-d620-4af1-b5c7-175485a56db1",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "15",
          "length": 3690,
          "width": 60,
          "displace": null,
          "trueHeading": 151,
          "magneticHeading": 147,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        },
        {
          "id": "338cccf0-431c-44c5-99bf-ae1c8a8b372a",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "29",
          "length": 2800,
          "width": 50,
          "displace": null,
          "trueHeading": 291,
          "magneticHeading": 287,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        },
        {
          "id": "fbf2e4f1-acc0-4084-8da7-6587fc0809f4",
          "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "designator": "33",
          "length": 3690,
          "width": 60,
          "displace": null,
          "trueHeading": 331,
          "magneticHeading": 327,
          "elevation": 110,
          "surfaceType": "asphalt",
          "lightingType": "HIRL"
        }
      ]
      """

  Scenario: As a cabin crew I cannot list runways of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/runway"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot list runways
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
