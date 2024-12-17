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
