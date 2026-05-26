import { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const isProduction = process.env.NODE_ENV === 'production';
const origin = isProduction
  ? 'https://flights.barcz.me'
  : 'http://localhost:5173';

export function configureCors(app: INestApplication): void {
  app.enableCors({
    origin,
    credentials: true, // allow cookies / Authorization headers
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'X-Total-Count',
  });
}

export function getWebsocketCorsOptions(): CorsOptions {
  return { origin, credentials: true };
}
