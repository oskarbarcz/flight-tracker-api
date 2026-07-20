import { INestApplication } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';

export function configureExceptionHandling(app: INestApplication): void {
  app.useGlobalFilters(new DomainExceptionFilter());
}
