import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

const isProduction = process.env.NODE_ENV === 'production';

export function configureHelmet(app: INestApplication): void {
  app.use(
    helmet({
      dnsPrefetchControl: { allow: false }, // prevent DNS prefetching
      frameguard: { action: 'deny' }, // prevent clickjacking
      hidePoweredBy: true, // remove X-Powered-By header
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // force HTTPS
      ieNoOpen: true, // protect against IE download attacks
      noSniff: true, // prevent MIME-type sniffing
      permittedCrossDomainPolicies: { permittedPolicies: 'none' }, // limit Adobe Flash/XPS attacks
      referrerPolicy: { policy: 'no-referrer' }, // privacy
      xssFilter: true, // sanitize input (legacy)
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'validator.swagger.io'],
          'connect-src': isProduction
            ? ["'self'", 'https://flights.barcz.me']
            : ["'self'", 'http://localhost:5173'],
        },
      },
      crossOriginEmbedderPolicy: false, // needed for Swagger UI
    }),
  );
}
