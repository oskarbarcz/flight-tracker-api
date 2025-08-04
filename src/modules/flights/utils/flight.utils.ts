import {
  AirportType,
  AirportWithType,
  Continent,
  Coordinates,
} from '../../airports/entity/airport.entity';

/**
 * Transforms raw airport data from database to typed AirportWithType objects
 * @param airports Raw airport data from database query
 * @returns Array of properly typed AirportWithType objects
 */
export function mapAirportsWithType(airports: any[]): AirportWithType[] {
  return airports.map(
    (airportOnFlight): AirportWithType => ({
      ...airportOnFlight.airport,
      location: airportOnFlight.airport.location as unknown as Coordinates,
      continent: airportOnFlight.airport.continent as Continent,
      type: airportOnFlight.airportType as AirportType,
    }),
  );
}

/**
 * Deep clones an object using modern structuredClone API
 * Falls back to JSON parse/stringify for older environments
 * @param obj Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  // Fallback for older environments
  return JSON.parse(JSON.stringify(obj));
}