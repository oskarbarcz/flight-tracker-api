Feature: List airports

  Scenario: As an admin I can list airports
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200
    And the response body should contain:
    """json
    [
      {
        "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "icaoCode": "EDDF",
        "name": "Frankfurt Rhein/Main",
        "country": "Germany",
        "timezone": "Europe/Berlin"
      },
      {
        "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "icaoCode": "EPWA",
        "name": "Warsaw Chopin",
        "country": "Poland",
        "timezone": "Europe/Warsaw"
      },
      {
        "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "icaoCode": "KJFK",
        "name": "New York JFK",
        "country": "United States of America",
        "timezone": "America/New_York"
      },
      {
        "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
        "icaoCode": "LFPG",
        "name": "Paris Charles de Gaulle",
        "country": "France",
        "timezone": "Europe/Paris"
      },
      {
        "id": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
        "icaoCode": "CYYR",
        "name": "Goose Bay Intl",
        "country": "Canada",
        "timezone": "America/Goose_Bay"
      },
      {
        "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
        "icaoCode": "BIRK",
        "name": "Reykjavik Keflavik",
        "country": "Iceland",
        "timezone": "GMT"
      },
      {
        "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
        "icaoCode": "CYYT",
        "name": "St. Johns Intl",
        "country": "Canada",
        "timezone": "GMT-3:30"
      },
      {
        "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
        "icaoCode": "KPHL",
        "name": "Philadelphia Intl",
        "country": "United States of America",
        "timezone": "GMT-5"
      },
      {
        "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
        "icaoCode": "KBOS",
        "name": "Boston Logan Intl",
        "country": "United States of America",
        "timezone": "GMT-5"
      },
      {
        "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
        "icaoCode": "EDDW",
        "name": "Bremen",
        "country": "Germany",
        "timezone": "GMT+1"
      }
    ]
    """

  Scenario: As operations I can list airports
    Given I use seed data
    And I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200

  Scenario: As a cabin crew I can list airports
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200
