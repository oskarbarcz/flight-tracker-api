export const AircraftNotFoundError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Aircraft assigned to this flight does not exist.',
};

export const DepartureAirportNotFoundError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Departure airport on this flight does not exist.',
};

export const DestinationAirportNotFoundError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Destination airport on this flight does not exist.',
};

export const DestinationAirportSameAsDepartureAirportError = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Departure and destination airports must be different.',
};

export const FlightDoesNotExistError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Flight with given id does not exist.',
};

export const ScheduledFlightCannotBeRemoved = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Flight that has been scheduled cannot be removed.',
};

export const InvalidStatusToMarkAsReadyError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot mark flight as ready. Flight is not in created status.',
};

export const PreliminaryLoadsheetMissingError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot mark flight as ready. Preliminary loadsheet is mandatory.',
};

export const InvalidStatusToChangeScheduleError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot change flight schedule, because flight was marked as ready.',
};

export const InvalidStatusToUpdateLoadsheetError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message:
    'Cannot update preliminary loadsheet, because flight was marked as ready.',
};

export const InvalidStatusToCheckInError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot check in for flight, because flight is not ready.',
};

export const InvalidStatusToStartBoardingError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot start boarding for flight, because flight is checked in.',
};

export const InvalidStatusToFinishBoardingError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message:
    'Cannot finish boarding for flight, because flight has not started boarding.',
};

export const InvalidStatusToReportOffBlockError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot report off-block for flight that not finished boarding.',
};

export const InvalidStatusToReportTakenOffError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot report takeoff for flight that is not taxiing out.',
};

export const InvalidStatusToReportArrivedError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot report arrival for flight that is not in cruise.',
};

export const InvalidStatusToReportOnBlockError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot report on-block for flight that is not taxiing in.',
};

export const InvalidStatusToStartOffboardingError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot start offboarding for flight that is not reported on block.',
};
export const InvalidStatusToFinishOffboardingError = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message:
    'Cannot finish offboarding for flight that has not started offboarding.',
};
export const InvalidStatusToCloseFlight = {
  statusCode: 422,
  error: 'Unprocessable Content',
  message: 'Cannot close flight that is not off boarded.',
};

export const OperatorForAircraftNotFoundError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Cannot find operator declared in the request.',
};
