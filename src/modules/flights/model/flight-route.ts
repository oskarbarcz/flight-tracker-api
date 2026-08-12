import {
  AirportType,
  AirportWithType,
} from '../../airports/model/airport.model';

export type FlightRoute = {
  departure: AirportWithType;
  destination: AirportWithType;
};

export function resolveFlightRoute(airports: AirportWithType[]): FlightRoute {
  return {
    departure: airports.find(
      (airport) => airport.type === AirportType.Departure,
    ) as AirportWithType,
    destination: airports.find(
      (airport) => airport.type === AirportType.Destination,
    ) as AirportWithType,
  };
}
