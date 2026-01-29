import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetUserSimbriefIdQuery } from '../../../users/application/query/get-user-simbrief-id.query';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';
import { GetAirportByIcaoCodeQuery } from '../../../airports/application/query/get-airport-by-icao-code.query';
import { GetAircraftByRegistrationQuery } from '../../../aircraft/application/query/get-aircraft-by-registration.query';
import { GetOperatorByIcaoCodeQuery } from '../../../operators/application/query/get-operator-by-icao-code.query';
import { FlightSource, FlightTracking } from '../../entity/flight.entity';

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
    private readonly simbriefClient: SimbriefClient,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateFlightFromSimbriefCommand): Promise<void> {
    const { flightId, initiatorId } = command;

    const getSimbriefIdQuery = new GetUserSimbriefIdQuery(initiatorId);
    const simbriefId = await this.queryBus.execute(getSimbriefIdQuery);

    if (simbriefId === null) {
      throw new BadRequestException('User has not connected SimBrief ID.');
    }

    const ofp = await this.simbriefClient.getOperationalFlightPlan(simbriefId);

    const departureAirportQuery = new GetAirportByIcaoCodeQuery(
      ofp.origin.icao_code,
    );
    const destinationAirportQuery = new GetAirportByIcaoCodeQuery(
      ofp.destination.icao_code,
    );
    const aircraftQuery = new GetAircraftByRegistrationQuery(ofp.aircraft.reg);
    const operatorQuery = new GetOperatorByIcaoCodeQuery(
      ofp.general.icao_airline,
    );

    const [departureAirport, destinationAirport, aircraft, operator] =
      await Promise.all([
        this.queryBus.execute(departureAirportQuery),
        this.queryBus.execute(destinationAirportQuery),
        this.queryBus.execute(aircraftQuery),
        this.queryBus.execute(operatorQuery),
      ]);

    const flightData = {
      id: flightId,
      flightNumber: `${operator.iataCode}${ofp.general.flight_number}`,
      callsign: `${operator.icaoCode}${ofp.general.flight_number}`,
      atcCallsign: `${operator.iataCode}${ofp.general.flight_number}`,
      aircraftId: aircraft.id,
      operatorId: operator.id,
      departureAirportId: departureAirport.id,
      tracking: FlightTracking.Private,
      destinationAirportId: destinationAirport.id,
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
    };

    await this.flightsRepository.create(
      flightId,
      flightData,
      FlightSource.Simbrief,
    );

    const event: NewFlightEvent = {
      flightId: flightId,
      type: FlightEventType.FlightWasCreated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasCreated, event);
  }

  private ofpWeightToTons(input: string): number {
    return Math.round((Number(input) / 1000) * 10) / 10;
  }

  private ofpTimeToDate(input: string): Date {
    return new Date(Number(input) * 1000);
  }
}
