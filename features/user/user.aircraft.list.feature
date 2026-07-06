Feature: List aircraft the current user has flown

  Scenario: As a user I can list the aircraft I have flown, newest first
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/aircraft"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "ed7ed4bb-95ff-4e79-9331-11212ef727ec",
          "registration": "D-AIMG",
          "airframe": "@any",
          "livery": "Retro 1970s (2022)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "flightId": "1e9f4176-188f-41a5-a9d1-25a96579f46d"
        },
        {
          "id": "a9b9205d-53b1-4eec-bb24-548a12159997",
          "registration": "D-AIMF",
          "airframe": "@any",
          "livery": "New Livery (2018)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "flightId": "d4a25ef2-39cf-484c-af00-a548999e8699"
        },
        {
          "id": "6c48d613-6582-49de-afbb-89fdc7cac0b7",
          "registration": "N718AN",
          "airframe": "@any",
          "livery": "Oneworld (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          },
          "flightId": "23da8bc9-a21b-4678-b2e9-1151d3bd15ab"
        }
      ]
      """

  Scenario: As a user who has flown nothing I get an empty list
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/aircraft"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As an unauthorized user I cannot list flown aircraft
    When I send a "GET" request to "/api/v1/user/me/aircraft"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
