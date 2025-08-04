export const AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  jwt: {
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  airports: {
    types: {
      DEPARTURE: 'departure' as const,
      DESTINATION: 'destination' as const,
    },
  },
} as const;

export type AppConfigType = typeof AppConfig;