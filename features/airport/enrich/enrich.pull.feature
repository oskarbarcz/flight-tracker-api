Feature: Pull airport data from OpenStreetMap

  Scenario: As an operations user I can see how OpenStreetMap differs from an airport
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "summary" should contain:
      """json
      { "added": 5, "removed": 1, "updated": 3, "notChanged": 3 }
      """

  Scenario: The pull says where the data came from without touching the airport name
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "airportId": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
        "icaoCode": "EDDW",
        "source": "OpenStreetMap via Overpass",
        "providerName": "Bremen Airport",
        "pulledAt": "@date('within 1 minute from now')",
        "fromCache": false,
        "summary": "@any",
        "changes": "@any"
      }
      """

  Scenario: A record OpenStreetMap agrees with is reported as not changed
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "changes.2" should contain:
      """json
      {
        "key": "runway:09",
        "resource": "runway",
        "label": "09",
        "status": "not-changed",
        "fields": [],
        "requires": []
      }
      """

  Scenario: A record that moved is reported as updated, field by field
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "changes.3" should contain:
      """json
      {
        "key": "runway:27",
        "resource": "runway",
        "label": "27",
        "status": "updated",
        "fields": [{ "field": "length", "current": 2037, "proposed": 2100 }],
        "requires": []
      }
      """

  Scenario: A record the airport does not hold is reported as added
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "changes.6" should contain:
      """json
      {
        "key": "terminal:NT",
        "resource": "terminal",
        "label": "NT",
        "status": "added",
        "fields": "@any",
        "requires": []
      }
      """

  Scenario: A record OpenStreetMap no longer reports is reported as removed
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "changes.11" should contain:
      """json
      {
        "key": "gate:5",
        "resource": "gate",
        "label": "5",
        "status": "removed",
        "fields": [],
        "requires": []
      }
      """

  Scenario: A new stand names the terminal it needs alongside it
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "changes.9" should contain:
      """json
      {
        "key": "parkingPosition:20",
        "resource": "parkingPosition",
        "label": "20",
        "status": "added",
        "fields": "@any",
        "requires": ["terminal:NT"]
      }
      """

  Scenario: A new gate names the stand it boards onto
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    And the response body property "changes.10" should contain:
      """json
      {
        "key": "gate:6",
        "resource": "gate",
        "label": "6",
        "status": "added",
        "fields": "@any",
        "requires": ["parkingPosition:06"]
      }
      """

  Scenario: A repeated review is served from the retained pull
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich"
    Then the response status should be 200
    And the response body property "fromCache" should contain:
      """json
      true
      """

  Scenario: An airport OpenStreetMap has no aerodrome for
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/6cf1fcd8-d072-46b5-8132-bd885b43dd97/enrich?refresh=true"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "OpenStreetMap holds no aerodrome for ICAO code CYYT."
      }
      """

  Scenario: OpenStreetMap being unreachable is reported as an upstream failure
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/enrich?refresh=true"
    Then the response status should be 502
    And the response body should contain:
      """json
      {
        "statusCode": 502,
        "error": "Bad Gateway",
        "message": "OpenStreetMap airport data is unavailable."
      }
      """

  Scenario: An airport that does not exist
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/1b7c1eb5-5b1e-4a4f-9d3f-0c2f0a8f9c11/enrich"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airport with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot pull airport data
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich"
    Then the response status should be 403

  Scenario: As an admin I cannot pull airport data
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich"
    Then the response status should be 403

  Scenario: As an unauthorized user I cannot pull airport data
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich"
    Then the response status should be 401
