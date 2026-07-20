export abstract class DomainError extends Error {
  abstract readonly status: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends DomainError {
  readonly status = 400;
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
}

export class NotFoundError extends DomainError {
  readonly status = 404;
}

export class ConflictError extends DomainError {
  readonly status = 409;
}

export class UnprocessableError extends DomainError {
  readonly status = 422;
}
