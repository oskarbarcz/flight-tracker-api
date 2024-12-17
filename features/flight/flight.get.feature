Feature: Create flight resource
  Scenario: Create a flight
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/" with body:
    """json
    {
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
      "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
      "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
      "timesheet": {
        "scheduled": {
          "offBlockTime": "2024-01-01 12:00",
          "takeoffTime": "2024-01-01 12:15",
          "arrivalTime": "2024-01-01 21:00",
          "onBlockTime": "2024-01-01 21:10"
        }
      }
    }
    """
    Then the response status should be 201
    And the response body should contain:
    """json
    {
      "id": "@uuid",
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "status": "created",
      "timesheet": {
        "scheduled": {
          "arrivalTime": "2024-01-01 21:00",
          "onBlockTime": "2024-01-01 21:10",
          "takeoffTime": "2024-01-01 12:15",
          "offBlockTime": "2024-01-01 12:00"
        }
      },
      "aircraft": {
        "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "icaoCode": "B773",
        "shortName": "B777-300ER",
        "fullName": "Boeing 777-300ER",
        "registration": "N78881",
        "selcal": "KY-JO",
        "livery": "Team USA (2023)"
      },
      "airports": [
        {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "type": "departure"
        },
        {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "name": "New York JFK",
          "country": "United States of America",
          "timezone": "America/New_York",
          "type": "destination"
        }
      ]
    }
    """
