import { Continent, Coordinates } from '../../airports/model/airport.model';

export type AirportValues = {
  name: string;
  continent: Continent;
  country: string;
  timezone: string;
  cityId: string;
  location: Coordinates;
  shape: Coordinates[] | null;
};
