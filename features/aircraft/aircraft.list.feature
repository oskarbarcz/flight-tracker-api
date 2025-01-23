Feature: List aircraft

  Scenario: As an admin I can list aircraft
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/aircraft"
    Then the response status should be 200
    And the response body should contain:
    """json
    [
      {
        "fullName": "Airbus A330-900 neo",
        "icaoCode": "A339",
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "livery": "Fanhansa (2024)",
        "registration": "D-AIMC",
        "selcal": "LR-CK",
        "shortName": "A330-900",
        "operator":{
          "id":"40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode":"DLH",
          "shortName":"Lufthansa",
          "fullName":"Deutsche Lufthansa AG",
          "callsign":"Lufthansa"
        }
      },
      {
        "fullName": "Airbus A331-251 SL ACT-2",
        "icaoCode": "A321",
        "id": "7d27a031-5abb-415f-bde5-1aa563ad394e",
        "livery": "Sunshine (2024)",
        "registration": "D-AIDA",
        "selcal": "SK-PK",
        "shortName": "A321-251",
        "operator": {
          "id":"5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode":"CDG",
          "shortName":"Condor",
          "fullName":"Condor Flugdienst",
          "callsign":"CONDOR"
        }
      },
      {
        "fullName": "Airbus A319-200(neo)",
        "icaoCode": "A319",
        "id": "3f34bc59-c9c3-4ad0-88fa-2cc570298602",
        "livery": "Water (2024)",
        "registration": "D-AIDK",
        "selcal": "MS-KL",
        "shortName": "A319-200",
        "operator":{
          "id":"5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode":"CDG",
          "shortName":"Condor",
          "fullName":"Condor Flugdienst",
          "callsign":"CONDOR"
        }
      },
      {
        "fullName": "Boeing 777-300ER",
        "icaoCode": "B773",
        "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "livery": "Team USA (2023)",
        "registration": "N78881",
        "selcal": "KY-JO",
        "shortName": "B777-300ER",
        "operator": {
          "id":"1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode":"AAL",
          "shortName":"American Airlines",
          "fullName":"American Airlines, Inc.",
          "callsign":"AMERICAN"
        }
      }
    ]
    """

  Scenario: As operations I can list aircraft
    Given I use seed data
    And I am signed in as "operations"
    When I send a "GET" request to "/api/v1/aircraft"
    Then the response status should be 200

  Scenario: As an cabin crew I can list aircraft
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/aircraft"
    Then the response status should be 200

  Scenario: As an unauthorized user I cannot list aircraft
    Given I use seed data
    When I send a "GET" request to "/api/v1/aircraft"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
