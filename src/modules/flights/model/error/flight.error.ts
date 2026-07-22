import {
  BadRequestError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class FlightNotFoundError extends NotFoundError {
  constructor() {
    super('Flight with given ID not found.');
  }
}

export class FlightDoesNotExistError extends NotFoundError {
  constructor() {
    super('Flight with given id does not exist.');
  }
}

export class FlightWithIdDoesNotExistError extends NotFoundError {
  constructor() {
    super('Flight with given ID does not exist.');
  }
}

export class FlightOfpNotFoundError extends NotFoundError {
  constructor() {
    super('Flight with given id does not exist or no OFP for flight');
  }
}

export class InvalidStatusToUpdateDepartureParkingPositionError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update departure parking position, because pilot is already checked in.',
    );
  }
}

export class InvalidStatusToUpdateDepartureRunwayError extends UnprocessableError {
  constructor() {
    super('Cannot update departure runway after takeoff.');
  }
}

export class InvalidStatusToUpdateArrivalParkingPositionError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update arrival parking position after on-block was reported.',
    );
  }
}

export class InvalidStatusToUpdateArrivalRunwayError extends UnprocessableError {
  constructor() {
    super('Cannot update arrival runway after taxiing in.');
  }
}

export class InvalidStatusToPredictOffBlockError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update predicted off-block time after flight has reported off-block.',
    );
  }
}

export class InvalidStatusToPredictTakeoffError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update predicted takeoff time after flight has reported takeoff.',
    );
  }
}

export class InvalidStatusToPredictArrivalError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update predicted arrival time after flight has reported arrival.',
    );
  }
}

export class InvalidStatusToPredictOnBlockError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update predicted on-block time after flight has reported on-block.',
    );
  }
}

export class InvalidStatusToModifyCrewError extends UnprocessableError {
  constructor() {
    super('Cannot assign or unassign crew after boarding has finished.');
  }
}

export class InconsistentFuelBlockError extends UnprocessableError {
  constructor() {
    super('Fuel breakdown block must equal the loadsheet block fuel.');
  }
}

export class InvalidStatusToCloseFlightError extends UnprocessableError {
  constructor() {
    super('Cannot close flight that is not off boarded.');
  }
}

export class FlightAircraftNotFoundError extends NotFoundError {
  constructor() {
    super('Aircraft assigned to this flight does not exist.');
  }
}

export class DepartureAirportNotFoundError extends NotFoundError {
  constructor() {
    super('Departure airport on this flight does not exist.');
  }
}

export class DestinationAirportNotFoundError extends NotFoundError {
  constructor() {
    super('Destination airport on this flight does not exist.');
  }
}

export class AlternateAirportNotFoundError extends NotFoundError {
  constructor() {
    super('Alternate airport on this flight does not exist.');
  }
}

export class OperatorForAircraftNotFoundError extends NotFoundError {
  constructor() {
    super('Cannot find operator declared in the request.');
  }
}

export class DestinationAirportSameAsDepartureAirportError extends BadRequestError {
  constructor() {
    super('Departure and destination airports must be different.');
  }
}

export class ScheduledFlightCannotBeRemovedError extends BadRequestError {
  constructor() {
    super('Flight that has been scheduled cannot be removed.');
  }
}

export class SimbriefIdNotConnectedError extends BadRequestError {
  constructor() {
    super('User has not connected SimBrief ID.');
  }
}

export class InvalidStatusToMarkAsReadyError extends UnprocessableError {
  constructor() {
    super('Cannot mark flight as ready. Flight is not in created status.');
  }
}

export class PreliminaryLoadsheetMissingError extends UnprocessableError {
  constructor() {
    super('Cannot mark flight as ready. Preliminary loadsheet is mandatory.');
  }
}

export class InvalidStatusToChangeScheduleError extends UnprocessableError {
  constructor() {
    super('Cannot change flight schedule, because flight was marked as ready.');
  }
}

export class InvalidStatusToUpdateLoadsheetError extends UnprocessableError {
  constructor() {
    super(
      'Cannot update preliminary loadsheet, because flight was marked as ready.',
    );
  }
}

export class InvalidStatusToCheckInError extends UnprocessableError {
  constructor() {
    super('Cannot check in for flight, because flight is not ready.');
  }
}

export class InvalidStatusToStartBoardingError extends UnprocessableError {
  constructor() {
    super('Cannot start boarding for flight, because flight is checked in.');
  }
}

export class InvalidStatusToFinishBoardingError extends UnprocessableError {
  constructor() {
    super(
      'Cannot finish boarding for flight, because flight has not started boarding.',
    );
  }
}

export class InvalidStatusToReportOffBlockError extends UnprocessableError {
  constructor() {
    super('Cannot report off-block for flight that not finished boarding.');
  }
}

export class InvalidStatusToReportTakenOffError extends UnprocessableError {
  constructor() {
    super('Cannot report takeoff for flight that is not taxiing out.');
  }
}

export class InvalidStatusToReportArrivedError extends UnprocessableError {
  constructor() {
    super('Cannot report arrival for flight that is not in cruise.');
  }
}

export class InvalidStatusToReportOnBlockError extends UnprocessableError {
  constructor() {
    super('Cannot report on-block for flight that is not taxiing in.');
  }
}

export class InvalidStatusToStartOffboardingError extends UnprocessableError {
  constructor() {
    super('Cannot start offboarding for flight that is not reported on block.');
  }
}

export class InvalidStatusToFinishOffboardingError extends UnprocessableError {
  constructor() {
    super(
      'Cannot finish offboarding for flight that has not started offboarding.',
    );
  }
}
