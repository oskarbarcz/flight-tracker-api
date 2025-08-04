/**
 * Base domain error class for consistent error handling
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Flight domain specific errors
 */
export class FlightNotFoundError extends DomainError {
  readonly code = 'FLIGHT_NOT_FOUND';
  
  constructor(id: string) {
    super(`Flight with id ${id} not found`);
  }
}

export class InvalidFlightStatusTransitionError extends DomainError {
  readonly code = 'INVALID_STATUS_TRANSITION';
  
  constructor(currentStatus: string, action: string, requiredStatus?: string) {
    const message = requiredStatus 
      ? `Cannot ${action} flight with status ${currentStatus}. Required status: ${requiredStatus}`
      : `Cannot ${action} flight with status ${currentStatus}`;
    super(message);
  }
}

export class AircraftNotFoundError extends DomainError {
  readonly code = 'AIRCRAFT_NOT_FOUND';
  
  constructor(id: string) {
    super(`Aircraft with id ${id} not found`);
  }
}

export class OperatorNotFoundError extends DomainError {
  readonly code = 'OPERATOR_NOT_FOUND';
  
  constructor(id: string) {
    super(`Operator with id ${id} not found`);
  }
}

export class AirportNotFoundError extends DomainError {
  readonly code = 'AIRPORT_NOT_FOUND';
  
  constructor(id: string, type?: 'departure' | 'destination') {
    const prefix = type ? `${type.charAt(0).toUpperCase() + type.slice(1)} airport` : 'Airport';
    super(`${prefix} with id ${id} not found`);
  }
}

export class InvalidFlightDataError extends DomainError {
  readonly code = 'INVALID_FLIGHT_DATA';
  
  constructor(reason: string) {
    super(`Invalid flight data: ${reason}`);
  }
}

/**
 * Auth domain specific errors
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  
  constructor() {
    super('Invalid credentials provided');
  }
}

export class TokenExpiredError extends DomainError {
  readonly code = 'TOKEN_EXPIRED';
  
  constructor() {
    super('Token has expired');
  }
}

export class SessionNotFoundError extends DomainError {
  readonly code = 'SESSION_NOT_FOUND';
  
  constructor(sessionId: string) {
    super(`Session ${sessionId} not found`);
  }
}