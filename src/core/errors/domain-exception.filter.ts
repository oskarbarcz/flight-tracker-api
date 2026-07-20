import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from './domain-error';

const reasonPhrases: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Content',
  500: 'Internal Server Error',
};

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.resolve(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    body: Record<string, unknown>;
  } {
    if (exception instanceof DomainError) {
      return {
        status: exception.status,
        body: this.canonical(exception.status, exception.message),
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    return { status, body: this.canonical(status, 'Internal server error.') };
  }

  private fromHttpException(exception: HttpException): {
    status: number;
    body: Record<string, unknown>;
  } {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { status, body: this.canonical(status, payload) };
    }

    return {
      status,
      body: { ...(payload as Record<string, unknown>), statusCode: status },
    };
  }

  private canonical(
    statusCode: number,
    message: string,
  ): Record<string, unknown> {
    return {
      statusCode,
      error: reasonPhrases[statusCode] ?? 'Error',
      message,
    };
  }
}
