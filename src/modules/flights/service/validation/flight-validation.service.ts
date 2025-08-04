import { Injectable } from '@nestjs/common';
import { FlightStatus } from '../../entity/flight.entity';
import { CreateFlightRequest } from '../../dto/flight.dto';
import { AircraftService } from '../../../aircraft/service/aircraft.service';
import { OperatorsService } from '../../../operators/service/operators.service';
import {
  AircraftNotFoundError,
  OperatorNotFoundError,
  InvalidFlightDataError,
  InvalidFlightStatusTransitionError,
} from '../../../../core/errors/domain.errors';

@Injectable()
export class FlightValidationService {
  constructor(
    private readonly aircraftService: AircraftService,
    private readonly operatorsService: OperatorsService,
  ) {}

  /**
   * Validates flight creation request
   */
  async validateCreateFlight(input: CreateFlightRequest): Promise<void> {
    // Validate departure and destination are different
    if (input.departureAirportId === input.destinationAirportId) {
      throw new InvalidFlightDataError(
        'Departure and destination airports cannot be the same'
      );
    }

    // Validate aircraft exists
    if (!(await this.aircraftService.exists(input.aircraftId))) {
      throw new AircraftNotFoundError(input.aircraftId);
    }

    // Validate operator exists
    if (!(await this.operatorsService.exists(input.operatorId))) {
      throw new OperatorNotFoundError(input.operatorId);
    }
  }

  /**
   * Validates if flight can be marked as ready
   */
  validateMarkAsReady(currentStatus: FlightStatus, hasPreliminaryLoadsheet: boolean): void {
    if (currentStatus !== FlightStatus.Created) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'mark as ready',
        FlightStatus.Created
      );
    }

    if (!hasPreliminaryLoadsheet) {
      throw new InvalidFlightDataError('Preliminary loadsheet is required to mark flight as ready');
    }
  }

  /**
   * Validates if flight status allows check-in
   */
  validateCheckIn(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.Ready) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'check in',
        FlightStatus.Ready
      );
    }
  }

  /**
   * Validates if flight status allows starting boarding
   */
  validateStartBoarding(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.CheckedIn) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'start boarding',
        FlightStatus.CheckedIn
      );
    }
  }

  /**
   * Validates if flight status allows finishing boarding
   */
  validateFinishBoarding(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.BoardingStarted) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'finish boarding',
        FlightStatus.BoardingStarted
      );
    }
  }

  /**
   * Validates if flight status allows reporting off-block
   */
  validateReportOffBlock(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.BoardingFinished) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'report off-block',
        FlightStatus.BoardingFinished
      );
    }
  }

  /**
   * Validates if flight status allows reporting takeoff
   */
  validateReportTakeoff(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.TaxiingOut) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'report takeoff',
        FlightStatus.TaxiingOut
      );
    }
  }

  /**
   * Validates if flight status allows reporting arrival
   */
  validateReportArrival(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.InCruise) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'report arrival',
        FlightStatus.InCruise
      );
    }
  }

  /**
   * Validates if flight status allows reporting on-block
   */
  validateReportOnBlock(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.TaxiingIn) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'report on-block',
        FlightStatus.TaxiingIn
      );
    }
  }

  /**
   * Validates if flight status allows starting offboarding
   */
  validateStartOffboarding(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.OnBlock) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'start offboarding',
        FlightStatus.OnBlock
      );
    }
  }

  /**
   * Validates if flight status allows finishing offboarding
   */
  validateFinishOffboarding(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.OffboardingStarted) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'finish offboarding',
        FlightStatus.OffboardingStarted
      );
    }
  }

  /**
   * Validates if flight can be closed
   */
  validateCloseFlight(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.OffboardingFinished) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'close flight',
        FlightStatus.OffboardingFinished
      );
    }
  }

  /**
   * Validates if flight can be removed
   */
  validateRemoveFlight(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.Created) {
      throw new InvalidFlightDataError('Only flights with Created status can be removed');
    }
  }

  /**
   * Validates if loadsheet can be updated
   */
  validateUpdateLoadsheet(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.Created) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'update loadsheet',
        FlightStatus.Created
      );
    }
  }

  /**
   * Validates if schedule can be updated
   */
  validateUpdateSchedule(currentStatus: FlightStatus): void {
    if (currentStatus !== FlightStatus.Created) {
      throw new InvalidFlightStatusTransitionError(
        currentStatus,
        'update schedule',
        FlightStatus.Created
      );
    }
  }
}