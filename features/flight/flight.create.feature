Feature: Create a flight

  Scenario: As an admin I cannot create a flight
    Given I use seed data
    Given I am signed in as "admin"
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
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I can create a flight
    Given I use seed data
    Given I am signed in as "operations"
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

  Scenario: As a cabin crew I cannot create a flight
    Given I use seed data
    Given I am signed in as "cabin crew"
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
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I cannot create a flight with non existing aircraft
    Given I use seed data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
    """json
    {
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "aircraftId": "03a3b43c-8594-4c61-9eca-7b6ea4594d66",
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
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "statusCode": 404,
      "error": "Not Found",
      "message": "Aircraft assigned to this flight does not exist."
    }
    """

  Scenario: As operations I cannot create a flight with non existing departure airport
    Given I use seed data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
    """json
    {
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
      "departureAirportId": "5a709a4d-b688-47c0-b1ed-ce20629516a4",
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
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "statusCode": 404,
      "error": "Not Found",
      "message": "Departure airport on this flight does not exist."
    }
    """

  Scenario: As operations I cannot create a flight with non existing destination airport
    Given I use seed data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
    """json
    {
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
      "departureAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
      "destinationAirportId": "5a709a4d-b688-47c0-b1ed-ce20629516a4",
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
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "statusCode": 404,
      "error": "Not Found",
      "message": "Destination airport on this flight does not exist."
    }
    """

  Scenario: As operations I cannot create a flight with destination airport matching departure airport
    Given I use seed data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
    """json
    {
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
      "departureAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
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
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "statusCode": 400,
      "error": "Bad Request",
      "message": "Departure and destination airports must be different."
    }
    """

  Scenario: As operations I cannot create a flight with incorrect payload
    Given I use seed data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
    """json
    {
      "flightNumber": "DLH990",
      "callsign": "DLH990",
      "status": "taxiing_in",
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
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Request validation failed.",
      "error": "Bad Request",
      "statusCode": 400,
      "violations": {
        "aircraftId": [
          "aircraftId must be a string",
          "aircraftId must be a UUID"
        ],
        "departureAirportId": [
          "departureAirportId must be a string",
          "departureAirportId must be a UUID"
        ],
        "destinationAirportId": [
          "destinationAirportId must be a string",
          "destinationAirportId must be a UUID"
        ],
        "status": [
          "property status should not exist"
        ]
      }
    }
    """

  Scenario: As an unauthorized user I cannot create a flight
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
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
