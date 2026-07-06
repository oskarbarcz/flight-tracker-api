import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightWasCreatedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { GetUserSimbriefIdQuery } from '../../../users/application/query/get-user-simbrief-id.query';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';
import { ImportAirportByIcaoCommand } from '../../../airports/application/command/import-airport-by-icao.command';
import { GetAircraftByRegistrationQuery } from '../../../operators/application/query/aircraft/get-aircraft-by-registration.query';
import { GetOperatorByIcaoCodeQuery } from '../../../operators/application/query/get-operator-by-icao-code.query';
import { FlightTracking } from '../../model/flight.model';
import {
  AlternateAirportRequest,
  CreateFlightRequest,
} from '../../infra/http/request/flight.dto';
import { AirportType } from '../../../airports/model/airport.model';
import { OperationalFlightPlan } from '../../../../core/provider/simbrief/type/simbrief.types';

type AlternateAirportCandidate = {
  icaoCode: string;
  type: AirportType;
};

export class CreateFlightFromSimbriefCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(CreateFlightFromSimbriefCommand)
export class CreateFlightFromSimbriefHandler implements ICommandHandler<CreateFlightFromSimbriefCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly simbriefClient: SimbriefClient,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: CreateFlightFromSimbriefCommand): Promise<void> {
    const { flightId, initiatorId } = command;

    const getSimbriefIdQuery = new GetUserSimbriefIdQuery(initiatorId);
    const simbriefId = await this.queryBus.execute(getSimbriefIdQuery);

    if (simbriefId === null) {
      throw new BadRequestException('User has not connected SimBrief ID.');
    }

    const ofp = await this.simbriefClient.getOperationalFlightPlan(simbriefId);

    const departureAirportCommand = new ImportAirportByIcaoCommand(
      ofp.origin.icao_code,
    );
    const destinationAirportCommand = new ImportAirportByIcaoCommand(
      ofp.destination.icao_code,
    );
    const aircraftQuery = new GetAircraftByRegistrationQuery(ofp.aircraft.reg);
    const operatorQuery = new GetOperatorByIcaoCodeQuery(
      ofp.general.icao_airline,
    );

    const alternateCandidates = this.collectAlternateCandidates(ofp);

    const [
      [departureAirportId, destinationAirportId, aircraft, operator],
      alternateAirports,
    ] = await Promise.all([
      Promise.all([
        this.commandBus.execute(departureAirportCommand),
        this.commandBus.execute(destinationAirportCommand),
        this.queryBus.execute(aircraftQuery),
        this.queryBus.execute(operatorQuery),
      ]),
      this.resolveAlternateAirports(alternateCandidates),
    ]);

    const flightData = {
      id: flightId,
      flightNumber: `${operator.iataCode}${ofp.general.flight_number}`,
      callsign: `${operator.icaoCode}${ofp.general.flight_number}`,
      atcCallsign: `${operator.icaoCode}${ofp.general.flight_number}`,
      isEtops: ofp.general.is_etops === '1',
      aircraftId: aircraft.id,
      operatorId: operator.id,
      departureAirportId: departureAirportId,
      tracking: FlightTracking.Private,
      destinationAirportId: destinationAirportId,
      timesheet: {
        scheduled: {
          offBlockTime: this.ofpTimeToDate(ofp.times.sched_out),
          takeoffTime: this.ofpTimeToDate(ofp.times.sched_off),
          arrivalTime: this.ofpTimeToDate(ofp.times.sched_on),
          onBlockTime: this.ofpTimeToDate(ofp.times.sched_in),
        },
      },
      loadsheets: {
        preliminary: {
          flightCrew: {
            pilots: 2,
            reliefPilots: 1,
            cabinCrew: 12,
          },
          passengers: Number(ofp.weights.pax_count),
          cargo: this.ofpWeightToTons(ofp.weights.cargo),
          blockFuel: this.ofpWeightToTons(ofp.fuel.plan_ramp),
          payload: this.ofpWeightToTons(ofp.weights.payload),
          zeroFuelWeight: this.ofpWeightToTons(ofp.weights.est_zfw),
        },
      },
      alternateAirports,
    } as CreateFlightRequest;

    await this.flightsRepository.create(flightId, flightData);
    await this.flightsRepository.updateSimbriefData(
      flightId,
      {
        ofpContent: ofp.text.plan_html,
        ofpDocumentUrl: ofp.files.directory + ofp.files.pdf.link,
        runwayAnalysis: ofp.text.tlr_section,
      },
      Number(ofp.params.request_id),
      ofp.params.sequence_id,
      Number(ofp.general.gc_distance),
      Number(ofp.general.total_burn),
    );

    this.domainEvents.emit(
      new FlightWasCreatedEvent({
        flightId: flightId,
        scope: FlightEventScope.Operations,
        actorId: initiatorId,
        aircraftId: flightData.aircraftId,
      }),
    );
  }

  private collectAlternateCandidates(
    ofp: OperationalFlightPlan,
  ): AlternateAirportCandidate[] {
    const candidates: AlternateAirportCandidate[] = [];

    for (const airport of ofp.alternate ?? []) {
      if (airport?.icao_code) {
        candidates.push({
          icaoCode: airport.icao_code,
          type: AirportType.DestinationAlternate,
        });
      }
    }

    if (ofp.enroute_altn?.icao_code) {
      candidates.push({
        icaoCode: ofp.enroute_altn.icao_code,
        type: AirportType.EnrouteAlternate,
      });
    }

    if (ofp.etops?.entry?.icao_code) {
      candidates.push({
        icaoCode: ofp.etops.entry.icao_code,
        type: AirportType.EtopsEntry,
      });
    }

    if (ofp.etops?.exit?.icao_code) {
      candidates.push({
        icaoCode: ofp.etops.exit.icao_code,
        type: AirportType.EtopsExit,
      });
    }

    return candidates;
  }

  private async resolveAlternateAirports(
    candidates: AlternateAirportCandidate[],
  ): Promise<AlternateAirportRequest[]> {
    // Alternates are resolved the same way as origin/destination: any ICAO not
    // already stored is imported from SkyLink, so an unknown airport no longer
    // aborts the import.
    return Promise.all(
      candidates.map(async (candidate) => {
        const command = new ImportAirportByIcaoCommand(candidate.icaoCode);
        const airportId = await this.commandBus.execute(command);

        return { airportId, type: candidate.type };
      }),
    );
  }

  private ofpWeightToTons(input: string): number {
    return Math.round((Number(input) / 1000) * 10) / 10;
  }

  private ofpTimeToDate(input: string): Date {
    return new Date(Number(input) * 1000);
  }
}
