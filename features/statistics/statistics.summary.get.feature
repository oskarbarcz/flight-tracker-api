Feature: Get lifetime statistics summary

  Scenario: As a cabin crew I see my lifetime statistics summary
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/stats/summary"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "totals": {
          "distanceNm": 8310,
          "airborneMinutes": 2095,
          "blockMinutes": 2391,
          "flights": 9,
          "cycles": 9,
          "fuelBurned": 331600
        },
        "records": {
          "longestFlightDistanceNm": 3350,
          "longestFlightMinutes": 510,
          "firstFlightAt": "2025-01-01T16:18:00.000Z",
          "lastFlightAt": "2025-01-03T11:45:00.000Z"
        },
        "mostFlownAircraftType": "B77W",
        "mostFlownAirline": {
          "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/american_airlines.png"
        },
        "geography": {
          "airports": 7,
          "countries": 4,
          "continents": 2,
          "mostVisitedAirport": {
            "airportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "name": "New York JFK",
            "city": "New York",
            "country": "United States of America",
            "visits": 9
          }
        }
      }
      """

  Scenario: As an admin with no flights my summary is empty
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/stats/summary"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "totals": {
          "distanceNm": 0,
          "airborneMinutes": 0,
          "blockMinutes": 0,
          "flights": 0,
          "cycles": 0,
          "fuelBurned": 0
        },
        "records": {
          "longestFlightDistanceNm": 0,
          "longestFlightMinutes": 0,
          "firstFlightAt": null,
          "lastFlightAt": null
        },
        "mostFlownAircraftType": null,
        "mostFlownAirline": null,
        "geography": {
          "airports": 0,
          "countries": 0,
          "continents": 0,
          "mostVisitedAirport": null
        }
      }
      """

  Scenario: As an unauthorized user I cannot get the statistics summary
    When I send a "GET" request to "/api/v1/user/me/stats/summary"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
