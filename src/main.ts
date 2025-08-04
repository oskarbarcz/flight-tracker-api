import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './core/http/swagger/swagger.config';
import { configureCors } from './core/http/cors/cors.config';
import { configureInputValidation } from './core/validation/validation.config';
import { configureHelmet } from './core/http/helmet/helmet.config';
import { AppConfig } from './config/app.config';

(async () => {
  const app = await NestFactory.create(AppModule);

  configureInputValidation(app);
  configureSwagger(app);
  configureHelmet(app);
  configureCors(app);

  await app.listen(AppConfig.server.port);
})();
