import { ValidationError } from '@nestjs/common';
import { GenericBadRequestResponse } from '../response/bad-request.response';

export function createResponseFromErrorsList<T>(
  errors: ValidationError[],
): GenericBadRequestResponse<T> {
  return {
    statusCode: 400,
    message: 'Request validation failed.',
    error: 'Bad Request',
    violations: formatValidationErrors(errors) as Record<keyof T, string[]>,
  };
}

function formatValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const mappedErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    if (error.constraints) {
      mappedErrors[error.property] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      const childErrors = formatValidationErrors(error.children);
      Object.entries(childErrors).forEach(([key, value]) => {
        mappedErrors[`${error.property}.${key}`] = value;
      });
    }
  });

  return mappedErrors;
}
