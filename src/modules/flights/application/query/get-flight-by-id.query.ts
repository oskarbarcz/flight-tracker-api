import {
  FlightSource,
  FlightStatus,
  FlightTracking,
} from '../../entity/flight.entity';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';
import { NotFoundException } from '@nestjs/common';
import { FlightDoesNotExistError } from '../../dto/errors.dto';
import { FullTimesheet, Schedule } from '../../entity/timesheet.entity';
import { Loadsheets } from '../../entity/loadsheet.entity';
import {
  AirportType,
  AirportWithType,
  Continent,
  Coordinates,
} from '../../../airports/entity/airport.entity';
import { GetFlightResponse } from '../../dto/flight.dto';

export class GetFlightByIdQuery extends Query<GetFlightResponse> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetFlightByIdQuery)
export class GetFlightByIdHandler implements IQueryHandler<GetFlightByIdQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(query: GetFlightByIdQuery) {
    const flight = await this.repository.findOneBy({
      id: query.flightId,
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
      source: flight.source as FlightSource,
      tracking: flight.tracking as FlightTracking,
      createdAt: flight.createdAt,
    };
  }

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
}
