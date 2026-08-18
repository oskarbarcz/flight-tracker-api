import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';
import { SimbriefUserNotFoundError } from '../../../../core/provider/simbrief/error/simbrief.error';
import {
  EmptyElement,
  OperationalFlightPlan,
} from '../../../../core/provider/simbrief/type/simbrief.types';
import {
  SimbriefAccount,
  SimbriefAircraft,
  SimbriefAirport,
  SimbriefFlight,
} from '../../model/simbrief-account.model';

export class VerifySimbriefUserQuery extends Query<SimbriefAccount> {
  constructor(public readonly simbriefUserId: string) {
    super();
  }
}

@QueryHandler(VerifySimbriefUserQuery)
export class VerifySimbriefUserHandler implements IQueryHandler<VerifySimbriefUserQuery> {
  constructor(private readonly simbriefClient: SimbriefClient) {}

  async execute(query: VerifySimbriefUserQuery): Promise<SimbriefAccount> {
    const ofp = await this.simbriefClient.findOperationalFlightPlan(
      query.simbriefUserId,
    );

    if (ofp === null) {
      throw new SimbriefUserNotFoundError();
    }

    return {
      simbriefUserId: query.simbriefUserId,
      latestFlight: this.toFlight(ofp),
    };
  }

  private toFlight(ofp: OperationalFlightPlan): SimbriefFlight {
    return {
      callsign: `${ofp.general.icao_airline ?? ''}${ofp.general.flight_number ?? ''}`,
      origin: this.toAirport(ofp.origin),
      destination: this.toAirport(ofp.destination),
      aircraft: this.toAircraft(ofp.aircraft),
      scheduledOffBlockTime: this.toDate(ofp.times?.sched_out),
      scheduledOnBlockTime: this.toDate(ofp.times?.sched_in),
      generatedAt: this.toDate(ofp.params?.time_generated),
    };
  }

  private toAirport(airport: OperationalFlightPlan['origin']): SimbriefAirport {
    return {
      icaoCode: airport.icao_code,
      iataCode: this.readText(airport.iata_code),
      name: this.readText(airport.name),
    };
  }

  private toAircraft(
    aircraft: OperationalFlightPlan['aircraft'],
  ): SimbriefAircraft {
    return {
      registration: this.readText(aircraft.reg),
      type: this.readText(aircraft.icaocode),
      name: this.readText(aircraft.name),
    };
  }

  private readText(value: string | EmptyElement | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const text = value.trim();

    return text.length === 0 ? null : text;
  }

  private toDate(value: string | undefined): Date | null {
    const seconds = Number(value);

    if (!value || !Number.isFinite(seconds)) {
      return null;
    }

    return new Date(seconds * 1000);
  }
}
