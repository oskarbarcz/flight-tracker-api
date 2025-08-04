import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
  HttpException,
} from '@nestjs/common';
import {
  DomainError,
  FlightNotFoundError,
  InvalidFlightStatusTransitionError,
  InvalidFlightDataError,
  AircraftNotFoundError,
  OperatorNotFoundError,
  AirportNotFoundError,
  InvalidCredentialsError,
  TokenExpiredError,
  SessionNotFoundError,
} from '../../../core/errors/domain.errors';

/**
 * Maps domain errors to appropriate HTTP exceptions
 */
export function mapDomainErrorToHttpException(error: DomainError): HttpException {
  switch (error.constructor) {
    case FlightNotFoundError:
    case AircraftNotFoundError:
    case OperatorNotFoundError:
    case AirportNotFoundError:
    case SessionNotFoundError:
      return new NotFoundException(error.message);

    case InvalidFlightDataError:
    case InvalidCredentialsError:
      return new BadRequestException(error.message);

    case InvalidFlightStatusTransitionError:
    case TokenExpiredError:
      return new UnprocessableEntityException(error.message);

    default:
      // For unknown domain errors, return a generic bad request
      return new BadRequestException(error.message);
  }
}

/**
 * Helper function to handle domain errors in service methods
 */
export function handleDomainError(error: unknown): never {
  if (error instanceof DomainError) {
    throw mapDomainErrorToHttpException(error);
  }
  throw error;
}