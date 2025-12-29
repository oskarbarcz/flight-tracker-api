import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FlightStatus } from '../entity/flight.entity';
import { CreateFlightRequest, GetFlightResponse } from '../dto/flight.dto';
import {
  AirportType,
  AirportWithType,
  Continent,
  Coordinates,
} from '../../airports/entity/airport.entity';
import { FullTimesheet, Schedule } from '../entity/timesheet.entity';
import { FlightsRepository } from '../repository/flights.repository';
import { AircraftService } from '../../aircraft/service/aircraft.service';
import {
  AircraftNotFoundError,
  DestinationAirportSameAsDepartureAirportError,
  FlightDoesNotExistError,
  InvalidStatusToChangeScheduleError,
  InvalidStatusToCheckInError,
  InvalidStatusToCloseFlight,
  InvalidStatusToFinishBoardingError,
  InvalidStatusToFinishOffboardingError,
  InvalidStatusToMarkAsReadyError,
  InvalidStatusToReportArrivedError,
  InvalidStatusToReportOffBlockError,
  InvalidStatusToReportOnBlockError,
  InvalidStatusToReportTakenOffError,
  InvalidStatusToStartBoardingError,
  InvalidStatusToStartOffboardingError,
  InvalidStatusToUpdateLoadsheetError,
  OperatorForAircraftNotFoundError,
  PreliminaryLoadsheetMissingError,
  ScheduledFlightCannotBeRemoved,
} from '../dto/errors.dto';
import { OperatorsService } from '../../operators/service/operators.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Loadsheet, Loadsheets } from '../entity/loadsheet.entity';
import { FlightEventScope } from '../entity/event.entity';
import { NewFlightEvent } from '../dto/event.dto';
import { JwtUser } from '../../auth/dto/jwt-user.dto';
import { FlightEventType } from '../../../core/events/flight';

@Injectable()
export class FlightsService {
  constructor(
    private readonly aircraftService: AircraftService,
    private readonly flightsRepository: FlightsRepository,
    private readonly operatorsService: OperatorsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private convertSchedule = (
    schedule: Schedule | Partial<Schedule> | undefined,
  ): Schedule | Partial<Schedule> | undefined => {
    if (!schedule) return undefined;

    return {
      offBlockTime: schedule.offBlockTime
        ? new Date(schedule.offBlockTime)
        : null,
      takeoffTime: schedule.takeoffTime ? new Date(schedule.takeoffTime) : null,
      arrivalTime: schedule.arrivalTime ? new Date(schedule.arrivalTime) : null,
      onBlockTime: schedule.onBlockTime ? new Date(schedule.onBlockTime) : null,
    };
  };

  private convertTimesheetDates(timesheet: FullTimesheet): FullTimesheet {
    const result: FullTimesheet = {};

    if (timesheet.scheduled) {
      result.scheduled = this.convertSchedule(timesheet.scheduled) as Schedule;
    }

    if (timesheet.estimated) {
      result.estimated = this.convertSchedule(timesheet.estimated) as Schedule;
    }

    if (timesheet.actual) {
      result.actual = this.convertSchedule(
        timesheet.actual,
      ) as Partial<Schedule>;
    }

    return result;
  }

  async find(id: string): Promise<GetFlightResponse> {
    const flight = await this.flightsRepository.findOneBy({
      id,
    });

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign,
      status: flight.status as FlightStatus,
      timesheet: this.convertTimesheetDates(flight.timesheet as FullTimesheet),
      loadsheets: flight.loadsheets as unknown as Loadsheets,
      aircraft: flight.aircraft,
      operator: flight.operator,
      airports: flight.airports.map(
        (airportOnFlight): AirportWithType => ({
          ...airportOnFlight.airport,
          location: airportOnFlight.airport.location as unknown as Coordinates,
          continent: airportOnFlight.airport.continent as Continent,
          type: airportOnFlight.airportType as AirportType,
        }),
      ),
      isFlightDiverted: flight.isFlightDiverted,
      rotationId: flight.rotationId,
      createdAt: flight.createdAt,
    };
  }

  async findAll(): Promise<GetFlightResponse[]> {
    const flights = await this.flightsRepository.findAll();

    return flights.map(
      (flight): GetFlightResponse => ({
        id: flight.id,
        flightNumber: flight.flightNumber,
        callsign: flight.callsign,
        status: flight.status as FlightStatus,
        timesheet: flight.timesheet as FullTimesheet,
        loadsheets: flight.loadsheets as unknown as Loadsheets,
        aircraft: flight.aircraft,
        operator: flight.operator,
        airports: flight.airports.map(
          (airportOnFlight): AirportWithType => ({
            ...airportOnFlight.airport,
            location: airportOnFlight.airport
              .location as unknown as Coordinates,
            continent: airportOnFlight.airport.continent as Continent,
            type: airportOnFlight.airportType as AirportType,
          }),
        ),
        isFlightDiverted: flight.isFlightDiverted,
        rotationId: flight.rotationId,
        createdAt: flight.createdAt,
      }),
    );
  }

  async create(
    input: CreateFlightRequest,
    initiator: JwtUser,
  ): Promise<GetFlightResponse> {
    if (input.departureAirportId === input.destinationAirportId) {
      throw new BadRequestException(
        DestinationAirportSameAsDepartureAirportError,
      );
    }

    if (!(await this.aircraftService.exists(input.aircraftId))) {
      throw new NotFoundException(AircraftNotFoundError);
    }

    if (!(await this.operatorsService.exists(input.operatorId))) {
      throw new NotFoundException(OperatorForAircraftNotFoundError);
    }

    const flight = await this.flightsRepository.create(input);

    const event: NewFlightEvent = {
      flightId: flight.id,
      rotationId: flight.rotationId,
      type: FlightEventType.FlightWasCreated,
      scope: FlightEventScope.Operations,
      actorId: initiator.sub,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasCreated, event);

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign,
      status: flight.status as FlightStatus,
      timesheet: flight.timesheet as FullTimesheet,
      loadsheets: flight.loadsheets as unknown as Loadsheets,
      aircraft: flight.aircraft,
      operator: flight.operator,
      airports: flight.airports.map(
        (airportOnFlight): AirportWithType => ({
          ...airportOnFlight.airport,
          location: airportOnFlight.airport.location as unknown as Coordinates,
          continent: airportOnFlight.airport.continent as Continent,
          type: airportOnFlight.airportType as AirportType,
        }),
      ),
      isFlightDiverted: flight.isFlightDiverted,
      rotationId: flight.rotationId,
      createdAt: flight.createdAt,
    };
  }

  async remove(id: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new BadRequestException(ScheduledFlightCannotBeRemoved);
    }

    await this.flightsRepository.remove(id);
  }

  async markAsReady(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(InvalidStatusToMarkAsReadyError);
    }

    if (!flight.loadsheets.preliminary) {
      throw new UnprocessableEntityException(PreliminaryLoadsheetMissingError);
    }

    await this.flightsRepository.updateStatus(id, FlightStatus.Ready);
    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.FlightWasReleased,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasReleased, event);
  }

  async updatePreliminaryLoadsheet(
    id: string,
    loadsheet: Loadsheet,
    initiatorId: string,
  ): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(
        InvalidStatusToUpdateLoadsheetError,
      );
    }

    const loadsheets: Loadsheets = { preliminary: loadsheet, final: null };
    await this.flightsRepository.updateLoadsheets(id, loadsheets);
    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.PreliminaryLoadsheetWasUpdated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(
      FlightEventType.PreliminaryLoadsheetWasUpdated,
      event,
    );
  }

  async updateScheduledTimesheet(
    id: string,
    schedule: Schedule,
    initiatorId: string,
  ): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(
        InvalidStatusToChangeScheduleError,
      );
    }

    const timesheet: FullTimesheet = { scheduled: schedule };
    await this.flightsRepository.updateTimesheet(id, timesheet);
    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.ScheduledTimesheetWasUpdated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.ScheduledTimesheetWasUpdated, event);
  }

  async checkInPilot(
    id: string,
    estimatedSchedule: Schedule,
    initiatorId: string,
  ): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Ready) {
      throw new UnprocessableEntityException(InvalidStatusToCheckInError);
    }

    const timesheet = flight.timesheet;
    timesheet.estimated = estimatedSchedule;

    await this.flightsRepository.updateStatus(id, FlightStatus.CheckedIn);
    await this.flightsRepository.updateTimesheet(id, timesheet);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.PilotCheckedIn,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.PilotCheckedIn, event);
  }

  async startBoarding(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.CheckedIn) {
      throw new UnprocessableEntityException(InvalidStatusToStartBoardingError);
    }

    await this.flightsRepository.updateStatus(id, FlightStatus.BoardingStarted);
    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.BoardingWasStarted,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.BoardingWasStarted, event);
  }

  async finishBoarding(
    id: string,
    finalLoadsheet: Loadsheet,
    initiatorId: string,
  ): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.BoardingStarted) {
      throw new UnprocessableEntityException(
        InvalidStatusToFinishBoardingError,
      );
    }

    await Promise.all([
      await this.flightsRepository.updateLoadsheets(id, {
        preliminary: flight.loadsheets.preliminary,
        final: finalLoadsheet,
      }),
      await this.flightsRepository.updateStatus(
        id,
        FlightStatus.BoardingFinished,
      ),
    ]);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.BoardingWasFinished,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.BoardingWasFinished, event);
  }

  async reportOffBlock(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.BoardingFinished) {
      throw new UnprocessableEntityException(
        InvalidStatusToReportOffBlockError,
      );
    }

    const timesheet = flight.timesheet;
    timesheet.actual = {
      offBlockTime: new Date(),
      takeoffTime: null,
      arrivalTime: null,
      onBlockTime: null,
    };

    await this.flightsRepository.updateStatus(id, FlightStatus.TaxiingOut);
    await this.flightsRepository.updateTimesheet(id, timesheet);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.OffBlockWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OffBlockWasReported, event);
  }

  async reportTakeoff(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.TaxiingOut) {
      throw new UnprocessableEntityException(
        InvalidStatusToReportTakenOffError,
      );
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.takeoffTime = new Date();

    await this.flightsRepository.updateStatus(id, FlightStatus.InCruise);
    await this.flightsRepository.updateTimesheet(id, timesheet);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.TakeoffWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.TakeoffWasReported, event);
  }

  async reportArrival(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.InCruise) {
      throw new UnprocessableEntityException(InvalidStatusToReportArrivedError);
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.arrivalTime = new Date();

    await this.flightsRepository.updateStatus(id, FlightStatus.TaxiingIn);
    await this.flightsRepository.updateTimesheet(id, timesheet);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.ArrivalWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.ArrivalWasReported, event);
  }

  async reportOnBlock(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.TaxiingIn) {
      throw new UnprocessableEntityException(InvalidStatusToReportOnBlockError);
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.onBlockTime = new Date();

    await this.flightsRepository.updateStatus(id, FlightStatus.OnBlock);
    await this.flightsRepository.updateTimesheet(id, timesheet);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.OnBlockWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OnBlockWasReported, event);
  }

  async reportOffboardingStarted(
    id: string,
    initiatorId: string,
  ): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.OnBlock) {
      throw new UnprocessableEntityException(
        InvalidStatusToStartOffboardingError,
      );
    }

    await this.flightsRepository.updateStatus(
      id,
      FlightStatus.OffboardingStarted,
    );

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.OffboardingWasStarted,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OffboardingWasStarted, event);
  }

  async reportOffboardingFinished(
    id: string,
    initiatorId: string,
  ): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.OffboardingStarted) {
      throw new UnprocessableEntityException(
        InvalidStatusToFinishOffboardingError,
      );
    }

    await this.flightsRepository.updateStatus(
      id,
      FlightStatus.OffboardingFinished,
    );

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.OffboardingWasFinished,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OffboardingWasFinished, event);
  }

  async close(id: string, initiatorId: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(InvalidStatusToCloseFlight);
    }

    if (flight.status !== FlightStatus.OffboardingFinished) {
      throw new UnprocessableEntityException(InvalidStatusToCloseFlight);
    }

    await this.flightsRepository.updateStatus(id, FlightStatus.Closed);

    const event: NewFlightEvent = {
      flightId: id,
      rotationId: flight.rotationId,
      type: FlightEventType.FlightWasClosed,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasClosed, event);
  }
}
