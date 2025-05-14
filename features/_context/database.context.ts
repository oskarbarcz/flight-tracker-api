import { Given } from '@cucumber/cucumber';
import { execSync } from 'child_process';

Given('I use seed data', () => {
  execSync('npx prisma migrate reset --force --skip-generate > /dev/null');
});
