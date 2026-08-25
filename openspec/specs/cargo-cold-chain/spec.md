# cargo-cold-chain

## Purpose

Record the temperature regime of a temperature-controlled shipment and the solution keeping it
there, then compute the exposure it faces across the whole journey — build-up, flight,
connection and onward flight — against that solution's endurance. Covers the risk level and the
plain-language reasoning reported with it, the ambient temperature at an exposed airport, and
the fact that the assessment is advice and never a constraint.

## Requirements

### Requirement: A temperature-controlled shipment declares its regime and its solution

The system SHALL record for every temperature-controlled shipment the temperature range it must
be kept within, whether that is achieved by an actively cooled container, a passive shipper or
dry ice, and the endurance of that solution in hours. An actively cooled container SHALL also
report its set point.

#### Scenario: A temperature-controlled shipment reports its regime

- **WHEN** a temperature-controlled shipment is read
- **THEN** it reports its temperature range, its solution and that solution's endurance

#### Scenario: An active container reports its set point

- **WHEN** a shipment carried in an actively cooled container is read
- **THEN** it reports the set point the container is held at

#### Scenario: Ambient cargo reports no regime

- **WHEN** a shipment needing no temperature control is read
- **THEN** it reports no temperature regime

### Requirement: A cold chain exposure is computed across the whole journey

The system SHALL compute for every temperature-controlled shipment the total time it is exposed
before its solution's endurance is exhausted, counting the time from build-up to departure, the
flight time, and where the shipment continues beyond the arrival its connection time and its
onward flight. The resulting margin SHALL be reported alongside the exposure.

#### Scenario: Exposure counts the flight and the ground time

- **WHEN** the cold chain of a shipment terminating at the arrival is assessed
- **THEN** the exposure counts its time from build-up and the flight time

#### Scenario: Exposure counts the onward journey

- **WHEN** the cold chain of a shipment continuing beyond the arrival is assessed
- **THEN** the exposure also counts its connection time and its onward flight

#### Scenario: The margin is reported

- **WHEN** a cold chain assessment is read
- **THEN** it reports the exposure, the endurance and the margin between them

### Requirement: A cold chain risk is reported with the reasoning behind it

The system SHALL report for every temperature-controlled shipment a risk level and a
plain-language explanation naming the facts that produced it, so that a pilot is told why a
shipment is at risk rather than only that it is. The explanation SHALL be derived from the
assessment's own inputs and SHALL be the same for the same inputs.

#### Scenario: A comfortable margin reads as low risk

- **GIVEN** a shipment whose endurance far exceeds its exposure
- **WHEN** its cold chain is assessed
- **THEN** it is reported as low risk with an explanation naming its margin

#### Scenario: A passive solution on a long sector reads as elevated risk

- **GIVEN** a shipment relying on a passive solution across a long sector
- **WHEN** its cold chain is assessed
- **THEN** it is reported at elevated risk with an explanation naming the passive solution

#### Scenario: A long exposed connection reads as high risk

- **GIVEN** a shipment whose onward connection leaves it exposed for many hours
- **WHEN** its cold chain is assessed
- **THEN** it is reported as high risk with an explanation naming the connection

#### Scenario: The same inputs always produce the same explanation

- **WHEN** the same cold chain assessment is read twice
- **THEN** the risk level and the explanation are identical

### Requirement: The assessment accounts for the weather at the exposed airport

The system SHALL take the ambient temperature at an airport where a shipment waits into account
when that temperature is known, so that a shipment left on a hot ramp is assessed differently
from the same shipment in a temperate one.

#### Scenario: A hot transfer airport raises the risk

- **GIVEN** a shipment whose onward connection is at an airport reporting a high ambient temperature
- **WHEN** its cold chain is assessed
- **THEN** the ambient temperature is named in the explanation

#### Scenario: Unknown weather does not block the assessment

- **GIVEN** a shipment whose exposed airport reports no weather
- **WHEN** its cold chain is assessed
- **THEN** the assessment is still produced, without naming an ambient temperature

### Requirement: The cold chain assessment is advisory

The system SHALL present the cold chain assessment as advice rather than as a constraint: it
SHALL NOT prevent a shipment from being loaded, prevent a flight from being released, or prevent
boarding from being finished.

#### Scenario: A high risk shipment is still carried

- **GIVEN** a flight carrying a shipment assessed as high risk
- **WHEN** operations releases the flight to the pilot
- **THEN** the release succeeds and the shipment is loaded
