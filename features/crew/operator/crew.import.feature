Feature: Import crew from SimBrief

  Scenario: Re-importing the same roster does not create duplicate crew
    Given I am signed in as "operations with valid Simbrief ID"
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
    When I send a "POST" request to "/api/v1/flight/create-with-simbrief"
    Then the response status should be 201
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
