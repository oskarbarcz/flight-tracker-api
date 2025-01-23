export const AircraftInUseError = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Cannot remove aircraft that is used by any of flights.',
};

export const OperatorForAircraftNotFoundError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Cannot find operator declared in the request.',
};
