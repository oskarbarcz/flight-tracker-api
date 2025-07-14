import { DocumentBuilder } from '@nestjs/swagger';
import * as pack from '../../../../package.json';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Flight Tracker API')
    .setDescription(
      [
        'REST API for managing virtual flight operations, fleet monitoring, and logbook tracking.',
        '',
        'Includes aircraft management, route planning, operator workflows, and rotation logs.',
      ].join('\n'),
    )
    .setVersion(pack.version)
    .addServer('https://api.flights.barcz.me', 'Production')
    .addServer('http://localhost:3000', 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Enter your JWT token in the format: **Bearer &lt;token&gt;**',
      },
      'access-token',
    )
    .setContact('Oskar Barcz', 'https://barcz.me', 'flight-tracker@barcz.me')
    .setLicense('Unlicense', 'https://opensource.org/licenses/Unlicense')
    .build();
}
