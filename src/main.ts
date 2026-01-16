import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './core/http/swagger/swagger.config';
import { configureCors } from './core/http/cors/cors.config';
import { configureInputValidation } from './core/validation/validation.config';
import { configureHelmet } from './core/http/helmet/helmet.config';

(async () => {
  const app = await NestFactory.create(AppModule);

  configureInputValidation(app);
  configureSwagger(app);
  configureHelmet(app);
  configureCors(app);

  const server = await app.listen(3000);

  server.keepAliveTimeout = 15 * 1000;
  server.headersTimeout = 15 * 1000;
})();
