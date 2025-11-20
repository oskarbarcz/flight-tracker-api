Feature: Create a flight

  Scenario: As an admin I cannot create a flight
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10",
            "takeoffTime": "2025-01-01 12:15",
            "offBlockTime": "2025-01-01 12:00"
          }
        },
        "loadsheets": {
          "preliminary": null,
          "final": null
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "icaoCode": "B773",
          "shortName": "Boeing 777",
          "fullName": "Boeing 777-300ER",
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
        },
        "airports": [
          {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "continent": "europe",
            "location": {
              "longitude": 8.57397,
              "latitude": 50.04693
            },
            "type": "departure"
          },
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "location": {
              "longitude": -73.7781,
              "latitude": 40.6413
            },
            "type": "destination"
          }
        ],
        "isFlightDiverted": false,
        "rotationId": null
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot create a flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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

  Scenario: As operations I can create a flight with a preliminary loadsheet
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 6
            },
            "passengers": 370,
            "payload": 40.3,
            "cargo": 8.5,
            "zeroFuelWeight": 208.9,
            "blockFuel": 12.7
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
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10",
            "takeoffTime": "2025-01-01 12:15",
            "offBlockTime": "2025-01-01 12:00"
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 6
            },
            "passengers": 370,
            "payload": 40.3,
            "cargo": 8.5,
            "zeroFuelWeight": 208.9,
            "blockFuel": 12.7
          },
          "final": null
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "icaoCode": "B773",
          "shortName": "Boeing 777",
          "fullName": "Boeing 777-300ER",
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
        },
        "airports": [
          {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "continent": "europe",
            "location": {
              "longitude": 8.57397,
              "latitude": 50.04693
            },
            "type": "departure"
          },
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "location": {
              "longitude": -73.7781,
              "latitude": 40.6413
            },
            "type": "destination"
          }
        ],
        "isFlightDiverted": false,
        "rotationId": null
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot create a flight with non existing aircraft
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "03a3b43c-8594-4c61-9eca-7b6ea4594d66",
        "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "5a709a4d-b688-47c0-b1ed-ce20629516a4",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "destinationAirportId": "5a709a4d-b688-47c0-b1ed-ce20629516a4",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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

  Scenario: As operations I cannot create a flight with operator that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "aircraftId": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "departureAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "operatorId": "5f61b6eb-6393-478c-88b5-56b29ec0a077",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
        }
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Cannot find operator declared in the request."
      }
      """

  Scenario: As operations I cannot create a flight with incorrect payload
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/" with body:
      """json
      {
        "flightNumber": "DLH990",
        "callsign": "DLH990",
        "status": "taxiing_in",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
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
          "aircraftId": ["aircraftId must be a string", "aircraftId must be a UUID"],
          "departureAirportId": ["departureAirportId must be a string", "departureAirportId must be a UUID"],
          "destinationAirportId": ["destinationAirportId must be a string", "destinationAirportId must be a UUID"],
          "status": ["property status should not exist"],
          "operatorId": ["operatorId should not be empty", "operatorId must be a string", "operatorId must be a UUID"],
          "loadsheets": ["loadsheets should not be empty"]
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
        "operatorId": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-01 12:00",
            "takeoffTime": "2025-01-01 12:15",
            "arrivalTime": "2025-01-01 21:00",
            "onBlockTime": "2025-01-01 21:10"
          }
        },
        "loadsheets": {
          "preliminary": null
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
