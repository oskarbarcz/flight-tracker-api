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
