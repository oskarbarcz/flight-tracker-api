import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Flight, FlightStatus } from './entities/flight.entity';
import { CreateFlightRequest } from './dto/create-flight.dto';
import {
  AirportType,
  AirportWithType,
} from '../airports/entities/airport.entity';
import { FullTimesheet, Schedule } from './entities/timesheet.entity';
import { AirportsService } from '../airports/airports.service';
import { FlightsRepository } from './flights.repository';
import { AircraftService } from '../aircraft/aircraft.service';
import {
  AircraftNotFoundError,
  DepartureAirportNotFoundError,
  DestinationAirportNotFoundError,
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
  OperatorForAircraftNotFoundError,
  ScheduledFlightCannotBeRemoved,
} from './dto/errors.dto';
import { OperatorsService } from '../operators/operators.service';
import { EventType, FlightWasCheckedInPayload } from '../common/events/event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FlightsService {
  constructor(
    private readonly airportsService: AirportsService,
    private readonly aircraftService: AircraftService,
    private readonly flightsRepository: FlightsRepository,
    private readonly operatorsService: OperatorsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async find(id: string): Promise<Flight> {
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
      timesheet: flight.timesheet as FullTimesheet,
      aircraft: flight.aircraft,
      operator: flight.operator,
      airports: flight.airports.map(
        (airportOnFlight): AirportWithType => ({
          ...airportOnFlight.airport,
          type: airportOnFlight.airportType as AirportType,
        }),
      ),
    };
  }

  async findAll(): Promise<Flight[]> {
    const flights = await this.flightsRepository.findAll();

    return flights.map(
      (flight): Flight => ({
        id: flight.id,
        flightNumber: flight.flightNumber,
        callsign: flight.callsign,
        status: flight.status as FlightStatus,
        timesheet: flight.timesheet as FullTimesheet,
        aircraft: flight.aircraft,
        operator: flight.operator,
        airports: flight.airports.map(
          (airportOnFlight): AirportWithType => ({
            ...airportOnFlight.airport,
            type: airportOnFlight.airportType as AirportType,
          }),
        ),
      }),
    );
  }

  async create(input: CreateFlightRequest): Promise<Flight> {
    if (input.departureAirportId === input.destinationAirportId) {
      throw new BadRequestException(
        DestinationAirportSameAsDepartureAirportError,
      );
    }

    if (!(await this.aircraftService.exists(input.aircraftId))) {
      throw new NotFoundException(AircraftNotFoundError);
    }

    if (!(await this.airportsService.exists(input.departureAirportId))) {
      throw new NotFoundException(DepartureAirportNotFoundError);
    }

    if (!(await this.airportsService.exists(input.destinationAirportId))) {
      throw new NotFoundException(DestinationAirportNotFoundError);
    }

    if (!(await this.operatorsService.exists(input.operatorId))) {
      throw new NotFoundException(OperatorForAircraftNotFoundError);
    }

    const flight = await this.flightsRepository.create(input);

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign,
      status: flight.status as FlightStatus,
      timesheet: flight.timesheet as FullTimesheet,
      aircraft: flight.aircraft,
      operator: flight.operator,
      airports: flight.airports.map(
        (airportOnFlight): AirportWithType => ({
          ...airportOnFlight.airport,
          type: airportOnFlight.airportType as AirportType,
        }),
      ),
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

  async markAsReady(id: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(InvalidStatusToMarkAsReadyError);
    }

    await this.flightsRepository.updateStatus(id, FlightStatus.Ready);
  }

  async updateScheduledTimesheet(
    id: string,
    schedule: Schedule,
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
  }

  async checkInPilot(
    id: string,
    estimatedSchedule: Schedule,
    userId: string,
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

    const event: FlightWasCheckedInPayload = { flightId: id, userId: userId };
    this.eventEmitter.emit(EventType.FlightWasCheckedIn, event);
  }

  async startBoarding(id: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.CheckedIn) {
      throw new UnprocessableEntityException(InvalidStatusToStartBoardingError);
    }

    await this.flightsRepository.updateStatus(id, FlightStatus.BoardingStarted);
  }

  async finishBoarding(id: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.BoardingStarted) {
      throw new UnprocessableEntityException(
        InvalidStatusToFinishBoardingError,
      );
    }

    await this.flightsRepository.updateStatus(
      id,
      FlightStatus.BoardingFinished,
    );
  }

  async reportOffBlock(id: string): Promise<void> {
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
  }

  async reportTakeoff(id: string): Promise<void> {
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
  }

  async reportArrival(id: string): Promise<void> {
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
  }

  async reportOnBlock(id: string): Promise<void> {
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
  }

  async reportOffboardingStarted(id: string): Promise<void> {
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
  }

  async reportOffboardingFinished(id: string): Promise<void> {
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
  }

  async close(id: string): Promise<void> {
    const flight = await this.find(id);

    if (!flight) {
      throw new NotFoundException(InvalidStatusToCloseFlight);
    }

    if (flight.status !== FlightStatus.OffboardingFinished) {
      throw new UnprocessableEntityException(InvalidStatusToCloseFlight);
    }

    await this.flightsRepository.updateStatus(id, FlightStatus.Closed);
  }
}
