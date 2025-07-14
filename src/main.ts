import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { createResponseFromErrorsList } from './core/validation/exception.factory';
import { createSwaggerConfig } from './core/http/swagger/swagger.config';

(async () => {
  const app = await NestFactory.create(AppModule);

  configureGlobalPipes(app);
  configureSwagger(app);
  app.enableCors();

  await app.listen(3000);
})();

function configureGlobalPipes(app: INestApplication): void {
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

function configureSwagger(app: INestApplication): void {
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
