import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as pack from '../package.json';
import { createResponseFromErrorsList } from './common/validation/exception.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(createResponseFromErrorsList(errors)),
    }),
  );

  // Add swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Flight Tracker API')
    .setDescription(
      'API for flight tracker app that allows fleet management, flight plan operations and logbook monitoring',
    )
    .setVersion(pack.version)
    .addServer('http://localhost', 'local')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
