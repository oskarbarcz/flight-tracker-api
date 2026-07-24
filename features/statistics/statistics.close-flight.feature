Feature: Closing a flight keeps statistics consistent

  Closing a flight re-derives the pilot's statistics from source. Because the
  sector was already accrued when it reported on-block, closing it must leave the
  totals unchanged rather than counting it twice.

  Scenario: Closing an already-completed flight does not double-count it
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close" with body:
      """json
      {
        "actualFuelBurned": 10.2
      }
      """
    Then the response status should be 204
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
