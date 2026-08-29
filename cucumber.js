export default {
  require: ['./features/_context/**/*.ts'],
  requireModule: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
  failFast: true,
};
