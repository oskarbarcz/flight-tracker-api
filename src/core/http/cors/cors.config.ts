import { INestApplication } from '@nestjs/common';

const isProduction = process.env.NODE_ENV === 'production';

export function configureCors(app: INestApplication): void {
  app.enableCors({
    origin: isProduction ? 'https://flights.barcz.me' : 'http://localhost:5173',
    credentials: true, // allow cookies / Authorization headers
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
}
