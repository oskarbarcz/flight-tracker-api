Feature: The published API document describes what the API serves

  Scenario: Every response property declares its type
    Then every response property should declare its type

  Scenario: A shipment publishes the handling codes and commodities it may carry
    Then the "shc" property of "CargoShipmentEntry" should offer 55 values
    And the "commodity" property of "CargoShipmentEntry" should offer 100 values

  Scenario: A notifiable load publishes the handling codes it may carry
    Then the "shc" property of "NotocSpecialLoad" should offer 55 values

  Scenario: A manifest publishes the hold variants it may report
    Then the "holdVariant" property of "FlightCargoManifest" should offer 23 values

  Scenario: The hold catalogue publishes the airframe types it covers
    Then the "type" property of "AircraftHoldLayout" should offer 18 values
