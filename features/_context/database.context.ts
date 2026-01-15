import { AfterAll, BeforeAll, Then } from '@cucumber/cucumber';
import { execSync } from 'child_process';

// Reset the database before running tests
BeforeAll(() => {
  execSync('npx prisma migrate reset --force', {
    stdio: 'ignore',
  });
});

// Reset the database after running tests
AfterAll(() => {
  execSync('npx prisma migrate reset --force', {
    stdio: 'ignore',
  });
});

Then('I set database to initial state', () => {
  execSync('npx prisma migrate reset --force', {
    stdio: 'ignore',
  });
});
