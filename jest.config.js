module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    '^.+/node_modules/@faker-js/faker/.+\\.js$': [
      'ts-jest',
      {
        tsconfig: { allowJs: true, module: 'commonjs' },
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!@faker-js/faker/)'],
  moduleNameMapper: {
    '^prisma/(.*)$': '<rootDir>/prisma/$1',
  },
};
