Feature: Push reviewed OpenStreetMap data into an airport

  Scenario: As an operations user I can push only the changes I selected
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:27", "terminal:NT"] }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "airportId": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
        "icaoCode": "EDDW",
        "totals": { "added": 1, "removed": 0, "updated": 1, "skipped": 0, "failed": 0 },
        "changes": [
          { "key": "terminal:NT", "outcome": "added", "reason": null },
          { "key": "runway:27", "outcome": "updated", "reason": null }
        ]
      }
      """
    And I set database to initial state

  Scenario: Anything I did not select is left alone
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:27"] }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/terminal"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "airportId": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
          "shortName": "HT",
          "fullName": "Bremen Hauptterminal",
          "averageTaxiTime": 5,
          "operatorCodes": ["DLH", "RYR"],
          "text": "@any",
          "shape": "@coordinates"
        }
      ]
      """
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/runway"
    Then the response status should be 200
    And the response body property "1" should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
        "designator": "27",
        "length": 2100,
        "width": 45,
        "displace": null,
        "trueHeading": 270,
        "magneticHeading": 267,
        "elevation": 4,
        "surfaceType": "asphalt",
        "lightingType": "HIRL",
        "coordinates": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: Pushing a removal deletes the record
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["gate:5"] }
      """
    Then the response status should be 200
    And the response body property "totals" should contain:
      """json
      { "added": 0, "removed": 1, "updated": 0, "skipped": 0, "failed": 0 }
      """
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/gate"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """
    And I set database to initial state

  Scenario: A change the airport has caught up with is skipped rather than written twice
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:09"] }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "airportId": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
        "icaoCode": "EDDW",
        "totals": { "added": 0, "removed": 0, "updated": 0, "skipped": 1, "failed": 0 },
        "changes": [
          {
            "key": "runway:09",
            "outcome": "skipped",
            "reason": "OpenStreetMap agrees with the airport model; nothing to write."
          }
        ]
      }
      """

  Scenario: A gate whose stand was not selected fails, and the rest still lands
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["gate:6", "runway:14"] }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "airportId": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
        "icaoCode": "EDDW",
        "totals": { "added": 1, "removed": 0, "updated": 0, "skipped": 0, "failed": 1 },
        "changes": [
          {
            "key": "gate:6",
            "outcome": "failed",
            "reason": "Requires parking position 06, which does not exist and was not pushed alongside it."
          },
          { "key": "runway:14", "outcome": "added", "reason": null }
        ]
      }
      """
    And I set database to initial state

  Scenario: Pushing a stand together with its terminal works in one call
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["parkingPosition:20", "terminal:NT"] }
      """
    Then the response status should be 200
    And the response body property "totals" should contain:
      """json
      { "added": 2, "removed": 0, "updated": 0, "skipped": 0, "failed": 0 }
      """
    And I set database to initial state

  Scenario: A change key the retained pull does not propose
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich?refresh=true"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:99"] }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "The retained OpenStreetMap data proposes no such change: runway:99. Pull again to get current change keys."
      }
      """

  Scenario: An empty selection is rejected
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": [] }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "Request validation failed.",
        "violations": { "items": ["items should not be empty"] }
      }
      """

  Scenario: Pushing without having pulled first
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3/enrich" with body:
      """json
      { "items": ["runway:09"] }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "No OpenStreetMap data is held for this airport. Pull it and review the proposal before pushing."
      }
      """

  Scenario: As a cabin crew I cannot push airport data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:27"] }
      """
    Then the response status should be 403

  Scenario: As an admin I cannot push airport data
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:27"] }
      """
    Then the response status should be 403

  Scenario: As an unauthorized user I cannot push airport data
    When I send a "POST" request to "/api/v1/airport/5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf/enrich" with body:
      """json
      { "items": ["runway:27"] }
      """
    Then the response status should be 401
