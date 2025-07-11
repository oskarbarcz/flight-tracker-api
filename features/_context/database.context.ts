import { AfterAll, BeforeAll, Given, Then } from '@cucumber/cucumber';
import { execSync } from 'child_process';

// Reset the database before running tests
BeforeAll(() => {
  execSync('npx prisma migrate reset --force --skip-generate > /dev/null');
});

// Reset the database after running tests
AfterAll(() => {
  execSync('npx prisma migrate reset --force --skip-generate > /dev/null');
});

Then('I set database to initial state', () => {
  execSync('npx prisma migrate reset --force --skip-generate > /dev/null');
});
