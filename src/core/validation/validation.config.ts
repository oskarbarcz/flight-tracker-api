import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { createResponseFromErrorsList } from './exception.factory';

export function configureInputValidation(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(createResponseFromErrorsList(errors)),
    }),
  );
}