Feature: Mark flight as ready
  Scenario: Mark flight as ready
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 200
    And I dump response
    And the response body should contain:
    """json
    {
      "id": "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05",
      "flightNumber": "LH 450",
      "callsign": "DLH 450",
      "status": "ready",
      "timesheet": {
        "scheduled": {
          "arrivalTime": "2024-01-01T21:00:00.000Z",
          "onBlockTime": "2024-01-01T21:10:00.000Z",
          "takeoffTime": "2024-01-01T12:15:00.000Z",
          "offBlockTime": "2024-01-01T12:00:00.000Z"
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
        },
        {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "icaoCode": "KPHL",
          "name": "Philadelphia Intl",
          "country": "United States of America",
          "timezone": "GMT-5",
          "type": "destination_alternate"
        },
        {
          "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
          "icaoCode": "KBOS",
          "name": "Boston Logan Intl",
          "country": "United States of America",
          "timezone": "GMT-5",
          "type": "destination_alternate"
        },
        {
          "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
          "icaoCode": "CYYT",
          "name": "St. Johns Intl",
          "country": "Canada",
          "timezone": "GMT-3:30",
          "type": "etops_alternate"
        }
      ]
    }
    """

  Scenario: Mark flight as ready twice
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/mark-as-ready"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot mark flight as ready. Flight is not in created status.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

  Scenario: Mark as ready flight that does not exist
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/141a2f56-708d-4cc9-b967-64dc0c2b20c4/mark-as-ready"
    And I dump response
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Mark as ready flight with incorrect uuid
    When I send a "POST" request to "/api/v1/flight/incorrect-uuid/mark-as-ready"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
