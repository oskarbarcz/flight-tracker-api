import { QueryBus } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../core/errors/domain-error';
import { GetAirportByIdQuery } from '../../../airports/application/query/get-airport-by-id.query';
import { GetAirportResponse } from '../../../airports/infra/http/request/airport.dto';
import {
  ChangeRequestTargetAirport,
  ChangeRequestTargetSummary,
} from '../../model/change-request.model';
import { AirportSummaries } from '../../model/change-request-target';

export function nullWhenNotFound<T>(lookup: Promise<T>): Promise<T | null> {
  return lookup.catch((error) => {
    if (error instanceof NotFoundError) {
      return null;
    }
    throw error;
  });
}

export function toTargetAirport(
  airport: GetAirportResponse,
): ChangeRequestTargetAirport {
  return {
    id: airport.id,
    icaoCode: airport.icaoCode,
    iataCode: airport.iataCode,
    name: airport.name,
  };
}

export function memoizedAirportSummaries(queryBus: QueryBus): AirportSummaries {
  const summaries = new Map<
    string,
    Promise<ChangeRequestTargetAirport | null>
  >();

  return (airportId) => {
    const cached = summaries.get(airportId);
    if (cached) {
      return cached;
    }

    const query = new GetAirportByIdQuery(airportId);
    const summary = nullWhenNotFound<GetAirportResponse>(
      queryBus.execute(query),
    ).then((airport) => airport && toTargetAirport(airport));
    summaries.set(airportId, summary);
    return summary;
  };
}

export async function summarizeTarget(
  airports: AirportSummaries,
  airportId: string,
  label: string,
): Promise<ChangeRequestTargetSummary | null> {
  const airport = await airports(airportId);

  return airport && { label, airport };
}
