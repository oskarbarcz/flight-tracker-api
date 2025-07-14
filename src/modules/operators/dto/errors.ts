export const OperatorDoesNotExistsError = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Operator with given id does not exist.',
};

export const OperatorAlreadyExistsError = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Operator with given ICAO code already exists.',
};

export const OperatorContainsFlightsError = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Operator cannot be deleted because it has flights scheduled.',
};

export const OperatorContainsAircraftError = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Operator cannot be deleted because it has aircraft assigned.',
};
