Feature: Create a flight with Simbrief

  Scenario: As an admin I cannot create a flight with Simbrief
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations user with SimBrief connected I can create a flight with Simbrief
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "flightNumber": "LH80",
        "callsign": "DLH80",
        "atcCallsign": "DLH80",
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-05T09:00:00.000Z",
            "takeoffTime": "2025-01-05T09:20:00.000Z",
            "arrivalTime": "2025-01-05T17:10:00.000Z",
            "onBlockTime": "2025-01-05T17:25:00.000Z"
          }
        },
        "loadsheets": {
          "final": null,
          "preliminary": {
            "cargo": 8,
            "payload": 37.9,
            "blockFuel": 71.6,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 5,
              "reliefPilots": 0
            },
            "passengers": 348,
            "zeroFuelWeight": 206.5,
            "fuel": {
              "block": 71.6,
              "taxi": 0.8,
              "trip": 58,
              "alternate": 4.2,
              "reserve": 2.9,
              "contingencyType": "3%",
              "contingencyAmount": 1.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0.3,
              "extra": 0.6,
              "tankering": 0,
              "etops": 0,
              "minTakeoff": 70.8,
              "planTakeoff": 70.8,
              "planLanding": 12.8,
              "averageFuelFlow": 5.8,
              "maxTanks": 111
            }
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "iataType": "339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "livery": "Fanhansa (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "cabinLayout": null
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
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
            "dataQuality": "low",
            "location": {
              "latitude": 50.04693,
              "longitude": 8.57397
            },
            "type": "departure",
            "shape": "@coordinates"
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
            "dataQuality": "low",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "destination",
            "shape": "@coordinates"
          },
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
            "type": "destination_alternate",
            "shape": "@coordinates"
          },
          {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "icaoCode": "KPHL",
            "iataCode": "PHL",
            "city": "Philadelphia",
            "name": "Philadelphia Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 39.87113,
              "longitude": -75.24349
            },
            "type": "destination_alternate",
            "shape": "@coordinates"
          },
          {
            "id": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
            "icaoCode": "CYYR",
            "iataCode": "YYR",
            "city": "Goose Bay",
            "name": "Goose Bay Intl",
            "country": "Canada",
            "timezone": "America/Goose_Bay",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 53.319168,
              "longitude": -60.409444
            },
            "type": "enroute_alternate",
            "shape": "@coordinates"
          },
          {
            "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
            "icaoCode": "BIKF",
            "iataCode": "KEF",
            "city": "Reykjavik",
            "name": "Reykjavik Keflavik",
            "country": "Iceland",
            "timezone": "Atlantic/Reykjavik",
            "continent": "europe",
            "dataQuality": "low",
            "location": {
              "latitude": 63.985,
              "longitude": -22.6056
            },
            "type": "etops_entry",
            "shape": "@coordinates"
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": "St. Johns",
            "name": "St. Johns Intl",
            "country": "Canada",
            "timezone": "America/St_Johns",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 47.61861,
              "longitude": -52.751945
            },
            "type": "etops_exit",
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": "6bbf43a4-9242-4f04-b195-6a7bcd1f14c4",
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "simbrief",
        "tracking": "private",
        "serviceType": "passenger",
        "createdAt": "@date('within 1 minute from now')",
        "pilot": null
      }
      """
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/crew"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "name": "Alberto Holcomb",
          "email": "alberto.holcomb@lufthansa.com",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "role": "fo",
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "name": "Katrina Livingston",
          "email": "katrina.livingston@lufthansa.com",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "role": "pu",
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "name": "Clara Reeves",
          "email": "clara.reeves@lufthansa.com",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "role": "fa",
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "name": "Gregg Simon",
          "email": "gregg.simon@lufthansa.com",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "role": "fa",
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "name": "Lela Vaughn",
          "email": "lela.vaughn@lufthansa.com",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "role": "fa",
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "name": "Virgil Rivers",
          "email": "virgil.rivers@lufthansa.com",
          "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "role": "fa",
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I set database to initial state

  Scenario: As operations user with a SimBrief plan whose ETOPS section is empty I can create a flight
    Given I am signed in as "operations with Simbrief ID but empty etops"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "flightNumber": "LH80",
        "callsign": "DLH80",
        "atcCallsign": "DLH80",
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-05T09:00:00.000Z",
            "takeoffTime": "2025-01-05T09:20:00.000Z",
            "arrivalTime": "2025-01-05T17:10:00.000Z",
            "onBlockTime": "2025-01-05T17:25:00.000Z"
          }
        },
        "loadsheets": {
          "final": null,
          "preliminary": {
            "cargo": 8,
            "payload": 37.9,
            "blockFuel": 71.6,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 5,
              "reliefPilots": 0
            },
            "passengers": 348,
            "zeroFuelWeight": 206.5,
            "fuel": {
              "block": 71.6,
              "taxi": 0.8,
              "trip": 58,
              "alternate": 4.2,
              "reserve": 2.9,
              "contingencyType": "3%",
              "contingencyAmount": 1.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0.3,
              "extra": 0.6,
              "tankering": 0,
              "etops": 0,
              "minTakeoff": 70.8,
              "planTakeoff": 70.8,
              "planLanding": 12.8,
              "averageFuelFlow": 5.8,
              "maxTanks": 111
            }
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "iataType": "339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "livery": "Fanhansa (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "cabinLayout": null
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
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
            "dataQuality": "low",
            "location": {
              "latitude": 50.04693,
              "longitude": 8.57397
            },
            "type": "departure",
            "shape": "@coordinates"
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
            "dataQuality": "low",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "destination",
            "shape": "@coordinates"
          },
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
            "type": "destination_alternate",
            "shape": "@coordinates"
          },
          {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "icaoCode": "KPHL",
            "iataCode": "PHL",
            "city": "Philadelphia",
            "name": "Philadelphia Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 39.87113,
              "longitude": -75.24349
            },
            "type": "destination_alternate",
            "shape": "@coordinates"
          },
          {
            "id": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
            "icaoCode": "CYYR",
            "iataCode": "YYR",
            "city": "Goose Bay",
            "name": "Goose Bay Intl",
            "country": "Canada",
            "timezone": "America/Goose_Bay",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 53.319168,
              "longitude": -60.409444
            },
            "type": "enroute_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": "6bbf43a4-9242-4f04-b195-6a7bcd1f14c4",
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "simbrief",
        "tracking": "private",
        "serviceType": "passenger",
        "createdAt": "@date('within 1 minute from now')",
        "pilot": null
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot create a flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations user with incorrect SimBrief flight plan I cannot create a flight
    Given I am signed in as "operations with Simbrief ID but non existing aircraft"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft with given registration not found."
      }
      """

  Scenario: As operations user with a SimBrief plan referencing an airport missing from database I import it from SkyLink and create a flight
    Given I am signed in as "operations with Simbrief ID and alternate airport missing from database"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "flightNumber": "LH80",
        "callsign": "DLH80",
        "atcCallsign": "DLH80",
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "offBlockTime": "2025-01-05T09:00:00.000Z",
            "takeoffTime": "2025-01-05T09:20:00.000Z",
            "arrivalTime": "2025-01-05T17:10:00.000Z",
            "onBlockTime": "2025-01-05T17:25:00.000Z"
          }
        },
        "loadsheets": {
          "final": null,
          "preliminary": {
            "cargo": 8,
            "payload": 37.9,
            "blockFuel": 71.6,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 5,
              "reliefPilots": 0
            },
            "passengers": 348,
            "zeroFuelWeight": 206.5,
            "fuel": {
              "block": 71.6,
              "taxi": 0.8,
              "trip": 58,
              "alternate": 4.2,
              "reserve": 2.9,
              "contingencyType": "3%",
              "contingencyAmount": 1.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0.3,
              "extra": 0.6,
              "tankering": 0,
              "etops": 0,
              "minTakeoff": 70.8,
              "planTakeoff": 70.8,
              "planLanding": 12.8,
              "averageFuelFlow": 5.8,
              "maxTanks": 111
            }
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "iataType": "339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy",
            "serviceType": "passenger"
          },
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "livery": "Fanhansa (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          },
          "cabinLayout": null
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
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
            "dataQuality": "low",
            "location": {
              "latitude": 50.04693,
              "longitude": 8.57397
            },
            "type": "departure",
            "shape": "@coordinates"
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
            "dataQuality": "low",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "destination",
            "shape": "@coordinates"
          },
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "dataQuality": "low",
            "location": {
              "latitude": 42.36454,
              "longitude": -71.01663
            },
            "type": "destination_alternate",
            "shape": "@coordinates"
          },
          {
            "id": "@uuid",
            "icaoCode": "EGLL",
            "iataCode": "LHR",
            "city": "London",
            "name": "London Heathrow Airport",
            "country": "United Kingdom",
            "timezone": "Europe/London",
            "continent": "europe",
            "dataQuality": "low",
            "location": {
              "latitude": 51.47060013,
              "longitude": -0.461941
            },
            "type": "enroute_alternate",
            "shape": null
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": "6bbf43a4-9242-4f04-b195-6a7bcd1f14c4",
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "simbrief",
        "tracking": "private",
        "serviceType": "passenger",
        "createdAt": "@date('within 1 minute from now')",
        "pilot": null
      }
      """
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "dataQuality": "low",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          },
          "shape": "@coordinates"
        },
        {
          "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "icaoCode": "EPWA",
          "iataCode": "WAW",
          "city": "Warsaw",
          "name": "Warsaw Chopin",
          "country": "Poland",
          "timezone": "Europe/Warsaw",
          "continent": "europe",
          "dataQuality": "low",
          "location": {
            "longitude": 20.967123,
            "latitude": 52.16575
          },
          "shape": "@coordinates"
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
          "dataQuality": "low",
          "location": {
            "longitude": -73.7781,
            "latitude": 40.6413
          },
          "shape": "@coordinates"
        },
        {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "icaoCode": "LFPG",
          "iataCode": "CDG",
          "city": "Paris",
          "name": "Paris Charles de Gaulle",
          "country": "France",
          "timezone": "Europe/Paris",
          "continent": "europe",
          "dataQuality": "low",
          "location": {
            "longitude": 2.55412,
            "latitude": 49.00896
          },
          "shape": "@coordinates"
        },
        {
          "id": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
          "icaoCode": "CYYR",
          "iataCode": "YYR",
          "city": "Goose Bay",
          "name": "Goose Bay Intl",
          "country": "Canada",
          "timezone": "America/Goose_Bay",
          "continent": "north_america",
          "dataQuality": "low",
          "location": {
            "longitude": -60.409444,
            "latitude": 53.319168
          },
          "shape": "@coordinates"
        },
        {
          "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
          "icaoCode": "BIKF",
          "iataCode": "KEF",
          "city": "Reykjavik",
          "name": "Reykjavik Keflavik",
          "country": "Iceland",
          "timezone": "Atlantic/Reykjavik",
          "continent": "europe",
          "dataQuality": "low",
          "location": {
            "longitude": -22.6056,
            "latitude": 63.985
          },
          "shape": "@coordinates"
        },
        {
          "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
          "icaoCode": "CYYT",
          "iataCode": "YYT",
          "city": "St. Johns",
          "name": "St. Johns Intl",
          "country": "Canada",
          "timezone": "America/St_Johns",
          "continent": "north_america",
          "dataQuality": "low",
          "location": {
            "longitude": -52.751945,
            "latitude": 47.61861
          },
          "shape": "@coordinates"
        },
        {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "icaoCode": "KPHL",
          "iataCode": "PHL",
          "city": "Philadelphia",
          "name": "Philadelphia Intl",
          "country": "United States of America",
          "timezone": "America/New_York",
          "continent": "north_america",
          "dataQuality": "low",
          "location": {
            "longitude": -75.24349,
            "latitude": 39.87113
          },
          "shape": "@coordinates"
        },
        {
          "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
          "icaoCode": "KBOS",
          "iataCode": "BOS",
          "city": "Boston",
          "name": "Boston Logan Intl",
          "country": "United States of America",
          "timezone": "America/New_York",
          "continent": "north_america",
          "dataQuality": "low",
          "location": {
            "longitude": -71.01663,
            "latitude": 42.36454
          },
          "shape": "@coordinates"
        },
        {
          "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
          "icaoCode": "EDDW",
          "iataCode": "BRE",
          "city": "Bremen",
          "name": "Bremen",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "dataQuality": "low",
          "location": {
            "longitude": 8.786667,
            "latitude": 53.0475
          },
          "shape": "@coordinates"
        },
        {
          "id": "@uuid",
          "icaoCode": "EGLL",
          "iataCode": "LHR",
          "city": "London",
          "name": "London Heathrow Airport",
          "country": "United Kingdom",
          "timezone": "Europe/London",
          "continent": "europe",
          "dataQuality": "low",
          "location": {
            "longitude": -0.461941,
            "latitude": 51.47060013
          },
          "shape": null
        }
      ]
      """
    And I set database to initial state

  Scenario: As operations without Simbrief ID I cannot create a flight with SimBrief
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "User has not connected SimBrief ID."
      }
      """

  Scenario: As an unauthorized user I cannot create a flight with SimBrief
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: NOTAMs of the plan origin and destination are stored on import
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A1001/26",
          "dateCreated": "2026-08-01T05:40:00.000Z",
          "dateEffective": "2026-08-01T06:00:00.000Z",
          "dateExpire": "2099-12-31T23:59:00.000Z",
          "dateModified": "2026-08-01T05:40:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "<b>TWY N16</b> <b>CLOSED</b> BTN <b>TWY N15</b> AND <b>TWY N17</b>.",
          "text": "TWY N16 CLOSED BTN TWY N15 AND TWY N17.",
          "raw": "A1001/26 NOTAMN\n Q) EDGG/QMXLC/IV/BO /A /000/999/5002N00834E005\n A) EDDF B) 2608010600 C) 9912312359\n E) TWY N16 CLOSED BTN TWY N15 AND TWY N17.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A1002/26",
          "dateCreated": "2026-07-20T07:45:00.000Z",
          "dateEffective": "2026-07-20T08:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-07-20T07:45:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "CRANE ERECTED 850M SW OF <b>ARP</b>, ELEV 512FT, MARKED AND LGTD.",
          "text": "CRANE ERECTED 850M SW OF ARP, ELEV 512FT, MARKED AND LGTD.",
          "raw": "A1002/26 NOTAMN\n Q) EDGG/QOBCE/IV/M  /AE/000/002/5002N00834E001\n A) EDDF B) 2607200800 C) PERM\n E) CRANE ERECTED 850M SW OF ARP, ELEV 512FT, MARKED AND LGTD.",
          "nrc": "NOTAMN",
          "qcode": "QOBCE",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Obstacle",
          "qcodeStatus": "Erected"
        }
      ]
      """
    When I send a "GET" request to "/api/v1/airport/3c721cc6-c653-4fad-be43-dc9d6a149383/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A2001/26",
          "dateCreated": "2026-08-02T03:30:00.000Z",
          "dateEffective": "2026-08-02T04:00:00.000Z",
          "dateExpire": "2099-12-31T23:59:00.000Z",
          "dateModified": "2026-08-02T03:30:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "<b>RWY 04L/22R</b> <b>CLSD</b>.",
          "text": "RWY 04L/22R CLSD.",
          "raw": "A2001/26 NOTAMN\n Q) KZNY/QMRLC/IV/NBO/A /000/999/4038N07346W005\n A) KJFK B) 2608020400 C) 9912312359\n E) RWY 04L/22R CLSD.",
          "nrc": "NOTAMN",
          "qcode": "QMRLC",
          "qcodeCategory": "Runway",
          "qcodeSubject": "Runway",
          "qcodeStatus": "Closed"
        }
      ]
      """
    And I set database to initial state

  Scenario: NOTAMs of the plan alternates and ETOPS airports are stored on import
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/airport/c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A3001/26",
          "dateCreated": "2026-08-03T04:30:00.000Z",
          "dateEffective": "2026-08-03T05:00:00.000Z",
          "dateExpire": "2099-12-31T23:59:00.000Z",
          "dateModified": "2026-08-03T04:30:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "<b>ILS</b> <b>RWY 04R</b> GP UNMONITORED.",
          "text": "ILS RWY 04R GP UNMONITORED.",
          "raw": "A3001/26 NOTAMN\n Q) KZBW/QICAS/I /NBO/A /000/999/4222N07100W005\n A) KBOS B) 2608030500 C) 9912312359\n E) ILS RWY 04R GP UNMONITORED.",
          "nrc": "NOTAMN",
          "qcode": "QICAS",
          "qcodeCategory": "Approach Procedures",
          "qcodeSubject": "Instrument landing system",
          "qcodeStatus": "Unserviceable"
        }
      ]
      """
    When I send a "GET" request to "/api/v1/airport/fa8ee2e9-fb94-4416-9ed0-4811efd488ae/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4001/26",
          "dateCreated": "2026-08-04T06:30:00.000Z",
          "dateEffective": "2026-08-04T07:00:00.000Z",
          "dateExpire": "2099-12-31T23:59:00.000Z",
          "dateModified": "2026-08-04T06:30:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "<b>APRON</b> I NORTH SIDE <b>CLSD</b>.",
          "text": "APRON I NORTH SIDE CLSD.",
          "raw": "A4001/26 NOTAMN\n Q) CZQX/QMNLC/IV/BO /A /000/999/5319N06018W005\n A) CYYR B) 2608040700 C) 9912312359\n E) APRON I NORTH SIDE CLSD.",
          "nrc": "NOTAMN",
          "qcode": "QMNLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Closed"
        }
      ]
      """
    And I set database to initial state

  Scenario: Importing a plan twice does not duplicate the airport NOTAMs
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A1001/26",
          "dateCreated": "2026-08-01T05:40:00.000Z",
          "dateEffective": "2026-08-01T06:00:00.000Z",
          "dateExpire": "2099-12-31T23:59:00.000Z",
          "dateModified": "2026-08-01T05:40:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "<b>TWY N16</b> <b>CLOSED</b> BTN <b>TWY N15</b> AND <b>TWY N17</b>.",
          "text": "TWY N16 CLOSED BTN TWY N15 AND TWY N17.",
          "raw": "A1001/26 NOTAMN\n Q) EDGG/QMXLC/IV/BO /A /000/999/5002N00834E005\n A) EDDF B) 2608010600 C) 9912312359\n E) TWY N16 CLOSED BTN TWY N15 AND TWY N17.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A1002/26",
          "dateCreated": "2026-07-20T07:45:00.000Z",
          "dateEffective": "2026-07-20T08:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-07-20T07:45:00.000Z",
          "dateImported": "@date('within 1 minute from now')",
          "html": "CRANE ERECTED 850M SW OF <b>ARP</b>, ELEV 512FT, MARKED AND LGTD.",
          "text": "CRANE ERECTED 850M SW OF ARP, ELEV 512FT, MARKED AND LGTD.",
          "raw": "A1002/26 NOTAMN\n Q) EDGG/QOBCE/IV/M  /AE/000/002/5002N00834E001\n A) EDDF B) 2607200800 C) PERM\n E) CRANE ERECTED 850M SW OF ARP, ELEV 512FT, MARKED AND LGTD.",
          "nrc": "NOTAMN",
          "qcode": "QOBCE",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Obstacle",
          "qcodeStatus": "Erected"
        }
      ]
      """
    And I set database to initial state

  Scenario: An airport the imported plan reports no NOTAMs for is cleared
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "GET" request to "/api/v1/airport/e764251b-bb25-4e8b-8cc7-11b0397b4554/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A0231/26",
          "dateCreated": "2026-07-11T15:00:00.000Z",
          "dateEffective": "2026-07-11T16:00:00.000Z",
          "dateExpire": "2099-10-31T23:59:00.000Z",
          "dateModified": "2026-07-11T15:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY E</b> <b>CLSD</b> BTN <b>TWY K</b> AND <b>TWY L</b>.",
          "text": "TWY E CLSD BTN TWY K AND TWY L.",
          "raw": "A0231/26 NOTAMN\n Q) KZNY/QMXLC/IV/BO /A /000/999/3952N07514W005\n A) KPHL B) 2607111600 C) 9910312359\n E) TWY E CLSD BTN TWY K AND TWY L.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        }
      ]
      """
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/airport/e764251b-bb25-4e8b-8cc7-11b0397b4554/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """
    And I set database to initial state

  Scenario: An airport absent from the imported plan keeps its NOTAMs
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4501/99",
          "dateCreated": "2026-07-20T12:00:00.000Z",
          "dateEffective": "2099-01-01T00:00:00.000Z",
          "dateExpire": "2099-06-30T23:59:00.000Z",
          "dateModified": "2026-07-20T12:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>APRON</b> 3 <b>WORK IN PROGRESS</b>, STANDS 301 THRU 309 NOT AVBL.",
          "text": "APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "raw": "A4501/99 NOTAMN\n Q) EPWW/QMNLW/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 9901010000 C) 9906302359\n E) APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "nrc": "NOTAMN",
          "qcode": "QMNLW",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Work in progress"
        },
        {
          "notamId": "A3912/26",
          "dateCreated": "2026-07-01T13:53:00.000Z",
          "dateEffective": "2026-07-01T14:00:00.000Z",
          "dateExpire": "2099-12-31T22:00:00.000Z",
          "dateModified": "2026-07-01T13:53:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.",
          "text": "TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "raw": "A3912/26 NOTAMN\n Q) EPWW/QMXLC/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 2607011400 C) 9912312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A2204/26",
          "dateCreated": "2026-06-15T08:10:00.000Z",
          "dateEffective": "2026-06-15T09:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-06-16T11:20:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "BIRD ACTIVITY IN THE VICINITY OF <b>AD</b>.",
          "text": "BIRD ACTIVITY IN THE VICINITY OF AD.",
          "raw": "A2204/26 NOTAMN\n Q) EPWW/QFAXX/IV/NBO/A /000/999/5210N02058E005\n A) EPWA B) 2606150900 C) PERM\n E) BIRD ACTIVITY IN THE VICINITY OF AD.",
          "nrc": "NOTAMN",
          "qcode": "QFAXX",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Airport",
          "qcodeStatus": "Concentration of birds"
        }
      ]
      """
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4501/99",
          "dateCreated": "2026-07-20T12:00:00.000Z",
          "dateEffective": "2099-01-01T00:00:00.000Z",
          "dateExpire": "2099-06-30T23:59:00.000Z",
          "dateModified": "2026-07-20T12:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>APRON</b> 3 <b>WORK IN PROGRESS</b>, STANDS 301 THRU 309 NOT AVBL.",
          "text": "APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "raw": "A4501/99 NOTAMN\n Q) EPWW/QMNLW/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 9901010000 C) 9906302359\n E) APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "nrc": "NOTAMN",
          "qcode": "QMNLW",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Work in progress"
        },
        {
          "notamId": "A3912/26",
          "dateCreated": "2026-07-01T13:53:00.000Z",
          "dateEffective": "2026-07-01T14:00:00.000Z",
          "dateExpire": "2099-12-31T22:00:00.000Z",
          "dateModified": "2026-07-01T13:53:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.",
          "text": "TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "raw": "A3912/26 NOTAMN\n Q) EPWW/QMXLC/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 2607011400 C) 9912312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A2204/26",
          "dateCreated": "2026-06-15T08:10:00.000Z",
          "dateEffective": "2026-06-15T09:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-06-16T11:20:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "BIRD ACTIVITY IN THE VICINITY OF <b>AD</b>.",
          "text": "BIRD ACTIVITY IN THE VICINITY OF AD.",
          "raw": "A2204/26 NOTAMN\n Q) EPWW/QFAXX/IV/NBO/A /000/999/5210N02058E005\n A) EPWA B) 2606150900 C) PERM\n E) BIRD ACTIVITY IN THE VICINITY OF AD.",
          "nrc": "NOTAMN",
          "qcode": "QFAXX",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Airport",
          "qcodeStatus": "Concentration of birds"
        }
      ]
      """
    And I set database to initial state
